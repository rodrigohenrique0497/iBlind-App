
import { createClient } from '@supabase/supabase-js'

// No Vite, usamos import.meta.env. 
// Certifique-se de que as variáveis no Vercel começam com VITE_
// Fix: Use type assertion to any for import.meta to access Vite env variables
export const supabase = createClient(
  (import.meta as any).env.VITE_SUPABASE_URL || '',
  (import.meta as any).env.VITE_SUPABASE_ANON_KEY || ''
)
