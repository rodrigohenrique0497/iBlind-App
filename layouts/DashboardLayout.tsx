
import React from 'react';
import { 
  Plus, LayoutDashboard, Package, History, LogOut, 
  User as UserIcon, Settings as SettingsIcon, Shield, Activity
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
    { id: 'DASHBOARD', label: 'Overview', icon: <LayoutDashboard size={18} /> },
    { id: 'STOCK', label: 'Estoque', icon: <Package size={18} /> },
    { id: 'HISTORY', label: 'Protocolos', icon: <History size={18} /> },
    { id: 'LOGS', label: 'Auditoria', icon: <Activity size={18} /> },
    { id: 'SETTINGS', label: 'Ajustes', icon: <SettingsIcon size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-[#000000] flex selection:bg-primary/20 transition-all duration-300">
      
      {/* SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-72 border-r border-white/5 p-8 fixed h-full bg-[#000000] z-50">
        <div className="flex items-center gap-4 mb-16 px-2">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-black">
            <Shield size={22} strokeWidth={2.5} />
          </div>
          <h1 className="text-xl brand-font-bold tracking-tight text-white">iBlind<span className="text-white font-black">.</span></h1>
        </div>
        
        <nav className="flex-1 space-y-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all font-black text-[10px] uppercase tracking-[0.2em] group ${
                activeView === item.id 
                ? 'bg-white text-black' 
                : 'text-white/30 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-white/5 space-y-6">
          <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center border border-white/5">
              <UserIcon size={18} className="text-white/20" />
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] font-black text-white truncate tracking-widest uppercase">{userName}</p>
              <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mt-1 opacity-60">Operacional</p>
            </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-3 py-2 text-[9px] font-black text-white/20 hover:text-red-500 transition-all uppercase tracking-[0.4em]">
            <LogOut size={14} />
            Sair do Painel
          </button>
        </div>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 lg:ml-72 pb-40 lg:pb-12 bg-[#000000]">
        <div className="pt-10 lg:pt-16 max-w-6xl mx-auto px-6">
          {children}
        </div>
      </main>

      {/* MOBILE NAV */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-black/95 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-4 pb-safe pt-4 z-[100]">
        {navItems.slice(0, 2).map(item => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`flex flex-col items-center gap-2 p-3 flex-1 transition-all ${
              activeView === item.id ? 'text-white' : 'text-white/20'
            }`}
          >
            {item.icon}
            <span className="text-[8px] font-black tracking-widest uppercase">{item.label}</span>
          </button>
        ))}
        
        <div className="relative -top-8">
          <button 
            onClick={() => onViewChange('WIZARD')}
            className="bg-white text-black w-16 h-16 rounded-2xl shadow-2xl flex items-center justify-center active:scale-90 transition-transform border-8 border-black"
          >
            <Plus size={32} strokeWidth={3} />
          </button>
        </div>

        {navItems.slice(2, 4).map(item => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`flex flex-col items-center gap-2 p-3 flex-1 transition-all ${
              activeView === item.id ? 'text-white' : 'text-white/20'
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
