import { supabase } from './supabase';
import { Product } from '../types/supabase';
import { v4 as uuidv4 } from 'uuid';

const DEFAULT_PC_BUILD_IMAGE =
  'https://c.dns-shop.kz/thumb/st4/fit/500/500/74b1d82cd8ea4b500778059a46043ad8/f5790e38bf4e4b06921b9b722706e72f5efad395c9ed5572c676250b98910f6c.jpg.webp';

export async function createBuildAndAddToCart(
  products: Product[],
  addItem: (item: any, quantity: number) => void
) {
  // Получить user ID
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) throw new Error('Пользователь не авторизован');

  const component_ids = products.map(p => p.id);
  const buildId = uuidv4(); // Уникальный ID для каждой новой сборки

  // Расчёт общей цены
  const totalPrice = products.reduce((sum, p) => sum + p.price, 0);

  // Вставка сборки в таблицу pc_builds
  const { error: insertError } = await supabase.from('pc_builds').insert([
    {
      id: buildId,
      user_id: user.id,
      component_ids,
    },
  ]);

  if (insertError) throw insertError;

  // 🔥 Очистка предыдущей сборки из localStorage (если она дублируется в корзине)
  // Это только в том случае, если addItem проверяет по ID и не добавляет одинаковые товары
  // Альтернатива: можно проверять уникальность через uuid каждый раз (мы уже это делаем)

  // ✅ Добавление "виртуального товара-сборки" в корзину
  addItem(
    {
      id: buildId, // ID сборки
      name: 'Сборка ПК',
      price: totalPrice,
      image_url: DEFAULT_PC_BUILD_IMAGE,
      isBuild: true,
      buildId: buildId, // 💥 добавь это
      components: products,
    },
    1
  );
}
