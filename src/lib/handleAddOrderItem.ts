// src/lib/handleAddOrderItem.ts
import { supabase } from './supabase';

export async function handleAddOrderItem({
  orderId,
  productId = null,
  pcBuildId = null,
  quantity = 1,
  price,
  unitPrice
}: {
  orderId: string
  productId?: string | null
  pcBuildId?: string | null
  quantity: number
  price: number
  unitPrice: number
}) {
  const { data, error } = await supabase
    .from('order_items')
    .insert([
      {
        order_id: orderId,
        product_id: productId,
        build_id: pcBuildId,

        quantity,
        price,
        unit_price: unitPrice
      }
    ])

  if (error) {
    console.error('Ошибка при вставке в order_items:', error)
    throw error
  }

  return data
}
