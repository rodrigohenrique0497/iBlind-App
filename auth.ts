
import { User } from './types.ts';
import { supabase } from './supabase.ts';

export const authService = {
  register: async (name: string, email: string, password: string): Promise<User | null> => {
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

  sendResetEmail: async (email: string) => {
    // Forçamos o redirecionamento para o origin (https://app.iblind.com.br)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) throw error;
  },

  updatePassword: async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  },

  logout: async () => {
    await supabase.auth.signOut();
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
