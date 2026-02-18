
import { createClient } from '@supabase/supabase-js'

// No ambiente de execução atual, as variáveis são acessadas via process.env
// Isso evita o erro 'Cannot read properties of undefined (reading 'VITE_SUPABASE_URL')'
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
