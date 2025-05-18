import express from 'express'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: Missing Supabase configuration in .env file')
  process.exit(1)
}

const app = express()
app.use(cors())
app.use(express.json())
const PORT = process.env.PORT || 3001

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Middleware: проверка авторизации и прав администратора
const requireAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Authorization token required' })
  }

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
    if (error || !user) throw error || new Error('Invalid user')

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.is_admin) throw profileError || new Error('Admin privileges required')

    next()
  } catch (err) {
    console.error('Admin check failed:', err)
    return res.status(403).json({ error: 'Admin access denied' })
  }
}

// POST /orders — создание заказа
app.post('/orders', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ error: 'Authorization token required' })

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
    if (userError || !user) throw new Error('Invalid user')

    const {
      items,           // [{ product_id, quantity }]
      shipping_info,
      payment_info
    } = req.body

    if (!items?.length || !shipping_info || !payment_info) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Подсчёт total_price
    let total_price = 0
    for (const item of items) {
      const { data: product, error: productError } = await supabaseAdmin
        .from('products')
        .select('price')
        .eq('id', item.product_id)
        .single()

      if (productError || !product) throw new Error('Invalid product')
      total_price += product.price * item.quantity
    }

    // Создание заказа
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: user.id,
        total_price,
        status: 'placed',
        shipping_info,
        payment_info
      })
      .select('id')
      .single()

    if (orderError) throw orderError

    // Добавление позиций заказа
    const orderItemsData = items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity
    }))

    const { error: orderItemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItemsData)

    if (orderItemsError) throw orderItemsError

    res.status(201).json({ orderId: order.id })
  } catch (err) {
    console.error('Error creating order:', err)
    res.status(500).json({ error: err.message })
  }
})

// Получение списка пользователей (только для админов)
app.get('/admin/users', requireAdmin, async (req, res) => {
  try {
    const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers()
    if (authError) throw authError

    const { data: publicUsers, error: publicError } = await supabaseAdmin
      .from('users')
      .select('*')

    if (publicError) throw publicError

    const combinedUsers = users.map(authUser => {
      const publicData = publicUsers.find(u => u.id === authUser.id) || {}
      return { ...authUser, ...publicData }
    })

    res.json(combinedUsers)
  } catch (err) {
    console.error('Error fetching users:', err)
    res.status(500).json({ error: err.message })
  }
})
// Получение всех заказов с товарами (только для админов)
app.get('/admin/orders', requireAdmin, async (req, res) => {
  try {
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select(`
        id,
        user_id,
        total_price,
        status,
        created_at,
        shipping_info,
        payment_info,
        order_items (
          product_id,
          quantity,
          products ( name, price )
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json(orders)
  } catch (err) {
    console.error('Error fetching orders:', err)
    res.status(500).json({ error: err.message })
  }
})

// Обновление статуса заказа (только для админов)
app.patch('/admin/orders/:id/status', requireAdmin, async (req, res) => {
  const { id } = req.params
  const { status } = req.body

  if (!status) {
    return res.status(400).json({ error: 'Status is required' })
  }

  try {
    const { error } = await supabaseAdmin
      .from('orders')
      .update({ status })
      .eq('id', id)

    if (error) throw error

    res.sendStatus(204) // Успешное обновление, без тела
  } catch (err) {
    console.error('Error updating order status:', err)
    res.status(500).json({ error: err.message })
  }
})

// Простой роут для теста, что сервер живой
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})
// Переключение статуса администратора
app.post('/admin/users/:id/toggle-admin', requireAdmin, async (req, res) => {
  const { id } = req.params
  try {
    const { data: user, error: selectError } = await supabaseAdmin
      .from('users')
      .select('is_admin')
      .eq('id', id)
      .single()

    if (selectError) throw selectError

    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ is_admin: !user.is_admin })
      .eq('id', id)

    if (updateError) throw updateError

    res.sendStatus(204)
  } catch (err) {
    console.error('Error toggling admin:', err)
    res.status(500).json({ error: err.message })
  }
})

// ——— Batch update products — (PUT /admin/products/batch)
app.put('/admin/products/batch', requireAdmin, async (req, res) => {
  // body: [{ id, name?, price?, stock?, category_id?, image_url?, description? }, ...]
  const updates = req.body
  try {
    // Supabase не поддерживает batch update одной командой,
    // поэтому идём по элементам в цикле:
    for (const p of updates) {
      const { id, ...changes } = p
      await supabaseAdmin
        .from('products')
        .update(changes)
        .eq('id', id)
    }
    res.sendStatus(204)
  } catch (err) {
    console.error('Batch update error:', err)
    res.status(500).json({ error: err.message })
  }
})

// ——— Batch create products — (POST /admin/products/batch)
app.post('/admin/products/batch', requireAdmin, async (req, res) => {
  // body: [{ name, price, stock, category_id, image_url, description }, ...]
  const creations = req.body
  try {
    const { error } = await supabaseAdmin
      .from('products')
      .insert(creations)
    if (error) throw error
    res.sendStatus(201)
  } catch (err) {
    console.error('Batch create error:', err)
    res.status(500).json({ error: err.message })
  }
})

app.listen(PORT, () => {
  console.log(`✅ Admin server running on http://localhost:${PORT}`)
})


