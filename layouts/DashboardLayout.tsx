
import React from 'react';
import { 
  Plus, LayoutDashboard, Package, History, LogOut, 
  User as UserIcon, Settings as SettingsIcon, Shield, Activity, Users as UsersIcon
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeView: string;
  onViewChange: (view: any) => void;
  userName: string;
  onLogout: () => void;
}

export const DashboardLayout: React.FC<LayoutProps> = ({ children, activeView, onViewChange, userName, onLogout }) => {
  const navItems = [
    { id: 'PAINEL', label: 'Painel', icon: <LayoutDashboard size={20} /> },
    { id: 'ESPECIALISTAS', label: 'Time', icon: <UsersIcon size={20} /> },
    { id: 'ESTOQUE', label: 'Estoque', icon: <Package size={20} /> },
    { id: 'SERVIÇOS', label: 'Histórico', icon: <History size={20} /> },
    { id: 'AUDITORIA', label: 'Auditoria', icon: <Activity size={20} /> },
    { id: 'AJUSTES', label: 'Ajustes', icon: <SettingsIcon size={20} /> },
  ];

  const primaryNav = navItems.slice(0, 2);
  const secondaryNav = navItems.slice(2, 4);

  return (
    <div className="min-h-screen bg-background flex flex-col transition-all duration-300">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-72 border-r border-border p-10 fixed h-full bg-background z-50">
        <div className="flex flex-col mb-20">
          <h1 className="text-3xl font-extrabold tracking-tighter text-foreground">iBlind</h1>
          <div className="h-px w-8 bg-foreground mt-4 opacity-10"></div>
        </div>
        
        <nav className="flex-1 space-y-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-premium transition-all font-bold text-[11px] uppercase tracking-wider ${
                activeView === item.id 
                ? 'bg-foreground text-background shadow-lg shadow-foreground/5' 
                : 'text-white/30 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-border space-y-6">
          <div className="flex items-center gap-4 p-4 bg-white/[0.03] rounded-premium border border-white/5">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center border border-white/5">
              <UserIcon size={18} className="text-white/20" />
            </div>
            <div className="overflow-hidden">
              <p className="text-[11px] font-bold text-foreground truncate uppercase">{userName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest opacity-80">Online</p>
              </div>
            </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 py-2 text-[10px] font-bold text-white/20 hover:text-red-500 transition-all uppercase tracking-widest">
            <LogOut size={14} />
            Encerrar Sessão
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <header className="lg:hidden flex items-center justify-between px-6 h-20 border-b border-border bg-background/80 glass fixed top-0 w-full z-[100] safe-top">
          <h2 className="text-xl font-black tracking-tighter uppercase">iBlind</h2>
          <button onClick={() => onViewChange('AJUSTES')} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl text-white/40">
            <SettingsIcon size={20} />
          </button>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 lg:ml-72 pt-24 lg:pt-16 pb-40 lg:pb-12 bg-background safe-bottom">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          {children}
        </div>
      </main>

      {/* MOBILE BOTTOM NAV - Ergonômico */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-background/80 glass border-t border-border flex items-center justify-around px-6 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] z-[100]">
        {primaryNav.map(item => (
          <button
            key={item.id}
            onClick={() => { window.scrollTo(0,0); onViewChange(item.id); }}
            className={`flex flex-col items-center gap-1.5 p-2 transition-all duration-300 ${
              activeView === item.id ? 'text-foreground' : 'text-white/20'
            }`}
          >
            {item.icon}
            <span className="text-[9px] font-bold tracking-tight uppercase">{item.label}</span>
          </button>
        ))}
        
        <div className="relative -top-6">
          <button 
            onClick={() => onViewChange('WIZARD')}
            className="bg-foreground text-background w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center active:scale-90 transition-all border-[6px] border-background"
          >
            <Plus size={28} strokeWidth={3} />
          </button>
        </div>

        {secondaryNav.map(item => (
          <button
            key={item.id}
            onClick={() => { window.scrollTo(0,0); onViewChange(item.id); }}
            className={`flex flex-col items-center gap-1.5 p-2 transition-all duration-300 ${
              activeView === item.id ? 'text-foreground' : 'text-white/20'
            }`}
          >
            {item.icon}
            <span className="text-[9px] font-bold tracking-tight uppercase">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};
