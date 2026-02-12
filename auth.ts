
import { User } from './types.ts';

const USERS_STORAGE_KEY = 'iblind_registered_users_v2';
const SESSION_KEY = 'iblind_current_session_v2';

export const authService = {
  getRegisteredUsers: (): (User & { securityKey: string })[] => {
    const saved = localStorage.getItem(USERS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  },

  register: (name: string, email: string, securityKey: string): User => {
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email: email.toLowerCase(),
      role: 'TECNICO' as const,
      securityKey,
      themePreference: 'DARK' as const
    };
    const current = authService.getRegisteredUsers();
    // Fix: Replaced undefined 'newItem' with 'newUser'
    current.push(newUser);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(current));
    
    const { securityKey: _, ...userSession } = newUser;
    return userSession;
  },

  login: (email: string, securityKey: string): User | null => {
    const users = authService.getRegisteredUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    // Suporte a conta demo para primeiro acesso
    if (!user && securityKey === '1234' && email === 'admin@iblind.com') {
      return authService.register('Administrador Demo', email, '1234');
    }

    if (user && user.securityKey === securityKey) {
      const { securityKey: _, ...userSession } = user;
      return userSession;
    }
    
    return null;
  },

  setSession: (user: User | null) => {
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  },

  getSession: (): User | null => {
    const saved = localStorage.getItem(SESSION_KEY);
    return saved ? JSON.parse(saved) : null;
  }
};