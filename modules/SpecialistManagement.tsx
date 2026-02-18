
import React, { useState } from 'react';
import { Users, UserPlus, Search, X, Mail, Shield, Trash2, Smartphone, Star } from 'lucide-react';
import { IBCard, IBButton, IBInput, IBBadge } from '../components/iBlindUI.tsx';
import { User, Attendance } from '../types.ts';

interface SpecialistProps {
  specialists: User[];
  history: Attendance[];
  onAdd: (specialist: Partial<User>) => void;
  onDelete: (id: string) => void;
}

export const SpecialistManagement: React.FC<SpecialistProps> = ({ specialists, history, onAdd, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '' });

  const filteredSpecialists = specialists.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    if (!formData.name || !formData.email) return;
    onAdd({
      ...formData,
      role: 'ESPECIALISTA'
    });
    setFormData({ name: '', email: '' });
    setIsAdding(false);
  };

  const getSpecialistStats = (id: string) => {
    const services = history.filter(h => h.specialistId === id && !h.isDeleted);
    const totalValue = services.reduce((acc, curr) => acc + curr.totalValue, 0);
    return { count: services.length, total: totalValue };
  };

  return (
    <div className="space-y-10 animate-premium-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2 text-left">
          <h2 className="text-4xl brand-font-bold tracking-tight uppercase">Time de Especialistas</h2>
          <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.4em] opacity-40">Gestão Operacional de Talentos</p>
        </div>
        <IBButton onClick={() => setIsAdding(true)} className="px-10">
          <UserPlus size={20} /> ADICIONAR ESPECIALISTA
        </IBButton>
      </header>

      <div className="relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={20} />
        <input 
          className="w-full bg-white/5 border border-white/5 focus:border-white/20 text-white pl-16 pr-6 py-5 rounded-2xl text-xs font-semibold outline-none transition-all placeholder:text-white/10"
          placeholder="Pesquisar por nome ou e-mail..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSpecialists.map(spec => {
          const stats = getSpecialistStats(spec.id);
          return (
            <IBCard key={spec.id} className="relative group overflow-hidden border-white/5 hover:border-white/20 transition-all text-left">
              <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => onDelete(spec.id)}
                  className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex items-center gap-5 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-foreground/5 border border-white/5 flex items-center justify-center text-foreground/40 group-hover:bg-foreground group-hover:text-background transition-all duration-500">
                  <Shield size={32} />
                </div>
                <div>
                  <h4 className="brand-font-bold text-xl uppercase tracking-tighter text-foreground">{spec.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail size={12} className="text-white/20" />
                    <span className="text-[10px] text-white/40 font-bold uppercase truncate max-w-[150px]">{spec.email}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">SERVIÇOS</p>
                  <div className="flex items-center gap-2">
                    <Smartphone size={14} className="text-foreground/40" />
                    <span className="text-lg font-black text-foreground">{stats.count}</span>
                  </div>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">PRODUÇÃO</p>
                  <div className="flex items-center gap-2">
                    <Star size={14} className="text-amber-500/40" />
                    <span className="text-lg font-black text-foreground">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(stats.total)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <IBBadge variant="primary">ESPECIALISTA ATIVO</IBBadge>
              </div>
            </IBCard>
          );
        })}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[600] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 animate-premium-in">
          <div className="w-full max-w-lg bg-[#0A0A0A] border border-white/10 rounded-[40px] p-10 space-y-8 shadow-2xl text-left">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl brand-font-bold uppercase text-white">Novo Especialista</h3>
                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mt-1">Cadastro de Operador Técnico</p>
              </div>
              <button onClick={() => setIsAdding(false)} className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl text-white/20 hover:text-white transition-all"><X size={24}/></button>
            </div>
            
            <div className="space-y-6">
              <IBInput 
                label="Nome do Especialista" 
                placeholder="Ex: Roberto Alcantara" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
              />
              <IBInput 
                label="E-mail de Acesso" 
                placeholder="roberto@iblind.com" 
                type="email"
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
              />
              
              <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">NÍVEL DE PERMISSÃO</p>
                <div className="flex items-center gap-3">
                  <Shield size={16} className="text-emerald-500" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">Especialista Operacional</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <IBButton variant="ghost" className="flex-1" onClick={() => setIsAdding(false)}>CANCELAR</IBButton>
              <IBButton variant="primary" className="flex-1" onClick={handleSave}>SALVAR CADASTRO</IBButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
