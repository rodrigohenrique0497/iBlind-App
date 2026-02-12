
import React from 'react';
import { 
  Plus, LayoutDashboard, Package, History, LogOut, 
  User as UserIcon, Settings as SettingsIcon, Shield 
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
    { id: 'DASHBOARD', label: 'Início', icon: <LayoutDashboard size={20} /> },
    { id: 'STOCK', label: 'Estoque', icon: <Package size={20} /> },
    { id: 'HISTORY', label: 'Registros', icon: <History size={20} /> },
    { id: 'SETTINGS', label: 'Ajustes', icon: <SettingsIcon size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-background flex selection:bg-primary/20 transition-all duration-300">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-72 border-r border-border p-8 fixed h-full bg-background z-50">
        <div className="flex items-center gap-3 mb-14 px-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
            <Shield size={22} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tighter brand-font">iBlind<span className="text-primary font-black">.</span></h1>
        </div>
        
        <nav className="flex-1 space-y-2">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-3 mb-4">Plataforma</p>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3.5 p-3.5 rounded-2xl transition-all font-bold text-[13px] group ${
                activeView === item.id 
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10' 
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`}
            >
              <span className={`${activeView === item.id ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'} transition-opacity`}>
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-border space-y-6">
          <div className="flex items-center gap-4 p-4 bg-secondary rounded-2xl border border-border">
            <div className="w-11 h-11 bg-background rounded-xl flex items-center justify-center border border-border">
              <UserIcon size={20} className="text-muted-foreground" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-foreground truncate">{userName}</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]"></div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Ativo</p>
              </div>
            </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-2 text-muted-foreground hover:text-rose-500 transition-colors text-[11px] font-bold uppercase tracking-[0.15em] opacity-60 hover:opacity-100">
            <LogOut size={16} />
            Desconectar
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 lg:ml-72 pb-32 lg:pb-12 pt-safe bg-background">
        <div className="pt-8 lg:pt-14">
          {children}
        </div>
      </main>

      {/* MOBILE BOTTOM NAVIGATION (Optimized for one-hand use) */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full glass bg-background/80 border-t border-border flex items-center justify-around px-2 pb-safe pt-3 z-[100]">
        {navItems.slice(0, 2).map(item => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`flex flex-col items-center gap-1.5 p-3 flex-1 transition-all rounded-2xl ${
              activeView === item.id ? 'text-primary' : 'text-muted-foreground opacity-60'
            }`}
          >
            {item.icon}
            <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
          </button>
        ))}
        
        <div className="relative -top-10 px-4">
          <button 
            onClick={() => onViewChange('WIZARD')}
            className="bg-primary text-primary-foreground w-16 h-16 rounded-3xl shadow-xl shadow-primary/30 flex items-center justify-center active:scale-90 transition-transform ring-4 ring-background"
          >
            <Plus size={32} strokeWidth={3} />
          </button>
        </div>

        {navItems.slice(2, 4).map(item => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`flex flex-col items-center gap-1.5 p-3 flex-1 transition-all rounded-2xl ${
              activeView === item.id ? 'text-primary' : 'text-muted-foreground opacity-60'
            }`}
          >
            {item.icon}
            <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};
