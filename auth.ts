
import { User } from './types.ts';
import { supabase, isSupabaseConfigured } from './supabase.ts';

export const authService = {
  register: async (name: string, email: string, password: string): Promise<User | null> => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Serviço de autenticação temporariamente indisponível (Erro: Configuração Supabase Ausente).');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name }
      }
    });

    if (error) throw error;
    if (data.user) {
      return {
        id: data.user.id,
        name: data.user.user_metadata.full_name || name,
        email: data.user.email!,
        role: 'TECNICO',
        themePreference: 'DARK'
      };
    }
    return null;
  },

  login: async (email: string, password: string): Promise<User | null> => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Serviço de login não configurado. Verifique as variáveis de ambiente.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (data.user) {
      return {
        id: data.user.id,
        name: data.user.user_metadata.full_name || 'Operador',
        email: data.user.email!,
        role: 'TECNICO',
        themePreference: 'DARK'
      };
    }
    return null;
  },

  logout: async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('iblind_current_session_v2');
  },

  setSession: (user: User | null) => {
    if (user) {
      localStorage.setItem('iblind_current_session_v2', JSON.stringify(user));
    } else {
      localStorage.removeItem('iblind_current_session_v2');
    }
  },

  getSession: (): User | null => {
    const saved = localStorage.getItem('iblind_current_session_v2');
    return saved ? JSON.parse(saved) : null;
  }
};
