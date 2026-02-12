
import React, { useState, useEffect } from 'react';
import { Lock, Mail, User as UserIcon, Loader2, Shield, ArrowRight } from 'lucide-react';
import { User } from '../types.ts';
import { authService } from '../auth.ts';

export const BrandLogo: React.FC<{ size?: string, inverted?: boolean }> = ({ size = "text-5xl", inverted = false }) => (
  <div className="flex flex-col items-center select-none group">
    <div className="flex items-center gap-4">
      <div className="relative">
        <div className="relative w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-black shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-500 group-hover:bg-primary group-hover:text-white group-hover:shadow-primary/40">
          <Shield size={28} strokeWidth={2.5} />
        </div>
      </div>
      <h1 className={`${size} brand-font-bold tracking-tighter transition-colors ${inverted ? 'text-black' : 'text-white'}`}>
        iBlind<span className="text-primary">.</span>
      </h1>
    </div>
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
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

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
          setError('Dados de acesso incorretos.');
          setIsLoading(false);
        }
      } else {
        if (name.length < 3 || securityKey.length < 4) {
          setError('Preencha os dados corretamente.');
          setIsLoading(false);
          return;
        }
        const newUser = authService.register(name, email, securityKey);
        authService.setSession(newUser);
        onLogin(newUser);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#000000] p-6 selection:bg-primary/30">
      
      <div className={`w-full max-w-[380px] transition-all duration-1000 ease-out transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <BrandLogo size="text-3xl" />
          <div className="mt-8 space-y-1">
            <h2 className="text-sm font-medium text-white/90">
              {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
            </h2>
            <p className="text-[10px] text-white/30 uppercase tracking-[0.3em]">
              {isLogin ? 'Acesse o painel iBlind' : 'Comece a gerenciar hoje'}
            </p>
          </div>
        </div>

        {/* Auth Interface */}
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl animate-premium-in">
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest text-center">
                  {error}
                </p>
              </div>
            )}

            <div className="space-y-2">
              {!isLogin && (
                <input 
                  className="w-full bg-[#0A0A0A] border border-white/5 focus:border-white/20 text-white px-6 py-5 rounded-2xl text-xs font-semibold outline-none transition-all placeholder:text-white/10 text-left" 
                  placeholder="Nome completo" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required={!isLogin}
                />
              )}

              <input 
                className="w-full bg-[#0A0A0A] border border-white/5 focus:border-white/20 text-white px-6 py-5 rounded-2xl text-xs font-semibold outline-none transition-all placeholder:text-white/10 text-left" 
                placeholder="E-mail corporativo" 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
              />

              <input 
                className="w-full bg-[#0A0A0A] border border-white/5 focus:border-white/20 text-white px-6 py-5 rounded-2xl text-xs font-black outline-none transition-all placeholder:text-white/10 text-left tracking-[0.3em]" 
                placeholder="Senha de acesso" 
                type="password"
                maxLength={4}
                value={securityKey} 
                onChange={e => setSecurityKey(e.target.value.replace(/\D/g, ''))} 
                required 
              />
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="group w-full relative h-[64px] bg-white text-black rounded-2xl transition-all duration-500 active:scale-95 disabled:opacity-50 border border-white hover:bg-transparent hover:text-white mt-4"
            >
              <span className="relative z-10 brand-font-bold text-[10px] tracking-[0.3em] flex items-center justify-center gap-3 uppercase">
                {isLoading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    {isLogin ? 'Entrar' : 'Continuar'}
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </form>

          <div className="flex flex-col items-center gap-6 pt-4">
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); }} 
              className="text-[10px] font-bold text-white/20 hover:text-white transition-all tracking-wide"
            >
              {isLogin ? 'Ainda não tem conta?' : 'Já tenho uma conta'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-20 text-center text-[8px] font-black text-white/5 uppercase tracking-[1em] select-none">
          iBlind 2025
        </p>
      </div>
    </div>
  );
};
