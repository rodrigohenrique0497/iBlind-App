
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Shield, TrendingUp, Package, BarChart3, Plus, History, 
  Settings as SettingsIcon, Moon, Sun, Search, Smartphone, Clock, AlertTriangle,
  Zap, Trash2, ArrowUpRight, Activity, Camera, X, FileText, ChevronRight, Users as UsersIcon,
  DownloadCloud, Database, UploadCloud
} from 'lucide-react';
import { Attendance, User, InventoryItem, AppTheme, TenantConfig, AuditLog } from './types.ts';
import { Auth, BrandLogo } from './components/Auth.tsx';
import { ResetPassword } from './components/ResetPassword.tsx';
import { authService } from './auth.ts';
import { supabase } from './supabase.ts';
import { DashboardLayout } from './layouts/DashboardLayout.tsx';
import { IBCard, IBButton, IBBadge, IBlindStatCard, IBInput } from './components/iBlindUI.tsx';
import { NewServiceWizard } from './modules/NewServiceWizard.tsx';
import { StockManagement } from './modules/StockManagement.tsx';
import { SpecialistManagement } from './modules/SpecialistManagement.tsx';

const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

type ViewType = 'PAINEL' | 'WIZARD' | 'SERVIÇOS' | 'ESTOQUE' | 'AJUSTES' | 'AUDITORIA' | 'ESPECIALISTAS';

const App = () => {
  const [user, setUser] = useState<User | null>(() => authService.getSession());
  const [view, setView] = useState<ViewType>('PAINEL');
  const [theme, setTheme] = useState<AppTheme>(() => (localStorage.getItem('iblind_v12_theme') as AppTheme) || 'DARK');
  const [isLoading, setIsLoading] = useState(true);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  
  const [tenant, setTenant] = useState<TenantConfig>(() => JSON.parse(localStorage.getItem('iblind_v12_tenant') || JSON.stringify({
    companyName: 'iBlind',
    primaryColor: '#FFFFFF',
    warrantyDefaultDays: 365,
    allowCustomPricing: true
  })));
  
  const [history, setHistory] = useState<Attendance[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [specialists, setSpecialists] = useState<User[]>([]);
  
  const [selectedProtocol, setSelectedProtocol] = useState<Attendance | null>(null);
  const [auditTarget, setAuditTarget] = useState<string | null>(null);
  const [auditReason, setAuditReason] = useState('');

  useEffect(() => {
    const checkRecovery = () => {
      const hasRecoveryToken = window.location.hash.includes('type=recovery') || 
                               window.location.hash.includes('access_token=') ||
                               window.location.pathname.includes('reset-password');
      
      if (hasRecoveryToken) {
        setIsRecoveryMode(true);
      }
    };

    checkRecovery();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryMode(true);
      }
      
      if (session?.user && !user) {
        const u: User = {
          id: session.user.id,
          name: session.user.user_metadata.full_name || 'Operador',
          email: session.user.email!,
          role: 'ADMIN'
        };
        setUser(u);
        authService.setSession(u);
      }
    });

    return () => subscription.unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [attRes, invRes, logRes, usersRes] = await Promise.all([
          supabase.from('attendances').select('*').order('created_at', { ascending: false }),
          supabase.from('inventory_items').select('*'),
          supabase.from('audit_logs').select('*').order('timestamp', { ascending: false }),
          supabase.from('profiles').select('*').eq('role', 'ESPECIALISTA')
        ]);

        if (attRes.data) setHistory(attRes.data.map(row => ({...row.data, id: row.id})));
        if (invRes.data) setInventory(invRes.data.map(row => ({...row.data, id: row.id})));
        if (logRes.data) setLogs(logRes.data);
        
        if (usersRes.data) {
          setSpecialists(usersRes.data);
        } else {
          setSpecialists([
            { id: '1', name: 'Carlos Técnico', email: 'carlos@iblind.com', role: 'ESPECIALISTA' },
            { id: '2', name: 'Ana Blindagem', email: 'ana@iblind.com', role: 'ESPECIALISTA' }
          ]);
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    if (theme === 'DARK') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('iblind_v12_theme', theme);
  }, [theme]);

  const stats = useMemo(() => {
    const valid = history.filter(a => !a.isDeleted);
    const revenue = valid.reduce((acc, curr) => acc + (curr.totalValue || 0), 0);
    const countToday = valid.filter(a => new Date(a.date).toDateString() === new Date().toDateString()).length;
    return {
      revenue,
      countToday,
      totalServices: valid.length,
      criticalStock: inventory.filter(i => i.currentStock <= i.minStock).length
    };
  }, [history, inventory]);

  const handleAddSpecialist = async (data: Partial<User>) => {
    const newSpec = {
      id: Math.random().toString(36).substr(2, 9),
      name: data.name!,
      email: data.email!,
      role: 'ESPECIALISTA' as const
    };

    await supabase.from('profiles').insert([newSpec]);
    setSpecialists([...specialists, newSpec]);
  };

  const handleDeleteSpecialist = async (id: string) => {
    await supabase.from('profiles').delete().eq('id', id);
    setSpecialists(specialists.filter(s => s.id !== id));
  };

  const handleCompleteService = async (data: Partial<Attendance>) => {
    const now = new Date();
    const newAttendance: Attendance = {
      ...data,
      id: Math.random().toString(36).substr(2, 6).toUpperCase(),
      warrantyId: `IB-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      date: now.toISOString(),
      warrantyUntil: new Date(now.getTime() + (tenant.warrantyDefaultDays * 24 * 60 * 60 * 1000)).toISOString(),
      technicianId: user!.id,
      technicianName: user!.name,
      totalValue: data.totalValue || 0
    } as Attendance;

    await supabase.from('attendances').insert([{
      id: newAttendance.id,
      warranty_id: newAttendance.warrantyId,
      client_name: newAttendance.clientName,
      device_model: newAttendance.deviceModel,
      total_value: newAttendance.totalValue,
      data: newAttendance
    }]);

    if (data.usedItemId) {
      const itemToUpdate = inventory.find(i => i.id === data.usedItemId);
      if (itemToUpdate) {
        const newQty = Math.max(0, itemToUpdate.currentStock - 1);
        await handleUpdateStock(inventory.map(i => i.id === data.usedItemId ? {...i, currentStock: newQty} : i));
      }
    }

    setHistory([newAttendance, ...history]);
    setView('PAINEL');
  };

  const handleUpdateStock = async (updatedItems: InventoryItem[]) => {
    setInventory(updatedItems);
    for (const item of updatedItems) {
      await supabase.from('inventory_items').upsert({
        id: item.id,
        brand: item.brand,
        model: item.model,
        current_stock: item.currentStock,
        min_stock: item.minStock,
        data: item
      });
    }
  };

  const handleExcluir = async (id: string) => {
    if (!auditReason || auditReason.length < 5) return;
    
    const log: AuditLog = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user!.id,
      userName: user!.name,
      action: 'EXCLUSÃO',
      details: `Protocolo ${id} removido. Justificativa: ${auditReason}`,
      timestamp: new Date().toISOString(),
      targetId: id
    };

    await supabase.from('audit_logs').insert([log]);
    await supabase.from('attendances').update({ data: { ...history.find(a => a.id === id), isDeleted: true } }).eq('id', id);

    setLogs([log, ...logs]);
    setHistory(prev => prev.map(a => a.id === id ? { ...a, isDeleted: true } : a));
    setAuditTarget(null);
    setAuditReason('');
  };

  const handleExportSnapshot = () => {
    const snapshot = {
      version: 'v12.restoration_point',
      timestamp: new Date().toISOString(),
      data: {
        tenant,
        history,
        inventory,
        specialists,
        logs
      }
    };
    
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `iblind-snapshot-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSnapshot = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = JSON.parse(event.target?.result as string);
        if (content.version !== 'v12.restoration_point') {
          alert('Arquivo de restauração inválido ou versão incompatível.');
          return;
        }

        if (confirm('Atenção: Restaurar este snapshot substituirá todos os dados atuais na visualização local. Deseja continuar?')) {
          const { tenant, history, inventory, specialists, logs } = content.data;
          setTenant(tenant);
          setHistory(history);
          setInventory(inventory);
          setSpecialists(specialists);
          setLogs(logs);
          alert('Restauração concluída com sucesso!');
        }
      } catch (err) {
        alert('Erro ao processar arquivo de backup.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (isRecoveryMode) return <ResetPassword />;
  if (!user) return <Auth onLogin={(u) => { setUser(u); }} />;

  if (isLoading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
       <div className="flex flex-col items-center gap-12">
          <BrandLogo size="text-8xl" />
          <div className="w-64 h-1.5 bg-white/[0.03] rounded-full overflow-hidden">
            <div className="w-1/2 h-full bg-white animate-[loading_1.5s_infinite]" />
          </div>
       </div>
    </div>
  );

  return (
    <DashboardLayout 
      activeView={view} 
      onViewChange={setView} 
      userName={user.name} 
      onLogout={() => { authService.logout(); setUser(null); }}
    >
      <div className="max-content space-y-20 animate-premium-in pb-20">
        
        {view === 'PAINEL' && (
          <div className="space-y-16">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-12">
              <div className="space-y-3 text-left">
                <p className="text-[10px] font-bold text-white/10 uppercase tracking-[0.5em] mb-1">Hub iPlanner</p>
                <h1 className="text-5xl font-extrabold tracking-tighter text-white uppercase">Visão Operacional</h1>
              </div>
              <IBButton onClick={() => setView('WIZARD')} className="w-full md:w-auto px-16 h-18 text-xs font-extrabold">
                <Plus size={20} strokeWidth={4} /> NOVO SERVIÇO
              </IBButton>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <IBlindStatCard title="Faturamento Bruto" value={formatCurrency(stats.revenue)} icon={<TrendingUp size={24}/>} />
              <IBlindStatCard title="Tickets Ativos" value={stats.countToday} icon={<Zap size={24}/>} color="text-amber-400" />
              <IBlindStatCard title="Ruídos de Estoque" value={stats.criticalStock} icon={<Package size={24}/>} color={stats.criticalStock > 0 ? "text-red-500" : "text-emerald-400"} />
              <IBlindStatCard title="Time Ativo" value={specialists.length} icon={<UsersIcon size={24}/>} color="text-indigo-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-10">
                <div className="flex items-center justify-between px-2">
                  <h2 className="font-extrabold text-xl uppercase tracking-tight text-white/60">Serviços Recentes</h2>
                  <IBButton variant="ghost" className="h-10 px-6 text-[10px] font-bold" onClick={() => setView('SERVIÇOS')}>Ver Logs</IBButton>
                </div>
                <div className="space-y-4">
                  {history.filter(a => !a.isDeleted).slice(0, 5).map(a => (
                    <div 
                      key={a.id} 
                      onClick={() => setSelectedProtocol(a)}
                      className="group flex items-center justify-between p-8 bg-surface border border-white/5 rounded-premium hover:bg-surface-lighter hover:border-white/20 transition-all cursor-pointer active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-white/[0.03] text-white/40 rounded-2xl flex items-center justify-center border border-white/5 group-hover:scale-110 group-hover:text-white transition-all duration-500">
                          <Smartphone size={20}/>
                        </div>
                        <div className="text-left">
                          <p className="text-base font-extrabold uppercase text-white leading-tight">{a.clientName}</p>
                          <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest mt-1.5">{a.deviceModel} • <span className="text-white/40">{a.specialistName}</span></p>
                        </div>
                      </div>
                      <div className="flex items-center gap-10">
                        <p className="text-lg font-extrabold text-white tracking-tight">{formatCurrency(a.totalValue)}</p>
                        <ChevronRight size={18} className="text-white/5 group-hover:text-white transition-all duration-300" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-10">
                <h2 className="font-extrabold text-xl uppercase tracking-tight text-white/60 px-2">Riscos de Inventário</h2>
                <div className="space-y-4">
                  {inventory.filter(i => i.currentStock <= i.minStock).slice(0, 4).map(item => (
                    <div key={item.id} className="p-7 bg-red-500/[0.03] border border-red-500/10 rounded-premium flex items-center justify-between group">
                      <div className="text-left">
                        <p className="text-[12px] font-extrabold uppercase text-white leading-none">{item.model}</p>
                        <p className="text-[9px] text-red-400 font-bold uppercase mt-2 tracking-widest">{item.assignedSpecialistName || 'ESTOQUE CENTRAL'}</p>
                      </div>
                      <IBBadge variant="error">{item.currentStock} UN</IBBadge>
                    </div>
                  ))}
                  <IBButton variant="secondary" className="w-full h-16 rounded-premium mt-4" onClick={() => setView('ESTOQUE')}>
                    CONCILIAÇÃO DE ESTOQUE
                  </IBButton>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'ESPECIALISTAS' && (
          <SpecialistManagement 
            specialists={specialists} 
            history={history}
            onAdd={handleAddSpecialist}
            onDelete={handleDeleteSpecialist}
          />
        )}

        {view === 'ESTOQUE' && (
          <StockManagement 
            items={inventory} 
            specialists={specialists}
            onUpdateItems={handleUpdateStock}
          />
        )}

        {view === 'SERVIÇOS' && (
          <div className="space-y-16">
            <header className="space-y-4 text-left">
              <h2 className="text-5xl font-extrabold tracking-tighter uppercase text-white">Arquivo Digital</h2>
              <p className="text-white/10 text-[10px] font-bold uppercase tracking-[0.6em]">Full Traceability Mode</p>
            </header>
            <div className="grid gap-5">
              {history.map(a => (
                <IBCard 
                  key={a.id} 
                  onClick={() => !a.isDeleted && setSelectedProtocol(a)}
                  className={`flex items-center justify-between p-8 ${a.isDeleted ? 'opacity-10 grayscale blur-[1px]' : 'hover:border-white/20'}`}
                >
                  <div className="flex gap-8">
                    <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center text-white/10">
                        <FileText size={28} />
                    </div>
                    <div className="text-left">
                      <h4 className="font-extrabold text-xl uppercase text-white leading-tight">{a.clientName}</h4>
                      <p className="text-[11px] text-white/20 uppercase font-bold tracking-widest mt-2">{a.deviceModel} • {a.specialistName} • {new Date(a.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-10">
                    <div className="text-right hidden sm:block">
                      <p className="text-xl font-extrabold text-white tracking-tighter">{formatCurrency(a.totalValue)}</p>
                      <IBBadge variant={a.isDeleted ? "error" : "success"}>{a.isDeleted ? "AUDITADO: REMOVIDO" : "CONFORMIDADE ATIVA"}</IBBadge>
                    </div>
                    {!a.isDeleted && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setAuditTarget(a.id); }}
                        className="p-5 text-white/10 hover:text-red-500 transition-all hover:bg-red-500/5 rounded-2xl active:scale-90"
                      >
                        <Trash2 size={22}/>
                      </button>
                    )}
                  </div>
                </IBCard>
              ))}
            </div>
          </div>
        )}

        {view === 'AJUSTES' && (
          <div className="max-w-3xl space-y-16 mx-auto">
            <header className="space-y-4 text-left">
              <h2 className="text-5xl font-extrabold tracking-tighter uppercase text-white">Ajustes SaaS</h2>
              <p className="text-white/10 text-[10px] font-bold uppercase tracking-[0.6em]">System Architecture</p>
            </header>
            
            <IBCard className="space-y-16 p-12 text-left border-white/[0.03] bg-surface">
              <div className="space-y-10">
                <h3 className="text-[12px] font-bold text-white/10 uppercase tracking-[0.5em]">Global Settings</h3>
                <div className="grid grid-cols-1 gap-8">
                  <IBInput 
                    label="Tenant Identity" 
                    value={tenant.companyName} 
                    onChange={e => setTenant({...tenant, companyName: e.target.value})} 
                  />
                  <IBInput 
                    label="SLA de Garantia (Days)" 
                    type="number"
                    value={tenant.warrantyDefaultDays} 
                    onChange={e => setTenant({...tenant, warrantyDefaultDays: parseInt(e.target.value) || 0})} 
                  />
                </div>
              </div>

              <div className="space-y-10 border-t border-white/[0.05] pt-16">
                <h3 className="text-[12px] font-bold text-white/10 uppercase tracking-[0.5em]">Data & Resilience</h3>
                <div className="p-10 bg-black/40 rounded-premium border border-white/5 space-y-10">
                   <div className="flex items-center gap-6 text-white/30">
                      <Database size={32} className="text-white/10" />
                      <p className="text-[12px] font-bold uppercase tracking-widest leading-relaxed">
                        Exportação de snapshot estruturado para backup físico.
                      </p>
                   </div>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <IBButton variant="secondary" className="h-18 font-extrabold" onClick={handleExportSnapshot}>
                        SNAPSHOT OUT
                      </IBButton>
                      <label className="flex items-center justify-center gap-3 px-8 h-18 rounded-premium font-extrabold text-[11px] tracking-widest uppercase transition-all duration-300 border bg-surface-lighter text-white border-white/5 hover:border-white/30 cursor-pointer active:scale-95">
                        RESTORE IN
                        <input type="file" accept=".json" className="hidden" onChange={handleImportSnapshot} />
                      </label>
                   </div>
                </div>
              </div>

              <div className="space-y-10 border-t border-white/[0.05] pt-16">
                <h3 className="text-[12px] font-bold text-white/10 uppercase tracking-[0.5em]">Visual Identity</h3>
                <div className="grid grid-cols-2 gap-5">
                  <button 
                    onClick={() => setTheme('DARK')}
                    className={`flex flex-col items-center justify-center gap-6 h-40 rounded-premium border transition-all duration-500 ${theme === 'DARK' ? 'bg-white text-black border-white shadow-[0_20px_60px_rgba(255,255,255,0.15)]' : 'bg-surface-lighter text-white/10 border-white/5 hover:border-white/20'}`}
                  >
                    <Moon size={28} />
                    <span className="text-[11px] font-extrabold tracking-[0.3em] uppercase">Dark Mode</span>
                  </button>
                  <button 
                    onClick={() => setTheme('LIGHT')}
                    className={`flex flex-col items-center justify-center gap-6 h-40 rounded-premium border transition-all duration-500 ${theme === 'LIGHT' ? 'bg-white text-black border-white shadow-2xl' : 'bg-surface-lighter text-white/10 border-white/5 hover:border-white/20'}`}
                  >
                    <Sun size={28} />
                    <span className="text-[11px] font-extrabold tracking-[0.3em] uppercase">Light Mode</span>
                  </button>
                </div>
              </div>

              <div className="pt-10">
                <IBButton onClick={() => setView('PAINEL')} className="w-full h-22 text-sm font-extrabold">SALVAR E ATUALIZAR INTERFACE</IBButton>
              </div>
            </IBCard>
          </div>
        )}

        {selectedProtocol && (
          <div className="fixed inset-0 z-[200] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-6 sm:p-12 animate-premium-in safe-top safe-bottom">
            <div className="w-full max-w-5xl bg-surface border border-white/10 rounded-super flex flex-col h-full shadow-[0_0_120px_rgba(255,255,255,0.02)] overflow-hidden">
              <header className="p-10 border-b border-white/5 flex items-center justify-between">
                <div className="text-left">
                  <IBBadge variant="primary">REPORT: {selectedProtocol.warrantyId}</IBBadge>
                  <h3 className="text-3xl font-extrabold uppercase text-white mt-4 tracking-tighter">{selectedProtocol.clientName}</h3>
                </div>
                <button onClick={() => setSelectedProtocol(null)} className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all text-white active:scale-90">
                  <X size={28} />
                </button>
              </header>
              <div className="flex-1 overflow-y-auto p-12 space-y-20 no-scrollbar text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                  <section className="space-y-10">
                    <h4 className="text-[11px] font-bold text-white/10 uppercase tracking-[0.6em]">Hardware Specs</h4>
                    <div className="space-y-6">
                      <div className="p-8 bg-black/40 border border-white/5 rounded-premium">
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-3">Unit Model</p>
                        <p className="text-2xl font-extrabold uppercase tracking-tight">{selectedProtocol.deviceModel}</p>
                        <p className="text-[11px] text-white/30 font-medium mt-2">IMEI ID: {selectedProtocol.deviceIMEI || 'UNDEFINED'}</p>
                      </div>
                      <div className="p-8 bg-black/40 border border-white/5 rounded-premium">
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-3">Client Contact</p>
                        <p className="text-2xl font-extrabold">{selectedProtocol.clientPhone || 'N/A'}</p>
                      </div>
                    </div>
                  </section>
                  <section className="space-y-10">
                    <h4 className="text-[11px] font-bold text-white/10 uppercase tracking-[0.6em]">Incoming Inspection</h4>
                    <div className="grid grid-cols-2 gap-5">
                      {(['tela', 'traseira', 'cameras', 'botoes'] as const).map(part => (
                        <div key={part} className={`p-6 rounded-premium border ${selectedProtocol.state[part]?.hasDamage ? 'border-red-500/30 bg-red-500/[0.03]' : 'border-white/5 bg-black/40'}`}>
                          <p className="text-[10px] font-bold uppercase text-white/20 mb-2">{part}</p>
                          <p className={`text-[12px] font-extrabold uppercase ${selectedProtocol.state[part]?.hasDamage ? 'text-red-400' : 'text-emerald-400'}`}>
                            {selectedProtocol.state[part]?.hasDamage ? 'AVARIA' : 'ÍNTEGRO'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                {selectedProtocol.photos && selectedProtocol.photos.length > 0 && (
                  <section className="space-y-10">
                    <h4 className="text-[11px] font-bold text-white/10 uppercase tracking-[0.6em]">Visual Evidence</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                      {selectedProtocol.photos.map((photo, i) => (
                        <div key={i} className="aspect-square rounded-premium overflow-hidden border border-white/5 bg-black/40 group">
                          <img src={photo} className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000" />
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                <section className="space-y-10">
                  <h4 className="text-[11px] font-bold text-white/10 uppercase tracking-[0.6em]">Client Confirmation</h4>
                  <div className="p-10 bg-black/40 border border-white/10 rounded-premium h-72 flex items-center justify-center">
                    {selectedProtocol.clientSignature ? (
                      <img src={selectedProtocol.clientSignature} className={`max-h-full ${theme === 'DARK' ? 'invert' : ''} opacity-60 brightness-125`} />
                    ) : (
                      <p className="text-[11px] text-white/10 uppercase tracking-[0.3em] font-extrabold">Waiting signature</p>
                    )}
                  </div>
                </section>
              </div>
              <footer className="p-12 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center bg-surface gap-10">
                <div className="text-left">
                  <p className="text-[11px] font-bold text-white/10 uppercase tracking-[0.5em]">Service Final Value</p>
                  <p className="text-5xl font-extrabold mt-2 text-white tracking-tighter">{formatCurrency(selectedProtocol.totalValue)}</p>
                </div>
                <div className="flex gap-5 w-full sm:w-auto">
                   <IBButton variant="secondary" onClick={() => window.print()} className="flex-1 sm:px-12 h-20">PRINT PDF</IBButton>
                   <IBButton variant="primary" onClick={() => setSelectedProtocol(null)} className="flex-1 sm:px-14 h-20">DISMISS</IBButton>
                </div>
              </footer>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default App;
