
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
    <div className="min-h-screen bg-black flex flex-col transition-all duration-300">
      
      {/* SIDEBAR iPlanner Edition */}
      <aside className="hidden lg:flex flex-col w-[300px] border-r border-white/5 p-12 fixed h-full bg-surface z-50">
        <div className="flex flex-col mb-16">
          <h1 className="text-3xl font-extrabold tracking-tighter text-white uppercase leading-none">iBlind</h1>
          <p className="text-[9px] font-bold tracking-[0.5em] text-white/10 uppercase mt-2">Control Hub</p>
        </div>
        
        <nav className="flex-1 space-y-3">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-5 px-6 py-4 rounded-premium transition-all duration-300 font-bold text-[11px] uppercase tracking-widest group relative ${
                activeView === item.id 
                ? 'bg-white/[0.05] text-white border border-white/5' 
                : 'text-white/20 hover:text-white hover:bg-white/[0.02]'
              }`}
            >
              {activeView === item.id && (
                <div className="absolute left-0 w-1 h-5 bg-white rounded-r-full" />
              )}
              <span className={`transition-transform duration-300 ${activeView === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-10 border-t border-white/5 space-y-8">
          <div className="flex items-center gap-5 p-5 bg-white/[0.02] rounded-premium border border-white/5">
            <div className="w-11 h-11 bg-white/[0.03] rounded-2xl flex items-center justify-center border border-white/5 text-white/40">
              <UserIcon size={20} />
            </div>
            <div className="overflow-hidden">
              <p className="text-[11px] font-extrabold text-white truncate uppercase tracking-tight">{userName}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Sincronizado</p>
              </div>
            </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-3 py-3 text-[10px] font-bold text-white/10 hover:text-red-400 transition-all uppercase tracking-[0.2em] active:scale-95">
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER iPlanner Style */}
      <header className="lg:hidden flex items-center justify-between px-8 h-24 border-b border-white/5 bg-black/80 glass fixed top-0 w-full z-[100] safe-top">
          <div className="flex flex-col">
            <h2 className="text-xl font-extrabold tracking-tighter uppercase leading-none">iBlind</h2>
            <p className="text-[8px] font-bold text-white/10 uppercase tracking-[0.4em] mt-1">SaaS Interface</p>
          </div>
          <button onClick={() => onViewChange('AJUSTES')} className="w-12 h-12 flex items-center justify-center bg-white/[0.03] rounded-2xl text-white/20 active:scale-90 transition-all">
            <SettingsIcon size={22} />
          </button>
      </header>

      {/* CONTENT AREA */}
      <main className="flex-1 lg:ml-[300px] pt-28 lg:pt-16 pb-44 lg:pb-16 bg-black safe-bottom">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          {children}
        </div>
      </main>

      {/* BOTTOM NAV iPlanner Edition */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-black/80 glass border-t border-white/5 flex items-center justify-around px-8 pt-4 pb-[calc(16px+env(safe-area-inset-bottom))] z-[100]">
        {primaryNav.map(item => (
          <button
            key={item.id}
            onClick={() => { window.scrollTo(0,0); onViewChange(item.id); }}
            className={`flex flex-col items-center gap-2 p-3 transition-all duration-300 relative ${
              activeView === item.id ? 'text-white' : 'text-white/20'
            }`}
          >
            {item.icon}
            <span className="text-[8px] font-bold tracking-widest uppercase">{item.label}</span>
            {activeView === item.id && (
              <div className="absolute top-0 w-8 h-0.5 bg-white rounded-full -mt-4 shadow-[0_0_12px_rgba(255,255,255,0.5)]" />
            )}
          </button>
        ))}
        
        <div className="relative -top-10">
          <button 
            onClick={() => onViewChange('WIZARD')}
            className="bg-white text-black w-18 h-18 rounded-[28px] shadow-[0_15px_45px_rgba(255,255,255,0.15)] flex items-center justify-center active:scale-90 transition-all border-[8px] border-black"
          >
            <Plus size={32} strokeWidth={3} />
          </button>
        </div>

        {secondaryNav.map(item => (
          <button
            key={item.id}
            onClick={() => { window.scrollTo(0,0); onViewChange(item.id); }}
            className={`flex flex-col items-center gap-2 p-3 transition-all duration-300 relative ${
              activeView === item.id ? 'text-white' : 'text-white/20'
            }`}
          >
            {item.icon}
            <span className="text-[8px] font-bold tracking-widest uppercase">{item.label}</span>
            {activeView === item.id && (
              <div className="absolute top-0 w-8 h-0.5 bg-white rounded-full -mt-4 shadow-[0_0_12px_rgba(255,255,255,0.5)]" />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};
