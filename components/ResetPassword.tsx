
import React, { useState } from 'react';
import { Loader2, ArrowRight, ShieldCheck, Lock } from 'lucide-react';
import { authService } from '../auth.ts';
import { BrandLogo } from './Auth.tsx';

export const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.updatePassword(password);
      setIsSuccess(true);
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar senha.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black p-6">
      <div className="w-full max-w-[500px] space-y-12">
        <div className="text-center">
          <BrandLogo size="text-5xl" />
        </div>

        <div className="bg-[#0A0A0A] border border-white/5 rounded-[40px] shadow-2xl p-8 md:p-12">
          {isSuccess ? (
            <div className="text-center space-y-8 py-10 animate-premium-in">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                <ShieldCheck size={32} className="text-emerald-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl brand-font-bold text-white uppercase">Senha Atualizada</h3>
                <p className="text-[10px] text-white/40 uppercase tracking-widest">
                  Sua segurança foi reestabelecida. <br/> Redirecionando...
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-8">
              <div className="space-y-2">
                <h3 className="text-xl brand-font-bold text-white uppercase text-center">Nova Senha</h3>
                <p className="text-[9px] text-white/20 uppercase tracking-[0.3em] text-center mb-6">Defina seu novo acesso seguro</p>
              </div>

              {error && (
                <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl">
                  <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest text-center">{error}</p>
                </div>
              )}

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">Nova Senha</label>
                  <div className="relative">
                    <input 
                      className="w-full bg-[#111111] border border-white/5 text-white px-6 py-5 rounded-2xl text-xs font-medium outline-none focus:border-white/20 transition-all" 
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">Confirmar Senha</label>
                  <input 
                    className="w-full bg-[#111111] border border-white/5 text-white px-6 py-5 rounded-2xl text-xs font-medium outline-none focus:border-white/20 transition-all" 
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
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
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Atualizar Senha'}
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
