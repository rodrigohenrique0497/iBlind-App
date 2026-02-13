
import React, { useState, useEffect } from 'react';
import { Loader2, ArrowRight } from 'lucide-react';
import { User } from '../types.ts';
import { authService } from '../auth.ts';

export const BrandLogo: React.FC<{ size?: string, inverted?: boolean }> = ({ size = "text-5xl", inverted = false }) => (
  <div className="flex flex-col items-center select-none group">
    <h1 className={`${size} brand-font-bold tracking-tighter transition-colors text-white`}>
      iBlind
    </h1>
    <p className="text-[10px] font-bold tracking-[0.4em] mt-2 text-white/20 uppercase">
      Controle Operacional
    </p>
  </div>
);

interface AuthProps {
  onLogin: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      setIsLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const user = await authService.login(email, password);
        if (user) {
          authService.setSession(user);
          onLogin(user);
        }
      } else {
        if (name.length < 3) {
          setError('Nome muito curto.');
          setIsLoading(false);
          return;
        }
        const newUser = await authService.register(name, email, password);
        if (newUser) {
          authService.setSession(newUser);
          onLogin(newUser);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao processar autenticação.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black p-6 selection:bg-white/10 overflow-hidden">
      
      {/* Background glow effect */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-white/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-zinc-900/40 blur-[120px] rounded-full" />
      </div>

      <div className={`w-full max-w-[500px] relative z-10 transition-all duration-1000 ease-out transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        
        <div className="text-center mb-12">
          <BrandLogo size="text-5xl" />
        </div>

        <div className="bg-[#0A0A0A] border border-white/5 rounded-[40px] shadow-2xl p-8 md:p-12">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {error && (
              <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl animate-premium-in">
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest text-center">
                  {error}
                </p>
              </div>
            )}

            <div className="space-y-6">
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">Nome</label>
                  <input 
                    className="w-full bg-[#111111] border border-white/5 text-white px-6 py-5 rounded-2xl text-xs font-medium outline-none focus:border-white/20 transition-all" 
                    placeholder="Seu nome completo" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    required={!isLogin}
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">E-mail</label>
                <input 
                  className="w-full bg-[#111111] border border-white/5 text-white px-6 py-5 rounded-2xl text-xs font-medium outline-none focus:border-white/20 transition-all" 
                  placeholder="exemplo@iblind.com" 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">Senha</label>
                <input 
                  className="w-full bg-[#111111] border border-white/5 text-white px-6 py-5 rounded-2xl text-xs font-medium outline-none focus:border-white/20 transition-all" 
                  placeholder="••••••••" 
                  type="password"
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full h-20 bg-white text-black rounded-3xl transition-all duration-300 active:scale-95 disabled:opacity-50 hover:bg-[#F2F2F2] flex items-center justify-center group"
            >
              <span className="brand-font-bold text-[11px] tracking-widest flex items-center gap-3 uppercase">
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    {isLogin ? 'Acessar Plataforma' : 'Criar Conta'}
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>

            <div className="pt-8 border-t border-white/5 flex flex-col items-center gap-6">
              <p className="text-[9px] font-bold text-white/10 uppercase tracking-[0.3em]">Acesso Exclusivo</p>
              <button 
                type="button"
                onClick={() => { setIsLogin(!isLogin); setError(''); }} 
                className="text-[10px] font-bold text-white/40 hover:text-white transition-all uppercase tracking-widest"
              >
                {isLogin ? 'Criar nova conta' : 'Já possuo uma conta'}
              </button>
            </div>
          </form>
        </div>

        <p className="mt-12 text-center text-[9px] font-black text-white/5 uppercase tracking-[1em] select-none">
          iBlind © 2024
        </p>
      </div>
    </div>
  );
};
