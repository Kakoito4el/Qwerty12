import { supabase } from './supabase';
import { CartItem } from '../types/supabase';

export async function handleCheckout(userId: string, items: CartItem[]) {
  
  console.log('🧪 handleCheckout запустился');
  if (!items.length) {
    throw new Error('Корзина пуста, нельзя оформить заказ');
  }

  // Вычисляем общую сумму
  const total_price = items.reduce((sum, item) => {
    const price = typeof item.price === 'number' ? item.price : 0;
    return sum + price * item.quantity;
  }, 0);
const {
  data: { user },
  error: userError,
} = await supabase.auth.getUser();

if (userError || !user) {
  throw new Error('Пользователь не авторизован');
}

console.log('auth.uid():', user.id);
  // Создаем заказ
const { data: orderData, error: orderError } = await supabase
  .from('orders')
  .insert([{ user_id: user.id, total_price }])
  .select()
  .single();

console.log('order.user_id:', orderData.user_id);

  if (orderError || !orderData) {
    throw new Error('Ошибка создания заказа: ' + orderError?.message);
  }

  // Добавляем все товары из корзины
for (const item of items) {
  const isBuild = !!item.isBuild; // строгое булево

const payload = {
  order_id: orderData.id,
  quantity: item.quantity,
  price: item.price * item.quantity,
  unit_price: item.price,
  product_id: isBuild ? null : item.id,
  build_id: isBuild ? item.id : null,
};

// 🔍 Защита от некорректного ID сборки
if (isBuild && (!item.id || typeof item.id !== 'string')) {
  console.error('❌ Некорректный ID сборки:', item);
  throw new Error('Некорректный ID сборки');
}

// Валидация: ровно одно из двух должно быть заполнено
if (!payload.product_id && !payload.build_id) {
  throw new Error('❌ Ни product_id, ни build_id не заданы!');
}
}

  return orderData.id;
}