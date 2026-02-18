
import { createClient } from '@supabase/supabase-js'

// No ambiente de execução atual, as variáveis são injetadas no process.env.
// Adicionamos fallback para garantir funcionamento em diferentes ambientes de build.
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);
