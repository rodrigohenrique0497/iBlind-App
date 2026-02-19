
import React, { useState } from 'react';
import { 
  Plus, LayoutDashboard, Package, History, LogOut, 
  User as UserIcon, Settings as SettingsIcon, Shield, Activity, Users as UsersIcon,
  Menu, X, ChevronRight
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeView: string;
  onViewChange: (view: any) => void;
  userName: string;
  onLogout: () => void;
}

export const DashboardLayout: React.FC<LayoutProps> = ({ children, activeView, onViewChange, userName, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'PAINEL', label: 'PAINEL', icon: <LayoutDashboard size={18} /> },
    { id: 'ESPECIALISTAS', label: 'EQUIPE', icon: <UsersIcon size={18} /> },
    { id: 'ESTOQUE', label: 'ESTOQUE', icon: <Package size={18} /> },
    { id: 'SERVIÇOS', label: 'HISTÓRICO', icon: <History size={18} /> },
    { id: 'AUDITORIA', label: 'LOGS', icon: <Activity size={18} /> },
    { id: 'AJUSTES', label: 'AJUSTES', icon: <SettingsIcon size={18} /> },
  ];

  const handleViewChange = (view: string) => {
    onViewChange(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background flex selection:bg-primary/20">
      
      {/* MOBILE TOP BAR - Compacta & Safe Area */}
      <div className="lg:hidden fixed top-0 left-0 w-full h-[72px] bg-background/80 backdrop-blur-xl border-b border-border z-[150] flex items-center justify-between px-5">
        <div className="flex flex-col">
          <h1 className="text-xl brand-font-bold tracking-tighter text-foreground">iBlind</h1>
          <p className="text-[6px] font-black text-foreground/20 tracking-[0.4em] uppercase">Control</p>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center text-foreground active:scale-90 transition-transform"
        >
          <Menu size={18} />
        </button>
      </div>

      {/* MOBILE DRAWER BACKDROP */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-background/60 backdrop-blur-sm z-[200] animate-in fade-in duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR (DESKTOP + MOBILE DRAWER) */}
      <aside className={`
        fixed inset-y-0 left-0 h-full bg-background border-r border-border z-[210] transition-transform duration-500 ease-[cubic-bezier(0.16, 1, 0.3, 1)]
        w-72 p-6 flex flex-col
        lg:translate-x-0 lg:static lg:flex
        ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        <div className="lg:hidden absolute top-6 right-6">
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center text-foreground/40"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col mb-10 px-2">
          <h1 className="text-2xl brand-font-bold tracking-tighter text-foreground">iBlind</h1>
          <p className="text-[7px] font-bold text-foreground/20 tracking-[0.5em] uppercase mt-1">SaaS Operacional</p>
        </div>
        
        <nav className="flex-1 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleViewChange(item.id)}
              className={`w-full flex items-center gap-3.5 p-3.5 rounded-xl transition-all font-black text-[9px] uppercase tracking-[0.15em] group ${
                activeView === item.id 
                ? 'bg-foreground text-background shadow-lg' 
                : 'text-foreground/30 hover:text-foreground hover:bg-foreground/5'
              }`}
            >
              <div className={`transition-colors ${activeView === item.id ? 'text-background' : 'text-foreground/40 group-hover:text-foreground'}`}>
                {item.icon}
              </div>
              {item.label}
              {activeView === item.id && <ChevronRight size={12} className="ml-auto opacity-20" />}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-border space-y-4">
          <div className="flex items-center gap-3 p-3 bg-muted/50 border border-border rounded-xl">
            <div className="w-8 h-8 bg-background rounded-lg flex items-center justify-center border border-border shadow-sm">
              <UserIcon size={14} className="text-foreground/20" />
            </div>
            <div className="overflow-hidden">
              <p className="text-[9px] font-black text-foreground truncate tracking-widest uppercase">{userName}</p>
              <p className="text-[7px] font-black text-emerald-500 uppercase tracking-widest mt-1 opacity-60">ADMIN</p>
            </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 py-2 text-[8px] font-black text-foreground/20 hover:text-red-500 transition-all uppercase tracking-[0.3em]">
            <LogOut size={12} />
            FINALIZAR SESSÃO
          </button>
        </div>
      </aside>

      {/* CONTENT AREA - Margens Mobile Otimizadas (20px) */}
      <main className="flex-1 pb-40 lg:pb-12 bg-background pt-[72px] lg:pt-0 overflow-y-auto no-scrollbar">
        <div className="pt-6 lg:pt-16 max-w-6xl mx-auto px-5 lg:px-12">
          {children}
        </div>
      </main>

      {/* BOTTOM NAV - Otimizado para Gestos & Toque */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-background/90 backdrop-blur-2xl border-t border-border flex items-center justify-around px-2 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3 z-[100]">
        {[navItems[0], navItems[2]].map(item => (
          <button
            key={item.id}
            onClick={() => handleViewChange(item.id)}
            className={`flex flex-col items-center gap-1.5 p-2 flex-1 transition-all active:scale-90 ${
              activeView === item.id ? 'text-foreground' : 'text-foreground/25'
            }`}
          >
            {item.icon}
            <span className="text-[7px] font-black tracking-widest uppercase">{item.label}</span>
          </button>
        ))}
        
        {/* Botão Central de Ação Rápida */}
        <div className="relative -top-6">
          <button 
            onClick={() => handleViewChange('WIZARD')}
            className="bg-foreground text-background w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center active:scale-90 transition-transform border-4 border-background"
          >
            <Plus size={28} strokeWidth={3} />
          </button>
        </div>

        {[navItems[3], navItems[5]].map(item => (
          <button
            key={item.id}
            onClick={() => { window.scrollTo(0, 0); handleViewChange(item.id); }}
            className={`flex flex-col items-center gap-1.5 p-2 flex-1 transition-all active:scale-90 ${
              activeView === item.id ? 'text-foreground' : 'text-foreground/25'
            }`}
          >
            {item.icon}
            <span className="text-[7px] font-black tracking-widest uppercase">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};
