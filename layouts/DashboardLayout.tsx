
import React from 'react';
import { 
  Plus, LayoutDashboard, Package, History, LogOut, 
  User as UserIcon, Settings as SettingsIcon, Activity, Users as UsersIcon
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
    { id: 'PAINEL', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'ESPECIALISTAS', label: 'Especialistas', icon: <UsersIcon size={20} /> },
    { id: 'ESTOQUE', label: 'Inventário', icon: <Package size={20} /> },
    { id: 'SERVIÇOS', label: 'Histórico', icon: <History size={20} /> },
    { id: 'AUDITORIA', label: 'Auditoria', icon: <Activity size={20} /> },
    { id: 'AJUSTES', label: 'Ajustes', icon: <SettingsIcon size={20} /> },
  ];

  const primaryNav = navItems.slice(0, 2);
  const secondaryNav = navItems.slice(2, 4);

  return (
    <div className="min-h-screen bg-background flex flex-col transition-all duration-500">
      
      {/* SIDEBAR Industrial Precision */}
      <aside className="hidden lg:flex flex-col w-[280px] border-r border-white/[0.05] p-10 fixed h-full bg-[#0A0A0B] z-50">
        <div className="flex flex-col mb-16">
          <h1 className="text-2xl font-bold tracking-tighter text-white uppercase leading-none">iBlind</h1>
          <p className="text-[9px] font-bold tracking-[0.6em] text-white/10 uppercase mt-2">Proprietary Software</p>
        </div>
        
        <nav className="flex-1 space-y-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-premium transition-all duration-300 font-bold text-[11px] uppercase tracking-widest group relative ${
                activeView === item.id 
                ? 'bg-white/[0.04] text-white border border-white/[0.05]' 
                : 'text-white/20 hover:text-white/60 hover:bg-white/[0.02]'
              }`}
            >
              {activeView === item.id && (
                <div className="absolute left-0 w-1 h-4 bg-white rounded-r-full" />
              )}
              <span className={`transition-transform duration-300 ${activeView === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-10 border-t border-white/5 space-y-6">
          <div className="flex items-center gap-4 p-4 bg-white/[0.02] rounded-premium border border-white/[0.05]">
            <div className="w-10 h-10 bg-white/[0.03] rounded-2xl flex items-center justify-center border border-white/5 text-white/30">
              <UserIcon size={18} />
            </div>
            <div className="overflow-hidden text-left">
              <p className="text-[11px] font-bold text-white truncate uppercase tracking-tight">{userName}</p>
              <p className="text-[9px] font-bold text-emerald-500/60 uppercase tracking-widest mt-1">Authorized</p>
            </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-3 py-2 text-[10px] font-bold text-white/10 hover:text-red-400 transition-all uppercase tracking-[0.2em] active:scale-95">
            <LogOut size={16} />
            Terminar Sessão
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <header className="lg:hidden flex items-center justify-between px-8 h-20 border-b border-white/[0.05] bg-background/80 glass-panel fixed top-0 w-full z-[100] safe-top">
          <div className="flex flex-col text-left">
            <h2 className="text-xl font-bold tracking-tighter uppercase leading-none">iBlind</h2>
            <p className="text-[8px] font-bold text-white/10 uppercase tracking-[0.4em] mt-1">Industrial Interface</p>
          </div>
          <button onClick={() => onViewChange('AJUSTES')} className="w-11 h-11 flex items-center justify-center bg-white/[0.03] rounded-2xl text-white/20 active:scale-90 transition-all">
            <SettingsIcon size={20} />
          </button>
      </header>

      {/* CONTENT AREA */}
      <main className="flex-1 lg:ml-[280px] pt-24 lg:pt-16 pb-40 lg:pb-16 bg-background safe-bottom">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          {children}
        </div>
      </main>

      {/* BOTTOM NAV Premium Glass */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full glass-panel border-t border-white/[0.05] flex items-center justify-around px-6 pt-4 pb-[calc(12px+env(safe-area-inset-bottom))] z-[100]">
        {primaryNav.map(item => (
          <button
            key={item.id}
            onClick={() => { window.scrollTo(0,0); onViewChange(item.id); }}
            className={`flex flex-col items-center gap-1.5 p-3 transition-all duration-300 relative ${
              activeView === item.id ? 'text-white' : 'text-white/20'
            }`}
          >
            {item.icon}
            <span className="text-[8px] font-bold tracking-[0.2em] uppercase">{item.label}</span>
            {activeView === item.id && (
              <div className="absolute top-0 w-6 h-0.5 bg-white rounded-full -mt-4 shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
            )}
          </button>
        ))}
        
        <div className="relative -top-8">
          <button 
            onClick={() => onViewChange('WIZARD')}
            className="bg-white text-black w-16 h-16 rounded-[24px] shadow-[0_10px_30px_rgba(255,255,255,0.15)] flex items-center justify-center active:scale-90 transition-all border-[6px] border-[#0A0A0B]"
          >
            <Plus size={28} strokeWidth={3} />
          </button>
        </div>

        {secondaryNav.map(item => (
          <button
            key={item.id}
            onClick={() => { window.scrollTo(0,0); onViewChange(item.id); }}
            className={`flex flex-col items-center gap-1.5 p-3 transition-all duration-300 relative ${
              activeView === item.id ? 'text-white' : 'text-white/20'
            }`}
          >
            {item.icon}
            <span className="text-[8px] font-bold tracking-[0.2em] uppercase">{item.label}</span>
            {activeView === item.id && (
              <div className="absolute top-0 w-6 h-0.5 bg-white rounded-full -mt-4 shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};
