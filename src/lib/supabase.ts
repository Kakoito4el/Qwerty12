// Инициализация единственного Supabase клиента для фронтенда
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Перезапустите dev-сервер после изменения .env
export const supabase = createClient<Database>(supabaseUrl!, supabaseAnonKey!)