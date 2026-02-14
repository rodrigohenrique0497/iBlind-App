
import { createClient } from '@supabase/supabase-js';

// Função para tentar obter as chaves de múltiplas fontes
const getSupabaseConfig = () => {
  // 1. Tenta Variáveis de Ambiente (Vercel/Build)
  const envUrl = typeof process !== 'undefined' ? process.env.SUPABASE_URL : undefined;
  const envKey = typeof process !== 'undefined' ? process.env.SUPABASE_ANON_KEY : undefined;

  // 2. Tenta LocalStorage (Configuração Manual via UI)
  const localUrl = localStorage.getItem('IBLIND_SUPABASE_URL');
  const localKey = localStorage.getItem('IBLIND_SUPABASE_KEY');

  return {
    url: envUrl || localUrl || '',
    key: envKey || localKey || ''
  };
};

const config = getSupabaseConfig();

export const isSupabaseConfigured = Boolean(config.url && config.key && config.url.startsWith('http'));

// Só inicializa se for válido para evitar o erro "supabaseUrl is required"
export const supabase = isSupabaseConfigured 
  ? createClient(config.url, config.key) 
  : null;

// Helper para salvar a configuração manualmente
export const saveSupabaseConfig = (url: string, key: string) => {
  localStorage.setItem('IBLIND_SUPABASE_URL', url);
  localStorage.setItem('IBLIND_SUPABASE_KEY', key);
  window.location.reload(); // Recarrega para reinicializar o cliente
};
