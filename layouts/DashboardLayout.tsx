
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
    { id: 'ESPECIALISTAS', label: 'ESPECIALISTAS', icon: <UsersIcon size={18} /> },
    { id: 'ESTOQUE', label: 'ESTOQUE', icon: <Package size={18} /> },
    { id: 'SERVIÇOS', label: 'SERVIÇOS', icon: <History size={18} /> },
    { id: 'AUDITORIA', label: 'AUDITORIA', icon: <Activity size={18} /> },
    { id: 'AJUSTES', label: 'AJUSTES', icon: <SettingsIcon size={18} /> },
  ];

  const handleViewChange = (view: string) => {
    onViewChange(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background flex selection:bg-primary/20 transition-all duration-300">
      
      {/* MOBILE TOP BAR */}
      <div className="lg:hidden fixed top-0 left-0 w-full h-20 bg-background/80 backdrop-blur-xl border-b border-border z-[150] flex items-center justify-between px-6">
        <div className="flex flex-col">
          <h1 className="text-2xl brand-font-bold tracking-tighter text-foreground">iBlind</h1>
          <p className="text-[6px] font-black text-foreground/20 tracking-[0.4em] uppercase">Control</p>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center text-foreground active:scale-90 transition-transform"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* BACKDROP MOBILE */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-background/60 backdrop-blur-sm z-[200] animate-in fade-in duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR (DESKTOP + MOBILE DRAWER) */}
      <aside className={`
        fixed inset-y-0 left-0 h-full bg-background border-r border-border z-[210] transition-transform duration-500 ease-[cubic-bezier(0.16, 1, 0.3, 1)]
        w-72 p-8 flex flex-col
        lg:translate-x-0 lg:static lg:flex
        ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        {/* BOTÃO FECHAR MOBILE */}
        <div className="lg:hidden absolute top-8 right-8">
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center text-foreground/40"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col mb-16 px-2">
          <h1 className="text-3xl brand-font-bold tracking-tighter text-foreground">iBlind</h1>
          <p className="text-[7px] font-bold text-foreground/20 tracking-[0.5em] uppercase mt-1">SaaS Operacional</p>
        </div>
        
        <nav className="flex-1 space-y-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleViewChange(item.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all font-black text-[10px] uppercase tracking-[0.2em] group ${
                activeView === item.id 
                ? 'bg-foreground text-background shadow-lg' 
                : 'text-foreground/30 hover:text-foreground hover:bg-foreground/5'
              }`}
            >
              <div className={`transition-colors ${activeView === item.id ? 'text-background' : 'text-foreground/40 group-hover:text-foreground'}`}>
                {item.icon}
              </div>
              {item.label}
              {activeView === item.id && <ChevronRight size={14} className="ml-auto opacity-20" />}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-border space-y-6">
          <div className="flex items-center gap-4 p-4 bg-muted/50 border border-border rounded-2xl">
            <div className="w-10 h-10 bg-background rounded-xl flex items-center justify-center border border-border shadow-sm">
              <UserIcon size={18} className="text-foreground/20" />
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] font-black text-foreground truncate tracking-widest uppercase">{userName}</p>
              <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mt-1 opacity-60">Operacional</p>
            </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-3 py-2 text-[9px] font-black text-foreground/20 hover:text-red-500 transition-all uppercase tracking-[0.4em]">
            <LogOut size={14} />
            SAIR DA CONTA
          </button>
        </div>
      </aside>

      {/* CONTENT */}
      <main className={`flex-1 pb-40 lg:pb-12 bg-background pt-24 lg:pt-0`}>
        <div className="pt-10 lg:pt-16 max-w-6xl mx-auto px-6">
          {children}
        </div>
      </main>

      {/* BOTTOM NAV (OPCIONAL/QUICK ACCESS) */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-background/95 backdrop-blur-xl border-t border-border flex items-center justify-around px-4 pb-safe pt-4 z-[100]">
        {navItems.slice(0, 2).map(item => (
          <button
            key={item.id}
            onClick={() => handleViewChange(item.id)}
            className={`flex flex-col items-center gap-2 p-3 flex-1 transition-all ${
              activeView === item.id ? 'text-foreground' : 'text-foreground/20'
            }`}
          >
            {item.icon}
            <span className="text-[8px] font-black tracking-widest uppercase">{item.label}</span>
          </button>
        ))}
        
        <div className="relative -top-8">
          <button 
            onClick={() => handleViewChange('WIZARD')}
            className="bg-foreground text-background w-16 h-16 rounded-2xl shadow-2xl flex items-center justify-center active:scale-90 transition-transform border-8 border-background"
          >
            <Plus size={32} strokeWidth={3} />
          </button>
        </div>

        {navItems.slice(2, 4).map(item => (
          <button
            key={item.id}
            onClick={() => { window.scrollTo(0, 0); handleViewChange(item.id); }}
            className={`flex flex-col items-center gap-2 p-3 flex-1 transition-all ${
              activeView === item.id ? 'text-foreground' : 'text-foreground/20'
            }`}
          >
            {item.icon}
            <span className="text-[8px] font-black tracking-widest uppercase">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};
