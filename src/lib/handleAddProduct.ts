// src/lib/handleAddProduct.ts
import { supabase } from './supabase';

interface ProductWithSpecsObject {
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: string;
  specifications: Record<string, string>; // Оставляем как объект
}

export async function handleAddProduct(product: ProductWithSpecsObject) {
  try {
    // Проверка авторизации администратора
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Not authenticated');
    
    const { data: userData } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single();
      
    if (!userData?.is_admin) throw new Error('Admin privileges required');

    console.log('[INSERT] Отправляем в Supabase:', {
  name: product.name,
  description: product.description,
  price: product.price,
  image_url: product.image_url,
  category_id: product.category_id,
  specifications: product.specifications,
});
    
    const { error } = await supabase.from('products').insert([
      {
        name: product.name,
        description: product.description,
        price: product.price,
        image_url: product.image_url,
        category_id: product.category_id,
        specifications: product.specifications || {},
      },
    ]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('❌ Ошибка:', error);
    return false;
  }
}