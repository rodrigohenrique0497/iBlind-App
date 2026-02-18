
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
        
        // Removido o fallback de dados fictícios (Carlos/Ana)
        if (usersRes.data) {
          setSpecialists(usersRes.data);
        } else {
          setSpecialists([]);
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

  if (isRecoveryMode) return <ResetPassword />;
  if (!user) return <Auth onLogin={(u) => { setUser(u); }} />;

  if (isLoading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
       <div className="flex flex-col items-center gap-6">
          <BrandLogo size="text-6xl" />
          <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
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
      <div className="max-content space-y-12 animate-premium-in pb-20">
        
        {view === 'PAINEL' && (
          <div className="space-y-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="space-y-2 text-left">
                <h1 className="text-3xl brand-font-bold tracking-tight text-foreground uppercase">iBlind</h1>
                <p className="text-muted-foreground text-[10px] font-bold tracking-[0.4em] uppercase opacity-40">Painel de Inteligência</p>
              </div>
              <IBButton onClick={() => setView('WIZARD')} className="w-full md:w-auto px-10">
                <Plus size={20} /> NOVO ATENDIMENTO
              </IBButton>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <IBlindStatCard title="Receita" value={formatCurrency(stats.revenue)} icon={<TrendingUp size={20}/>} />
              <IBlindStatCard title="Hoje" value={stats.countToday} icon={<Zap size={20}/>} color="text-amber-500" />
              <IBlindStatCard title="Alertas" value={stats.criticalStock} icon={<Package size={20}/>} color={stats.criticalStock > 0 ? "text-red-500" : "text-emerald-500"} />
              <IBlindStatCard title="Especialistas" value={specialists.length} icon={<UsersIcon size={20}/>} color="text-indigo-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <IBCard className="lg:col-span-2 space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="brand-font-bold text-xl uppercase flex items-center gap-3 text-foreground">Atividades Recentes</h2>
                  <IBButton variant="ghost" className="px-4 py-2 text-xs" onClick={() => setView('SERVIÇOS')}>VER TUDO</IBButton>
                </div>
                <div className="space-y-4">
                  {history.filter(a => !a.isDeleted).slice(0, 5).map(a => (
                    <div 
                      key={a.id} 
                      onClick={() => setSelectedProtocol(a)}
                      className="group flex items-center justify-between p-5 bg-foreground/5 rounded-2xl border border-transparent hover:border-foreground/10 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-foreground/5 text-foreground rounded-xl flex items-center justify-center">
                          <Smartphone size={18}/>
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-bold uppercase text-foreground">{a.clientName}</p>
                          <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-1">{a.deviceModel} • <span className="text-foreground/40">{a.specialistName || 'S/E'}</span></p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <p className="text-xs font-bold text-foreground">{formatCurrency(a.totalValue)}</p>
                        <ChevronRight size={14} className="text-foreground/10 group-hover:text-foreground transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              </IBCard>

              <IBCard className="space-y-8">
                <h2 className="brand-font-bold text-xl uppercase flex items-center gap-3 text-foreground">Estoque Crítico</h2>
                <div className="space-y-4">
                  {inventory.filter(i => i.currentStock <= i.minStock).slice(0, 4).map(item => (
                    <div key={item.id} className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl flex items-center justify-between">
                      <div className="text-left">
                        <p className="text-[10px] font-bold uppercase text-foreground">{item.model}</p>
                        <p className="text-[8px] text-red-500 font-bold uppercase mt-1">{item.assignedSpecialistName || 'ESTOQUE CENTRAL'}</p>
                      </div>
                      <IBBadge variant="error">{item.currentStock} un</IBBadge>
                    </div>
                  ))}
                  <IBButton variant="secondary" className="w-full" onClick={() => setView('ESTOQUE')}>
                    VER INVENTÁRIO
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
          <div className="space-y-10">
            <header className="space-y-2 text-left">
              <h2 className="text-4xl brand-font-bold uppercase text-foreground">Serviços</h2>
              <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.4em] opacity-40">Registros Operacionais</p>
            </header>
            <div className="grid gap-4">
              {history.map(a => (
                <IBCard 
                  key={a.id} 
                  onClick={() => !a.isDeleted && setSelectedProtocol(a)}
                  className={`flex items-center justify-between p-6 ${a.isDeleted ? 'opacity-20 pointer-events-none' : 'hover:border-foreground/20 pointer-events-auto cursor-pointer'}`}
                >
                  <div className="flex gap-6">
                    <div className="w-12 h-12 rounded-xl bg-foreground/5 flex items-center justify-center text-foreground/50">
                        <FileText size={24} />
                    </div>
                    <div className="text-left">
                      <h4 className="brand-font-bold text-lg uppercase text-foreground">{a.clientName}</h4>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">{a.deviceModel} • Especialista: {a.specialistName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-bold text-foreground">{formatCurrency(a.totalValue)}</p>
                      <p className="text-[8px] text-muted-foreground uppercase mt-1">{new Date(a.date).toLocaleDateString()}</p>
                    </div>
                    {!a.isDeleted && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setAuditTarget(a.id); }}
                        className="p-3 text-foreground/10 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18}/>
                      </button>
                    )}
                  </div>
                </IBCard>
              ))}
            </div>
          </div>
        )}

        {view === 'AJUSTES' && (
          <div className="max-w-2xl space-y-12">
            <header className="space-y-2 text-left">
              <h2 className="text-4xl brand-font-bold uppercase text-foreground">Ajustes</h2>
              <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.4em] opacity-40">Configuração do Sistema</p>
            </header>
            
            <IBCard className="space-y-10 p-10 text-left">
              <div className="space-y-6">
                <h3 className="text-[11px] font-black text-foreground/30 uppercase tracking-[0.4em]">Personalização</h3>
                <div className="grid grid-cols-1 gap-8">
                  <IBInput 
                    label="Nome da Empresa" 
                    value={tenant.companyName} 
                    onChange={e => setTenant({...tenant, companyName: e.target.value})} 
                  />
                  <IBInput 
                    label="Prazo de Garantia (Dias)" 
                    type="number"
                    value={tenant.warrantyDefaultDays} 
                    onChange={e => setTenant({...tenant, warrantyDefaultDays: parseInt(e.target.value) || 0})} 
                  />
                </div>
              </div>

              <div className="space-y-6 border-t border-foreground/5 pt-10">
                <h3 className="text-[11px] font-black text-foreground/30 uppercase tracking-[0.4em]">Experiência Visual</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setTheme('DARK')}
                    className={`flex items-center justify-center gap-3 p-6 rounded-3xl border transition-all ${theme === 'DARK' ? 'bg-foreground text-background border-foreground shadow-lg' : 'bg-transparent text-foreground/40 border-foreground/10 hover:border-foreground/20'}`}
                  >
                    <Moon size={18} />
                    <span className="text-[10px] font-black tracking-widest uppercase">Escuro Premium</span>
                  </button>
                  <button 
                    onClick={() => setTheme('LIGHT')}
                    className={`flex items-center justify-center gap-3 p-6 rounded-3xl border transition-all ${theme === 'LIGHT' ? 'bg-foreground text-background border-foreground shadow-lg' : 'bg-transparent text-foreground/40 border-foreground/10 hover:border-foreground/20'}`}
                  >
                    <Sun size={18} />
                    <span className="text-[10px] font-black tracking-widest uppercase">Claro Minimal</span>
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <IBButton onClick={() => setView('PAINEL')} className="w-full h-20">SALVAR AJUSTES</IBButton>
              </div>
            </IBCard>
          </div>
        )}

        {view === 'AUDITORIA' && (
          <div className="space-y-10">
            <header className="space-y-2 text-left">
              <h2 className="text-4xl brand-font-bold uppercase text-foreground">Auditoria</h2>
              <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.4em] opacity-40">Logs de Segurança</p>
            </header>
            <div className="bg-foreground/5 border border-foreground/5 rounded-3xl overflow-hidden overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead className="bg-foreground/5 border-b border-foreground/5">
                  <tr>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-foreground/30">Data</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-foreground/30">Operador</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-foreground/30">Ação</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-foreground/30">Detalhes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-foreground/5">
                  {logs.map(log => (
                    <tr key={log.id} className="text-[11px] text-foreground/60">
                      <td className="px-6 py-4">{new Date(log.timestamp).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-bold uppercase">{log.userName.split(' ')[0]}</td>
                      <td className="px-6 py-4"><IBBadge variant="error">{log.action}</IBBadge></td>
                      <td className="px-6 py-4 max-w-xs truncate">{log.details}</td>
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
              <header className="p-8 border-b border-foreground/5 flex items-center justify-between">
                <div className="text-left">
                  <h3 className="text-2xl brand-font-bold uppercase text-foreground">SERVIÇO #{selectedProtocol.warrantyId}</h3>
                  <p className="text-[10px] text-foreground/20 font-black uppercase tracking-widest mt-1">Especialista: {selectedProtocol.specialistName}</p>
                </div>
                <button onClick={() => setSelectedProtocol(null)} className="w-12 h-12 bg-foreground/5 rounded-2xl flex items-center justify-center hover:bg-foreground/10 transition-colors text-foreground">
                  <X size={24} />
                </button>
              </header>
              <div className="flex-1 overflow-y-auto p-8 space-y-12 no-scrollbar text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <section className="space-y-6">
                    <h4 className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.4em]">Dados do Cliente</h4>
                    <div className="space-y-2">
                      <p className="text-xl font-bold uppercase text-foreground">{selectedProtocol.clientName}</p>
                      <p className="text-sm text-foreground/40">{selectedProtocol.clientPhone || 'Sem telefone'}</p>
                    </div>
                  </section>
                  <section className="space-y-6">
                    <h4 className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.4em]">Vistoria Prévia</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {['tela', 'traseira', 'cameras'].map(part => (
                        <div key={part} className={`p-4 rounded-2xl border ${selectedProtocol.state[part].hasDamage ? 'border-red-500/20 bg-red-500/5' : 'border-foreground/5 bg-foreground/5'}`}>
                          <p className="text-[8px] font-black uppercase opacity-40 text-foreground">{part}</p>
                          <p className="text-[10px] font-bold mt-1 uppercase text-foreground">
                            {selectedProtocol.state[part].hasDamage ? 'COM AVARIA' : 'ÍNTEGRO'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                {selectedProtocol.photos && selectedProtocol.photos.length > 0 && (
                  <section className="space-y-6">
                    <h4 className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.4em]">Evidências Visuais</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {selectedProtocol.photos.map((photo, i) => (
                        <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-foreground/5">
                          <img src={photo} className="w-full h-full object-cover grayscale" />
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                <section className="space-y-6">
                  <h4 className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.4em]">Assinatura Digital</h4>
                  <div className="p-4 bg-foreground/5 border border-foreground/10 rounded-3xl h-48 flex items-center justify-center">
                    {selectedProtocol.clientSignature ? (
                      <img src={selectedProtocol.clientSignature} className={`max-h-full ${theme === 'DARK' ? 'invert' : ''}`} />
                    ) : (
                      <p className="text-[9px] text-foreground/10 uppercase tracking-widest">Sem assinatura registrada</p>
                    )}
                  </div>
                </section>
              </div>
              <footer className="p-8 border-t border-foreground/5 flex justify-between items-center bg-card">
                <div className="text-left">
                  <p className="text-[9px] font-black text-foreground/20 uppercase tracking-[0.4em]">Valor Final</p>
                  <p className="text-3xl brand-font-bold mt-1 text-foreground">{formatCurrency(selectedProtocol.totalValue)}</p>
                </div>
                <IBButton variant="secondary" onClick={() => window.print()} className="px-8">IMPRIMIR PDF</IBButton>
              </footer>
            </div>
          </div>
        )}

        {auditTarget && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-background/90 backdrop-blur-xl animate-premium-in">
            <IBCard className="w-full max-w-lg space-y-8 p-10 border-red-500/20 text-left">
              <div className="flex items-center gap-4 text-red-500">
                  <AlertTriangle size={24}/>
                  <h3 className="text-2xl brand-font-bold uppercase">Excluir Registro</h3>
              </div>
              <p className="text-xs text-foreground/40 leading-relaxed uppercase tracking-wider">Esta ação é definitiva e será auditada.</p>
              <textarea 
                className="w-full bg-background border border-foreground/5 rounded-2xl p-6 text-xs outline-none focus:border-red-500 transition-all h-32 resize-none text-foreground font-bold"
                placeholder="Motivo da exclusão..."
                value={auditReason}
                onChange={(e) => setAuditReason(e.target.value)}
              />
              <div className="flex gap-4 pt-4">
                <IBButton variant="ghost" className="flex-1" onClick={() => setAuditTarget(null)}>CANCELAR</IBButton>
                <IBButton variant="danger" className="flex-1" disabled={auditReason.length < 5} onClick={() => handleExcluir(auditTarget)}>CONFIRMAR</IBButton>
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
