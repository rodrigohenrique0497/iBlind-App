
import React, { useState, useEffect } from 'react';
import { Loader2, ArrowRight, ArrowLeft, MailCheck } from 'lucide-react';
import { User } from '../types.ts';
import { authService } from '../auth.ts';
import { IBInput } from './iBlindUI.tsx';

export const BrandLogo: React.FC<{ size?: string, inverted?: boolean }> = ({ size = "text-5xl", inverted = false }) => (
  <div className="flex flex-col items-center select-none group">
    <h1 className={`${size} brand-font-bold tracking-tighter transition-colors text-foreground`}>
      iBlind
    </h1>
    <p className="text-[10px] font-bold tracking-[0.4em] mt-2 text-foreground/40 uppercase">
      Controle Operacional
    </p>
  </div>
);

interface AuthProps {
  onLogin: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER' | 'FORGOT'>('LOGIN');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (mode === 'LOGIN') {
        const user = await authService.login(email, password);
        if (user) {
          authService.setSession(user);
          onLogin(user);
        }
      } else if (mode === 'REGISTER') {
        if (password.length < 6) throw new Error('A senha deve ter no mínimo 6 caracteres.');
        if (name.length < 3) throw new Error('Nome muito curto.');
        const newUser = await authService.register(name, email, password);
        if (newUser) {
          authService.setSession(newUser);
          onLogin(newUser);
        }
      } else if (mode === 'FORGOT') {
        await authService.sendResetEmail(email);
        setSuccess('E-mail de recuperação enviado com sucesso!');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao processar solicitação.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 selection:bg-foreground/10 overflow-hidden">
      
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-foreground/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-muted/40 blur-[120px] rounded-full" />
      </div>

      <div className={`w-full max-w-[500px] relative z-10 transition-all duration-1000 ease-out transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        
        <div className="text-center mb-12">
          <BrandLogo size="text-5xl" />
        </div>

        <div className="bg-card border border-border rounded-[40px] premium-shadow p-8 md:p-12">
          {success ? (
            <div className="text-center space-y-8 py-10 animate-premium-in">
              <div className="w-20 h-20 bg-foreground/5 rounded-full flex items-center justify-center mx-auto border border-border">
                <MailCheck size={32} className="text-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl brand-font-bold text-foreground uppercase">Verifique seu e-mail</h3>
                <p className="text-[10px] text-foreground/60 uppercase tracking-widest leading-loose">
                  Enviamos instruções de recuperação para <br/> <span className="text-foreground font-bold">{email}</span>
                </p>
              </div>
              <button 
                onClick={() => { setMode('LOGIN'); setSuccess(''); }}
                className="text-[10px] font-bold text-foreground/60 hover:text-foreground transition-all uppercase tracking-[0.3em] flex items-center gap-2 mx-auto"
              >
                <ArrowLeft size={14} /> Voltar ao Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {error && (
                <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl animate-premium-in">
                  <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest text-center">
                    {error}
                  </p>
                </div>
              )}

              <div className="space-y-6">
                {mode === 'REGISTER' && (
                  <IBInput 
                    label="Nome Completo" 
                    placeholder="Seu nome" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    required
                  />
                )}

                <IBInput 
                  label="E-mail" 
                  placeholder="exemplo@iblind.com" 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                />

                {mode !== 'FORGOT' && (
                  <IBInput 
                    label="Senha de Acesso" 
                    placeholder="••••••••" 
                    type="password"
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required 
                  />
                )}
              </div>

              <div className="space-y-4">
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-20 bg-foreground text-background rounded-3xl transition-all duration-300 active:scale-95 disabled:opacity-50 hover:opacity-95 flex items-center justify-center group"
                >
                  <span className="brand-font-bold text-[11px] tracking-widest flex items-center gap-3 uppercase">
                    {isLoading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>
                        {mode === 'LOGIN' ? 'Acessar Plataforma' : mode === 'REGISTER' ? 'Criar Conta' : 'Recuperar Acesso'}
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                </button>

                {mode === 'LOGIN' && (
                  <button 
                    type="button"
                    onClick={() => setMode('FORGOT')}
                    className="w-full py-2 text-[10px] font-bold text-foreground/40 hover:text-foreground transition-all uppercase tracking-[0.2em]"
                  >
                    Esqueci minha senha
                  </button>
                )}
              </div>

              <div className="pt-8 border-t border-border flex flex-col items-center gap-6">
                {mode === 'FORGOT' ? (
                  <button 
                    type="button"
                    onClick={() => { setMode('LOGIN'); setError(''); }} 
                    className="text-[11px] font-bold text-foreground/60 hover:text-foreground transition-all uppercase tracking-widest"
                  >
                    Voltar ao login
                  </button>
                ) : (
                  <>
                    <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.3em]">Acesso Exclusivo</p>
                    <button 
                      type="button"
                      onClick={() => { setMode(mode === 'LOGIN' ? 'REGISTER' : 'LOGIN'); setError(''); }} 
                      className="text-[11px] font-bold text-foreground/60 hover:text-foreground transition-all uppercase tracking-widest"
                    >
                      {mode === 'LOGIN' ? 'Criar nova conta' : 'Já possuo uma conta'}
                    </button>
                  </>
                )}
              </div>
            </form>
          )}
        </div>

        <p className="mt-12 text-center text-[9px] font-black text-foreground/5 uppercase tracking-[1em] select-none">
          iBlind © 2025
        </p>
      </div>
    </div>
  );
};
