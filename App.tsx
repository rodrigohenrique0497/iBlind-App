
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
       <div className="flex flex-col items-center gap-10">
          <BrandLogo size="text-7xl" />
          <div className="w-48 h-1 bg-white/[0.05] rounded-full overflow-hidden">
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
      <div className="max-content space-y-16 animate-premium-in pb-20">
        
        {view === 'PAINEL' && (
          <div className="space-y-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-10">
              <div className="space-y-2 text-left">
                <p className="text-[11px] font-extrabold text-white/20 uppercase tracking-[0.3em] mb-1">Visão Geral</p>
                <h1 className="text-4xl font-extrabold tracking-tighter text-foreground uppercase">Inteligência Operacional</h1>
              </div>
              <IBButton onClick={() => setView('WIZARD')} className="w-full md:w-auto px-12 h-16 rounded-super">
                <Plus size={20} strokeWidth={3} /> NOVO SERVIÇO
              </IBButton>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <IBlindStatCard title="Receita Bruta" value={formatCurrency(stats.revenue)} icon={<TrendingUp size={20}/>} />
              <IBlindStatCard title="Tickets Hoje" value={stats.countToday} icon={<Zap size={20}/>} color="text-amber-400" />
              <IBlindStatCard title="Estoque" value={stats.criticalStock} icon={<Package size={20}/>} color={stats.criticalStock > 0 ? "text-red-500" : "text-emerald-400"} />
              <IBlindStatCard title="Especialistas" value={specialists.length} icon={<UsersIcon size={20}/>} color="text-indigo-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="font-extrabold text-lg uppercase tracking-tight flex items-center gap-3 text-foreground">Fluxo Recente</h2>
                  <IBButton variant="ghost" className="h-10 px-4 text-[10px]" onClick={() => setView('SERVIÇOS')}>HISTÓRICO COMPLETO</IBButton>
                </div>
                <div className="space-y-3">
                  {history.filter(a => !a.isDeleted).slice(0, 5).map(a => (
                    <div 
                      key={a.id} 
                      onClick={() => setSelectedProtocol(a)}
                      className="group flex items-center justify-between p-6 bg-surface border border-white/5 rounded-super hover:border-white/20 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-white/[0.03] text-foreground rounded-2xl flex items-center justify-center border border-white/5">
                          <Smartphone size={18}/>
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-extrabold uppercase text-foreground">{a.clientName}</p>
                          <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest mt-0.5">{a.deviceModel} • {a.specialistName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <p className="text-sm font-black text-foreground">{formatCurrency(a.totalValue)}</p>
                        <ChevronRight size={16} className="text-white/10 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-8">
                <h2 className="font-extrabold text-lg uppercase tracking-tight flex items-center gap-3 text-foreground">Alertas de Estoque</h2>
                <div className="space-y-3">
                  {inventory.filter(i => i.currentStock <= i.minStock).slice(0, 4).map(item => (
                    <div key={item.id} className="p-5 bg-red-500/5 border border-red-500/10 rounded-super flex items-center justify-between">
                      <div className="text-left">
                        <p className="text-[11px] font-black uppercase text-foreground">{item.model}</p>
                        <p className="text-[9px] text-red-500 font-bold uppercase mt-1">{item.assignedSpecialistName || 'ESTOQUE CENTRAL'}</p>
                      </div>
                      <IBBadge variant="error">{item.currentStock} UN</IBBadge>
                    </div>
                  ))}
                  <IBButton variant="secondary" className="w-full h-14" onClick={() => setView('ESTOQUE')}>
                    CONCILIAR INVENTÁRIO
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
          <div className="space-y-12">
            <header className="space-y-2 text-left">
              <h2 className="text-4xl font-extrabold tracking-tighter uppercase text-foreground">Histórico Operacional</h2>
              <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.4em]">Registros e Rastreabilidade</p>
            </header>
            <div className="grid gap-4">
              {history.map(a => (
                <IBCard 
                  key={a.id} 
                  onClick={() => !a.isDeleted && setSelectedProtocol(a)}
                  className={`flex items-center justify-between p-6 ${a.isDeleted ? 'opacity-10 grayscale' : 'hover:border-white/20'}`}
                >
                  <div className="flex gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white/30">
                        <FileText size={24} />
                    </div>
                    <div className="text-left">
                      <h4 className="font-extrabold text-lg uppercase text-foreground">{a.clientName}</h4>
                      <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest mt-1">{a.deviceModel} • {a.specialistName} • {new Date(a.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right hidden sm:block">
                      <p className="text-lg font-black text-foreground">{formatCurrency(a.totalValue)}</p>
                      <IBBadge variant={a.isDeleted ? "error" : "success"}>{a.isDeleted ? "REMOVIDO" : "ATIVO"}</IBBadge>
                    </div>
                    {!a.isDeleted && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setAuditTarget(a.id); }}
                        className="p-4 text-white/10 hover:text-red-500 transition-all hover:bg-red-500/5 rounded-2xl"
                      >
                        <Trash2 size={20}/>
                      </button>
                    )}
                  </div>
                </IBCard>
              ))}
            </div>
          </div>
        )}

        {view === 'AJUSTES' && (
          <div className="max-w-2xl space-y-12 mx-auto">
            <header className="space-y-2 text-left">
              <h2 className="text-4xl font-extrabold tracking-tighter uppercase text-foreground">Configurações</h2>
              <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.4em]">Ecossistema SaaS</p>
            </header>
            
            <IBCard className="space-y-12 p-10 text-left border-white/[0.03] bg-card">
              <div className="space-y-8">
                <h3 className="text-[11px] font-black text-white/20 uppercase tracking-[0.4em]">Personalização Corporativa</h3>
                <div className="grid grid-cols-1 gap-6">
                  <IBInput 
                    label="Nomenclatura da Empresa" 
                    value={tenant.companyName} 
                    onChange={e => setTenant({...tenant, companyName: e.target.value})} 
                  />
                  <IBInput 
                    label="Prazo de Garantia (Em Dias)" 
                    type="number"
                    value={tenant.warrantyDefaultDays} 
                    onChange={e => setTenant({...tenant, warrantyDefaultDays: parseInt(e.target.value) || 0})} 
                  />
                </div>
              </div>

              <div className="space-y-8 border-t border-white/[0.03] pt-12">
                <h3 className="text-[11px] font-black text-white/20 uppercase tracking-[0.4em]">Manutenção & Backup</h3>
                <div className="p-8 bg-surface rounded-super border border-white/5 space-y-8">
                   <div className="flex items-center gap-5 text-white/40">
                      <Database size={28} className="text-white/20" />
                      <p className="text-[11px] font-bold uppercase tracking-widest leading-relaxed">
                        Crie um ponto de restauração offline para segurança extra.
                      </p>
                   </div>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <IBButton variant="secondary" className="h-16 text-[10px]" onClick={handleExportSnapshot}>
                        <DownloadCloud size={18} /> EXPORTAR DADOS
                      </IBButton>
                      <label className="flex items-center justify-center gap-3 px-8 h-16 rounded-premium font-bold text-[10px] tracking-wider uppercase transition-all duration-300 border bg-surface text-foreground border-white/5 hover:border-white/20 hover:bg-white/[0.04] cursor-pointer">
                        <UploadCloud size={18} /> RESTAURAR
                        <input type="file" accept=".json" className="hidden" onChange={handleImportSnapshot} />
                      </label>
                   </div>
                </div>
              </div>

              <div className="space-y-8 border-t border-white/[0.03] pt-12">
                <h3 className="text-[11px] font-black text-white/20 uppercase tracking-[0.4em]">Interface Visual</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setTheme('DARK')}
                    className={`flex flex-col items-center justify-center gap-4 h-32 rounded-super border transition-all ${theme === 'DARK' ? 'bg-white text-black border-white shadow-2xl' : 'bg-surface text-white/20 border-white/5 hover:border-white/20'}`}
                  >
                    <Moon size={24} />
                    <span className="text-[10px] font-black tracking-widest uppercase">Escuro Profundo</span>
                  </button>
                  <button 
                    onClick={() => setTheme('LIGHT')}
                    className={`flex flex-col items-center justify-center gap-4 h-32 rounded-super border transition-all ${theme === 'LIGHT' ? 'bg-white text-black border-white shadow-2xl' : 'bg-surface text-white/20 border-white/5 hover:border-white/20'}`}
                  >
                    <Sun size={24} />
                    <span className="text-[10px] font-black tracking-widest uppercase">Claro Minimal</span>
                  </button>
                </div>
              </div>

              <div className="pt-6">
                <IBButton onClick={() => setView('PAINEL')} className="w-full h-20 text-sm">ATUALIZAR PLATAFORMA</IBButton>
              </div>
            </IBCard>
          </div>
        )}

        {view === 'AUDITORIA' && (
          <div className="space-y-12">
            <header className="space-y-2 text-left">
              <h2 className="text-4xl font-extrabold tracking-tighter uppercase text-foreground">Trilha de Auditoria</h2>
              <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.4em]">Integridade e Conformidade</p>
            </header>
            <div className="bg-surface border border-white/5 rounded-super overflow-hidden overflow-x-auto shadow-2xl">
              <table className="w-full text-left min-w-[700px]">
                <thead className="bg-white/[0.02] border-b border-white/5">
                  <tr>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/20">Timestamp</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/20">Operador</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/20">Evento</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-white/20">Contexto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {logs.map(log => (
                    <tr key={log.id} className="text-[11px] text-white/60 hover:bg-white/[0.01] transition-colors">
                      <td className="px-8 py-6 font-medium">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="px-8 py-6 font-bold uppercase text-foreground">{log.userName}</td>
                      <td className="px-8 py-6"><IBBadge variant="error">{log.action}</IBBadge></td>
                      <td className="px-8 py-6 max-w-sm truncate text-white/40">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedProtocol && (
          <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4 sm:p-10 animate-premium-in safe-top safe-bottom">
            <div className="w-full max-w-4xl bg-card border border-white/5 rounded-super flex flex-col h-full shadow-[0_0_100px_rgba(255,255,255,0.05)] overflow-hidden">
              <header className="p-8 border-b border-white/5 flex items-center justify-between">
                <div className="text-left">
                  <IBBadge variant="primary">PROTOCOLO #{selectedProtocol.warrantyId}</IBBadge>
                  <h3 className="text-2xl font-black uppercase text-foreground mt-3">{selectedProtocol.clientName}</h3>
                </div>
                <button onClick={() => setSelectedProtocol(null)} className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all text-white">
                  <X size={24} />
                </button>
              </header>
              <div className="flex-1 overflow-y-auto p-10 space-y-16 no-scrollbar text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                  <section className="space-y-8">
                    <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Relatório Técnico</h4>
                    <div className="space-y-6">
                      <div className="p-6 bg-surface border border-white/5 rounded-super">
                        <p className="text-[9px] font-bold text-white/20 uppercase mb-2">Dispositivo</p>
                        <p className="text-lg font-extrabold uppercase">{selectedProtocol.deviceModel}</p>
                        <p className="text-[10px] text-white/30 font-medium mt-1">IMEI/SÉRIE: {selectedProtocol.deviceIMEI || 'NÃO INFORMADO'}</p>
                      </div>
                      <div className="p-6 bg-surface border border-white/5 rounded-super">
                        <p className="text-[9px] font-bold text-white/20 uppercase mb-2">Contato</p>
                        <p className="text-lg font-extrabold">{selectedProtocol.clientPhone || 'SEM CONTATO'}</p>
                      </div>
                    </div>
                  </section>
                  <section className="space-y-8">
                    <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Inspeção de Entrada</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {(['tela', 'traseira', 'cameras', 'botoes'] as const).map(part => (
                        <div key={part} className={`p-5 rounded-super border ${selectedProtocol.state[part]?.hasDamage ? 'border-red-500/20 bg-red-500/5' : 'border-white/5 bg-surface'}`}>
                          <p className="text-[9px] font-black uppercase text-white/30 mb-1">{part}</p>
                          <p className={`text-[11px] font-bold uppercase ${selectedProtocol.state[part]?.hasDamage ? 'text-red-500' : 'text-emerald-500'}`}>
                            {selectedProtocol.state[part]?.hasDamage ? 'COM AVARIA' : 'ÍNTEGRO'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                {selectedProtocol.photos && selectedProtocol.photos.length > 0 && (
                  <section className="space-y-8">
                    <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Evidências Fotográficas</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                      {selectedProtocol.photos.map((photo, i) => (
                        <div key={i} className="aspect-square rounded-super overflow-hidden border border-white/5 bg-surface group">
                          <img src={photo} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                <section className="space-y-8">
                  <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Aceite Digital</h4>
                  <div className="p-8 bg-surface border border-white/10 rounded-super h-60 flex items-center justify-center">
                    {selectedProtocol.clientSignature ? (
                      <img src={selectedProtocol.clientSignature} className={`max-h-full ${theme === 'DARK' ? 'invert' : ''} opacity-80`} />
                    ) : (
                      <p className="text-[10px] text-white/10 uppercase tracking-widest font-black">Nenhuma assinatura capturada</p>
                    )}
                  </div>
                </section>
              </div>
              <footer className="p-10 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center bg-card gap-8">
                <div className="text-left">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Ticket Médio do Serviço</p>
                  <p className="text-4xl font-extrabold mt-1 text-foreground tracking-tighter">{formatCurrency(selectedProtocol.totalValue)}</p>
                </div>
                <div className="flex gap-4 w-full sm:w-auto">
                   <IBButton variant="secondary" onClick={() => window.print()} className="flex-1 sm:px-10">GERAR PDF</IBButton>
                   <IBButton variant="primary" onClick={() => setSelectedProtocol(null)} className="flex-1 sm:px-12">FECHAR</IBButton>
                </div>
              </footer>
            </div>
          </div>
        )}

        {auditTarget && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/90 backdrop-blur-2xl animate-premium-in">
            <IBCard className="w-full max-w-lg space-y-8 p-10 border-red-500/20 text-left bg-card shadow-2xl">
              <div className="flex items-center gap-4 text-red-500">
                  <AlertTriangle size={28}/>
                  <h3 className="text-2xl font-black uppercase tracking-tight">Autorizar Exclusão</h3>
              </div>
              <p className="text-[11px] text-white/40 leading-relaxed uppercase font-bold tracking-wider">Esta operação gerará um alerta no log de auditoria do sistema.</p>
              <textarea 
                className="w-full bg-surface border border-white/5 rounded-premium p-6 text-sm outline-none focus:border-red-500 transition-all h-32 resize-none text-foreground font-semibold placeholder:text-white/10"
                placeholder="Justifique a remoção deste protocolo..."
                value={auditReason}
                onChange={(e) => setAuditReason(e.target.value)}
              />
              <div className="flex gap-4 pt-4">
                <IBButton variant="ghost" className="flex-1 h-16" onClick={() => {setAuditTarget(null); setAuditReason('');}}>ABORTAR</IBButton>
                <IBButton variant="danger" className="flex-1 h-16" disabled={auditReason.length < 5} onClick={() => handleExcluir(auditTarget)}>CONFIRMAR</IBButton>
              </div>
            </IBCard>
          </div>
        )}

        {view === 'WIZARD' && (
          <div className="fixed inset-0 z-[400] bg-background">
            <NewServiceWizard 
              inventory={inventory}
              specialists={specialists}
              onCancel={() => setView('PAINEL')}
              onComplete={handleCompleteService}
            />
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default App;
