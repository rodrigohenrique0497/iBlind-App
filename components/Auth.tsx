
import React, { useState } from 'react';
import { Lock, Mail, User as UserIcon, Loader2, Shield } from 'lucide-react';
import { User } from '../types.ts';
import { authService } from '../auth.ts';

export const BrandLogo: React.FC<{ size?: string }> = ({ size = "text-5xl" }) => (
  <div className="flex flex-col items-center select-none group">
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
        <Shield size={28} strokeWidth={2.5} />
      </div>
      <h1 className={`${size} brand-font tracking-tighter text-foreground`}>
        iBlind<span className="text-primary">.</span>
      </h1>
    </div>
    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.4em] mt-5 opacity-40">Terminal Operacional v10.0</p>
  </div>
);

interface AuthProps {
  onLogin: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [securityKey, setSecurityKey] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      if (isLogin) {
        const user = authService.login(email, securityKey);
        if (user) {
          authService.setSession(user);
          onLogin(user);
        } else {
          setError('Credenciais inválidas. Verifique seu PIN.');
          setIsLoading(false);
        }
      } else {
        if (name.length < 3 || securityKey.length < 4) {
          setError('Dados insuficientes para registro.');
          setIsLoading(false);
          return;
        }
        const newUser = authService.register(name, email, securityKey);
        authService.setSession(newUser);
        onLogin(newUser);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 selection:bg-primary/30">
      <div className="w-full max-w-[400px] space-y-14">
        
        <div className="animate-in text-center">
          <BrandLogo />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up">
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
              <p className="text-[11px] font-bold text-center text-rose-500 tracking-tight">
                {error}
              </p>
            </div>
          )}

          <div className="space-y-3.5">
            {!isLogin && (
              <div className="relative group">
                <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground opacity-30 group-focus-within:opacity-100 transition-opacity" size={18} />
                <input 
                  className="w-full bg-card border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 text-foreground pl-14 pr-6 py-5 rounded-2xl text-sm font-medium outline-none transition-all placeholder:text-muted-foreground/30" 
                  placeholder="Nome Completo" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required={!isLogin}
                />
              </div>
            )}

            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground opacity-30 group-focus-within:opacity-100 transition-opacity" size={18} />
              <input 
                className="w-full bg-card border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 text-foreground pl-14 pr-6 py-5 rounded-2xl text-sm font-medium outline-none transition-all placeholder:text-muted-foreground/30" 
                placeholder="E-mail Corporativo" 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground opacity-30 group-focus-within:opacity-100 transition-opacity" size={18} />
              <input 
                className="w-full bg-card border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 text-foreground pl-14 pr-6 py-5 rounded-2xl text-sm font-bold tracking-[0.5em] outline-none transition-all placeholder:text-muted-foreground/30 placeholder:tracking-normal" 
                placeholder="PIN" 
                type="password"
                maxLength={4}
                value={securityKey} 
                onChange={e => setSecurityKey(e.target.value.replace(/\D/g, ''))} 
                required 
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground py-5 rounded-2xl font-bold text-sm tracking-tight active:scale-95 transition-all flex items-center justify-center disabled:opacity-50 shadow-lg shadow-primary/20 hover:brightness-110"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              isLogin ? 'Entrar no Sistema' : 'Criar Conta Operacional'
            )}
          </button>
        </form>

        <div className="flex flex-col items-center gap-6 animate-in pt-4">
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(''); }} 
            className="text-[11px] font-bold text-muted-foreground hover:text-foreground transition-colors tracking-widest uppercase opacity-60"
          >
            {isLogin ? 'Solicitar Acesso à Gerência' : 'Já possui PIN? Fazer Login'}
          </button>
        </div>
      </div>
    </div>
  );
};
