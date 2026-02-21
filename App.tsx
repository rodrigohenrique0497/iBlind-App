
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Shield, TrendingUp, Package, BarChart3, Plus, History, 
  Settings as SettingsIcon, Moon, Sun, Search, Smartphone, Clock, AlertTriangle,
  Zap, Trash2, ArrowUpRight, Activity, Camera, X, FileText, ChevronRight, Users as UsersIcon
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
        const fetchProfile = async () => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          const u: User = {
            id: session.user.id,
            name: profile?.name || session.user.user_metadata.full_name || 'Operador',
            email: session.user.email!,
            role: profile?.role || 'ADMIN',
            tenantId: profile?.tenant_id || session.user.id
          };
          setUser(u);
          authService.setSession(u);
        };
        fetchProfile();
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
          supabase.from('attendances').select('*').eq('tenant_id', user.tenantId).order('created_at', { ascending: false }),
          supabase.from('inventory_items').select('*').eq('tenant_id', user.tenantId),
          supabase.from('audit_logs').select('*').eq('tenant_id', user.tenantId).order('timestamp', { ascending: false }),
          supabase.from('profiles').select('*').eq('tenant_id', user.tenantId).eq('role', 'ESPECIALISTA')
        ]);

        if (attRes.error) console.error('Erro attendances:', attRes.error);
        if (invRes.error) console.error('Erro inventory:', invRes.error);
        if (logRes.error) console.error('Erro logs:', logRes.error);
        if (usersRes.error) console.error('Erro profiles:', usersRes.error);

        if (attRes.data) setHistory(attRes.data.map(row => ({...row.data, id: row.id})));
        if (invRes.data) setInventory(invRes.data.map(row => ({...row.data, id: row.id})));
        if (logRes.data) {
          setLogs(logRes.data.map(l => ({
            id: l.id,
            userId: l.user_id,
            userName: l.user_name,
            action: l.action,
            details: l.details,
            timestamp: l.timestamp,
            targetId: l.target_id
          })));
        }
        
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
      role: 'ESPECIALISTA' as const,
      tenant_id: user!.tenantId
    };
    await supabase.from('profiles').insert([newSpec]);
    setSpecialists([...specialists, { ...newSpec, tenantId: user!.tenantId }]);
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
      tenant_id: user!.tenantId,
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
        tenant_id: user!.tenantId,
        data: item
      });
    }
  };

  const handleExcluir = async (id: string) => {
    if (!auditReason || auditReason.length < 5) return;
    const logData = {
      id: Math.random().toString(36).substr(2, 9),
      user_id: user!.id,
      user_name: user!.name,
      tenant_id: user!.tenantId,
      action: 'EXCLUSÃO',
      details: `Protocolo ${id} removido. Justificativa: ${auditReason}`,
      timestamp: new Date().toISOString(),
      target_id: id
    };
    
    const { error: logError } = await supabase.from('audit_logs').insert([logData]);
    if (logError) console.error('Erro ao salvar log:', logError);

    const { error: attError } = await supabase.from('attendances').update({ 
      data: { ...history.find(a => a.id === id), isDeleted: true } 
    }).eq('id', id);
    if (attError) console.error('Erro ao atualizar atendimento:', attError);

    const log: AuditLog = {
      id: logData.id,
      userId: logData.user_id,
      userName: logData.user_name,
      action: logData.action,
      details: logData.details,
      timestamp: logData.timestamp,
      targetId: logData.target_id
    };

    setLogs([log, ...logs]);
    setHistory(prev => prev.map(a => a.id === id ? { ...a, isDeleted: true } : a));
    setAuditTarget(null);
    setAuditReason('');
  };

  if (isRecoveryMode) return <ResetPassword />;
  if (!user) return <Auth onLogin={(u) => { setUser(u); }} />;

  if (isLoading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
       <div className="flex flex-col items-center gap-6">
          <BrandLogo size="text-5xl" />
          <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
            <div className="w-1/2 h-full bg-foreground animate-[loading_1.5s_infinite]" />
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
      <div className="space-y-8 animate-premium-in pb-12">
        
        {view === 'PAINEL' && (
          <div className="space-y-10">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-1.5 text-left">
                <h1 className="text-2xl lg:text-3xl brand-font-bold tracking-tight text-foreground uppercase">iBlind</h1>
                <p className="text-muted-foreground text-[8px] font-bold tracking-[0.4em] uppercase opacity-40">Status Operacional</p>
              </div>
              <IBButton onClick={() => setView('WIZARD')} className="w-full md:w-auto h-16 rounded-2xl">
                <Plus size={18} /> NOVO ATENDIMENTO
              </IBButton>
            </header>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <IBlindStatCard title="Receita" value={formatCurrency(stats.revenue)} icon={<TrendingUp size={18}/>} />
              <IBlindStatCard title="Hoje" value={stats.countToday} icon={<Zap size={18}/>} color="text-amber-500" />
              <IBlindStatCard title="Alertas" value={stats.criticalStock} icon={<Package size={18}/>} color={stats.criticalStock > 0 ? "text-red-500" : "text-emerald-500"} />
              <IBlindStatCard title="Equipe" value={specialists.length} icon={<UsersIcon size={18}/>} color="text-indigo-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <IBCard className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="brand-font-bold text-lg uppercase flex items-center gap-2 text-foreground">Serviços Ativos</h2>
                  <IBButton variant="ghost" className="px-3 py-1.5 text-[8px]" onClick={() => setView('SERVIÇOS')}>HISTÓRICO</IBButton>
                </div>
                <div className="space-y-3">
                  {history.filter(a => !a.isDeleted).slice(0, 5).map(a => (
                    <div 
                      key={a.id} 
                      onClick={() => setSelectedProtocol(a)}
                      className="group flex items-center justify-between p-4 bg-foreground/5 rounded-2xl border border-transparent hover:border-foreground/10 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-foreground/5 text-foreground rounded-lg flex items-center justify-center">
                          <Smartphone size={16}/>
                        </div>
                        <div className="text-left">
                          <p className="text-[11px] font-bold uppercase text-foreground">{a.clientName}</p>
                          <p className="text-[8px] text-muted-foreground uppercase tracking-widest mt-0.5">{a.deviceModel}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-[11px] font-bold text-foreground">{formatCurrency(a.totalValue)}</p>
                        <ChevronRight size={12} className="text-foreground/10" />
                      </div>
                    </div>
                  ))}
                </div>
              </IBCard>

              <IBCard className="space-y-6">
                <h2 className="brand-font-bold text-lg uppercase flex items-center gap-2 text-foreground">Estoque Crítico</h2>
                <div className="space-y-3">
                  {inventory.filter(i => i.currentStock <= i.minStock).slice(0, 4).map(item => (
                    <div key={item.id} className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl flex items-center justify-between">
                      <div className="text-left">
                        <p className="text-[9px] font-bold uppercase text-foreground">{item.model}</p>
                        <p className="text-[7px] text-red-500 font-bold uppercase mt-0.5">{item.assignedSpecialistName || 'ESTOQUE'}</p>
                      </div>
                      <IBBadge variant="error">{item.currentStock}</IBBadge>
                    </div>
                  ))}
                  <IBButton variant="secondary" className="w-full h-12 rounded-xl text-[8px]" onClick={() => setView('ESTOQUE')}>
                    INVENTÁRIO COMPLETO
                  </IBButton>
                </div>
              </IBCard>
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
          <div className="space-y-8">
            <header className="space-y-1 text-left">
              <h2 className="text-3xl brand-font-bold uppercase text-foreground">Histórico</h2>
              <p className="text-muted-foreground text-[8px] font-bold uppercase tracking-[0.4em] opacity-40">Registros de Blindagem</p>
            </header>
            <div className="grid gap-3">
              {history.map(a => (
                <IBCard 
                  key={a.id} 
                  onClick={() => !a.isDeleted && setSelectedProtocol(a)}
                  className={`flex items-center justify-between p-4 ${a.isDeleted ? 'opacity-20 pointer-events-none' : 'hover:border-foreground/20 pointer-events-auto cursor-pointer'}`}
                >
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-foreground/5 flex items-center justify-center text-foreground/50">
                        <FileText size={18} />
                    </div>
                    <div className="text-left">
                      <h4 className="brand-font-bold text-sm uppercase text-foreground">{a.clientName}</h4>
                      <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest mt-0.5">{a.deviceModel} • {a.specialistName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <p className="text-[11px] font-bold text-foreground">{formatCurrency(a.totalValue)}</p>
                    </div>
                    {!a.isDeleted && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setAuditTarget(a.id); }}
                        className="p-2 text-foreground/10 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16}/>
                      </button>
                    )}
                  </div>
                </IBCard>
              ))}
            </div>
          </div>
        )}

        {view === 'AJUSTES' && (
          <div className="max-w-2xl space-y-10">
            <header className="space-y-1 text-left">
              <h2 className="text-3xl brand-font-bold uppercase text-foreground">Ajustes</h2>
              <p className="text-muted-foreground text-[8px] font-bold uppercase tracking-[0.4em] opacity-40">Preferências do Sistema</p>
            </header>
            
            <IBCard className="space-y-8 p-8 text-left">
              <div className="space-y-5">
                <h3 className="text-[9px] font-black text-foreground/30 uppercase tracking-[0.4em]">Empresa</h3>
                <div className="grid grid-cols-1 gap-6">
                  <IBInput 
                    label="Nome iBlind" 
                    value={tenant.companyName} 
                    onChange={e => setTenant({...tenant, companyName: e.target.value})} 
                  />
                  <IBInput 
                    label="Garantia Padrão (Dias)" 
                    type="number"
                    value={tenant.warrantyDefaultDays} 
                    onChange={e => setTenant({...tenant, warrantyDefaultDays: parseInt(e.target.value) || 0})} 
                  />
                </div>
              </div>

              <div className="space-y-5 border-t border-foreground/5 pt-8">
                <h3 className="text-[9px] font-black text-foreground/30 uppercase tracking-[0.4em]">Tema</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setTheme('DARK')}
                    className={`flex items-center justify-center gap-2 p-5 rounded-2xl border transition-all ${theme === 'DARK' ? 'bg-foreground text-background border-foreground shadow-lg' : 'bg-transparent text-foreground/40 border-foreground/10'}`}
                  >
                    <Moon size={16} />
                    <span className="text-[9px] font-black tracking-widest uppercase">Escuro</span>
                  </button>
                  <button 
                    onClick={() => setTheme('LIGHT')}
                    className={`flex items-center justify-center gap-2 p-5 rounded-2xl border transition-all ${theme === 'LIGHT' ? 'bg-foreground text-background border-foreground shadow-lg' : 'bg-transparent text-foreground/40 border-foreground/10'}`}
                  >
                    <Sun size={16} />
                    <span className="text-[9px] font-black tracking-widest uppercase">Claro</span>
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <IBButton onClick={() => setView('PAINEL')} className="w-full h-16 rounded-2xl">SALVAR ALTERAÇÕES</IBButton>
              </div>
            </IBCard>
          </div>
        )}

        {view === 'AUDITORIA' && (
          <div className="space-y-8">
            <header className="space-y-1 text-left">
              <h2 className="text-3xl brand-font-bold uppercase text-foreground">Logs</h2>
              <p className="text-muted-foreground text-[8px] font-bold uppercase tracking-[0.4em] opacity-40">Auditoria</p>
            </header>
            <div className="bg-foreground/5 border border-foreground/5 rounded-2xl overflow-hidden overflow-x-auto">
              <table className="w-full text-left min-w-[500px]">
                <thead className="bg-foreground/5 border-b border-foreground/5">
                  <tr>
                    <th className="px-5 py-3 text-[8px] font-black uppercase tracking-widest text-foreground/30">Data</th>
                    <th className="px-5 py-3 text-[8px] font-black uppercase tracking-widest text-foreground/30">Usuário</th>
                    <th className="px-5 py-3 text-[8px] font-black uppercase tracking-widest text-foreground/30">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-foreground/5">
                  {logs.map(log => (
                    <tr key={log.id} className="text-[10px] text-foreground/60">
                      <td className="px-5 py-3">{new Date(log.timestamp).toLocaleDateString()}</td>
                      <td className="px-5 py-3 font-bold uppercase">{log.userName.split(' ')[0]}</td>
                      <td className="px-5 py-3"><IBBadge variant="error">{log.action}</IBBadge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedProtocol && (
          <div className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8 animate-premium-in">
            <div className="w-full max-w-4xl bg-card border border-foreground/10 rounded-[40px] flex flex-col h-[90vh] shadow-2xl overflow-hidden">
              <header className="p-6 border-b border-foreground/5 flex items-center justify-between">
                <div className="text-left">
                  <h3 className="text-xl brand-font-bold uppercase text-foreground">PROT. #{selectedProtocol.id}</h3>
                  <p className="text-[9px] text-foreground/20 font-black uppercase mt-0.5">{selectedProtocol.specialistName}</p>
                </div>
                <button onClick={() => setSelectedProtocol(null)} className="w-10 h-10 bg-foreground/5 rounded-xl flex items-center justify-center hover:bg-foreground/10 text-foreground">
                  <X size={20} />
                </button>
              </header>
              <div className="flex-1 overflow-y-auto p-6 space-y-10 no-scrollbar text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <section className="space-y-4">
                    <h4 className="text-[9px] font-black text-foreground/20 uppercase tracking-[0.4em]">Cliente</h4>
                    <div>
                      <p className="text-lg font-bold uppercase text-foreground">{selectedProtocol.clientName}</p>
                      <p className="text-xs text-foreground/40">{selectedProtocol.clientPhone || 'N/A'}</p>
                    </div>
                  </section>
                  <section className="space-y-4">
                    <h4 className="text-[9px] font-black text-foreground/20 uppercase tracking-[0.4em]">Vistoria de Entrada</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {['tela', 'traseira', 'cameras'].map(part => (
                        <div key={part} className={`p-3 rounded-xl border ${selectedProtocol.entryState[part].hasDamage ? 'border-red-500/20 bg-red-500/5' : 'border-foreground/5 bg-foreground/5'}`}>
                          <p className="text-[7px] font-black uppercase text-foreground/30">{part}</p>
                          <p className={`text-[8px] font-bold mt-0.5 ${selectedProtocol.entryState[part].hasDamage ? 'text-red-500' : 'text-foreground/40'}`}>
                            {selectedProtocol.entryState[part].hasDamage ? 'AVARIA' : 'OK'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                {selectedProtocol.exitState && (
                  <section className="space-y-4">
                    <h4 className="text-[9px] font-black text-foreground/20 uppercase tracking-[0.4em]">Vistoria de Saída</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {['tela', 'traseira', 'cameras'].map(part => (
                        <div key={part} className={`p-3 rounded-xl border ${selectedProtocol.exitState![part].hasDamage ? 'border-red-500/20 bg-red-500/5' : 'border-foreground/5 bg-foreground/5'}`}>
                          <p className="text-[7px] font-black uppercase text-foreground/30">{part}</p>
                          <p className={`text-[8px] font-bold mt-0.5 ${selectedProtocol.exitState![part].hasDamage ? 'text-red-500' : 'text-foreground/40'}`}>
                            {selectedProtocol.exitState![part].hasDamage ? 'AVARIA' : 'OK'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
              <footer className="p-6 border-t border-foreground/5 flex justify-between items-center bg-card">
                <div className="text-left">
                  <p className="text-[8px] font-black text-foreground/20 uppercase">Total</p>
                  <p className="text-2xl brand-font-bold text-foreground">{formatCurrency(selectedProtocol.totalValue)}</p>
                </div>
                <IBButton variant="secondary" className="h-12 px-6 rounded-xl text-[10px]" onClick={() => window.print()}>PDF</IBButton>
              </footer>
            </div>
          </div>
        )}

        {auditTarget && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-5 bg-background/90 backdrop-blur-xl animate-premium-in">
            <IBCard className="w-full max-w-lg space-y-6 p-8 border-red-500/20 text-left">
              <div className="flex items-center gap-3 text-red-500">
                  <AlertTriangle size={20}/>
                  <h3 className="text-xl brand-font-bold uppercase">Excluir?</h3>
              </div>
              <textarea 
                className="w-full bg-background border border-foreground/5 rounded-2xl p-4 text-[11px] outline-none focus:border-red-500 transition-all h-28 resize-none text-foreground"
                placeholder="Motivo..."
                value={auditReason}
                onChange={(e) => setAuditReason(e.target.value)}
              />
              <div className="flex gap-3 pt-2">
                <IBButton variant="ghost" className="flex-1 h-14 rounded-xl" onClick={() => setAuditTarget(null)}>VOLTAR</IBButton>
                <IBButton variant="danger" className="flex-1 h-14 rounded-xl" disabled={auditReason.length < 5} onClick={() => handleExcluir(auditTarget)}>EXCLUIR</IBButton>
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
