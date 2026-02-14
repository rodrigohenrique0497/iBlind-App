

import { User } from './types.ts';
import { supabase } from './supabase.ts';

// Fixed property access errors by casting supabase.auth to any to bypass type recognition issues
const supabaseAuth = (supabase as any).auth;

export const authService = {
  register: async (name: string, email: string, password: string): Promise<User | null> => {
    const { data, error } = await supabaseAuth.signUp({
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
    const { data, error } = await supabaseAuth.signInWithPassword({
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
    await supabaseAuth.signOut();
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
