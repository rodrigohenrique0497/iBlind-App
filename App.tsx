
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Shield, TrendingUp, Package, BarChart3, ChevronRight, Zap, Target, Check, 
  User as UserIcon, Search, ArrowUpRight, History, Smartphone, 
  Settings as SettingsIcon, Plus, Trash2, Moon, Sun, Download, Trash, AlertTriangle,
  Building2, Percent, Users, LayoutDashboard, Database, CreditCard
} from 'lucide-react';
import { Attendance, User, InventoryItem, AppTheme, TenantConfig } from './types.ts';
import { Auth } from './components/Auth.tsx';
import { authService } from './auth.ts';
import { DashboardLayout } from './layouts/DashboardLayout.tsx';
import { IBlindStatCard, IBlindInput, IBlindBadge, IBlindButton, IBlindModal } from './components/iBlindUI.tsx';
import { NewServiceWizard } from './modules/NewServiceWizard.tsx';

const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

const DEFAULT_TENANT: TenantConfig = {
  companyName: 'iBlind Pro',
  primaryColor: '#6366f1',
  warrantyDefaultDays: 365,
  allowCustomPricing: true
};

export const App = () => {
  const [user, setUser] = useState<User | null>(() => authService.getSession());
  const [view, setView] = useState<'DASHBOARD' | 'WIZARD' | 'HISTORY' | 'STOCK' | 'SETTINGS'>('DASHBOARD');
  const [tenant, setTenant] = useState<TenantConfig>(() => JSON.parse(localStorage.getItem('iblind_v10_tenant') || JSON.stringify(DEFAULT_TENANT)));
  const [history, setHistory] = useState<Attendance[]>(() => JSON.parse(localStorage.getItem('iblind_v10_history') || '[]'));
  const [inventory, setInventory] = useState<InventoryItem[]>(() => JSON.parse(localStorage.getItem('iblind_v10_stock') || '[]'));
  const [search, setSearch] = useState('');
  const [theme, setTheme] = useState<AppTheme>(() => (user?.themePreference || 'DARK'));
  
  const [auditTarget, setAuditTarget] = useState<string | null>(null);
  const [auditReason, setAuditReason] = useState('');

  const toggleTheme = () => setTheme(prev => prev === 'DARK' ? 'LIGHT' : 'DARK');

  useEffect(() => {
    document.documentElement.className = theme.toLowerCase();
    localStorage.setItem('iblind_v10_tenant', JSON.stringify(tenant));
    if (tenant.primaryColor) {
      document.documentElement.style.setProperty('--primary', tenant.primaryColor);
    }
  }, [theme, tenant]);

  const stats = useMemo(() => {
    const valid = history.filter(a => !a.isDeleted);
    const revenue = valid.reduce((acc, curr) => acc + curr.valueBlindagem, 0);
    const costs = valid.reduce((acc, curr) => {
      if (curr.appliedCourtesyFilm && curr.courtesyFilmId) {
        const item = inventory.find(i => i.id === curr.courtesyFilmId);
        return acc + (item?.costPrice || 0);
      }
      return acc;
    }, 0);

    return {
      revenue,
      count: valid.length,
      netProfit: revenue - costs,
      avgTicket: valid.length > 0 ? revenue / valid.length : 0
    };
  }, [history, inventory]);

  const filteredHistory = useMemo(() => {
    const s = search.toLowerCase();
    return history.filter(a => 
      !a.isDeleted && (
        a.clientName.toLowerCase().includes(s) ||
        a.deviceModel.toLowerCase().includes(s) ||
        a.deviceIMEI?.toLowerCase().includes(s) ||
        a.warrantyId.toLowerCase().includes(s)
      )
    );
  }, [history, search]);

  if (!user) return <Auth onLogin={(u) => { setUser(u); setTheme(u.themePreference || 'DARK'); }} />;

  return (
    <DashboardLayout 
      activeView={view} 
      onViewChange={setView} 
      userName={user.name} 
      onLogout={() => { authService.setSession(null); setUser(null); }}
    >
      <div className="max-w-6xl mx-auto space-y-12 animate-in pb-20 px-4">
        
        {view === 'DASHBOARD' && (
          <div className="space-y-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-1">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-foreground">{tenant.companyName}</h1>
                <p className="text-muted-foreground text-sm font-medium tracking-tight">Centro de Operações • {user.name.split(' ')[0]}</p>
              </div>
              <IBlindButton onClick={() => setView('WIZARD')} className="w-full md:w-auto px-10 py-7 text-lg rounded-2xl">
                <Plus size={24} className="mr-2" /> Iniciar Atendimento
              </IBlindButton>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <IBlindStatCard title="Receita Bruta" value={formatCurrency(stats.revenue)} icon={<TrendingUp size={18}/>} trend={{ value: '+8.4%', isUp: true }} />
              <IBlindStatCard title="Blindagens" value={stats.count} icon={<Shield size={18}/>} />
              <IBlindStatCard title="Ticket Médio" value={formatCurrency(stats.avgTicket)} icon={<Percent size={18}/>} />
              <IBlindStatCard title="Lucro Operacional" value={formatCurrency(stats.netProfit)} icon={<Zap size={18}/>} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between px-2">
                  <h2 className="font-bold text-xl tracking-tight">Atividade Recente</h2>
                  <IBlindButton variant="ghost" size="sm" onClick={() => setView('HISTORY')}>Ver histórico</IBlindButton>
                </div>
                <div className="bg-card border border-border rounded-3xl overflow-hidden divide-y divide-border shadow-sm">
                  {history.filter(a => !a.isDeleted).slice(0, 5).map(a => (
                    <div key={a.id} className="p-5 hover:bg-accent/30 transition-all flex items-center justify-between group cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                          <Smartphone size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{a.clientName}</p>
                          <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{a.deviceModel} • {new Date(a.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">{formatCurrency(a.totalValue)}</p>
                        <IBlindBadge variant="primary">{a.warrantyId}</IBlindBadge>
                      </div>
                    </div>
                  ))}
                  {history.filter(a => !a.isDeleted).length === 0 && (
                    <div className="p-16 text-center text-muted-foreground/50 text-sm">Pronto para a primeira blindagem.</div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="font-bold text-xl tracking-tight px-2">Gestão de Insumos</h2>
                <div className="bg-card border border-border rounded-3xl p-6 space-y-4 shadow-sm">
                  {inventory.filter(i => i.currentStock <= i.minStock).map(item => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-tight">{item.name}</p>
                        <p className="text-[10px] text-rose-500 font-bold uppercase mt-0.5">Estoque Crítico</p>
                      </div>
                      <IBlindBadge variant="error">{item.currentStock}</IBlindBadge>
                    </div>
                  ))}
                  {inventory.filter(i => i.currentStock <= i.minStock).length === 0 && (
                    <div className="text-center py-10 opacity-30 grayscale">
                      <Package size={48} className="mx-auto mb-4" />
                      <p className="text-xs font-bold uppercase tracking-widest">Estoque Monitorado</p>
                    </div>
                  )}
                  <IBlindButton variant="secondary" className="w-full py-4 text-xs font-bold uppercase tracking-widest" onClick={() => setView('STOCK')}>Central de Estoque</IBlindButton>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'HISTORY' && (
          <div className="space-y-10">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <h1 className="text-4xl font-extrabold tracking-tighter">Registros</h1>
              <div className="relative w-full md:max-w-sm">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={18} />
                <IBlindInput 
                  placeholder="Pesquisar registros..." 
                  value={search} 
                  onChange={e => setSearch(e.target.value)}
                  className="pl-12 py-3.5"
                />
              </div>
            </header>

            <div className="grid grid-cols-1 gap-4">
              {filteredHistory.map(a => (
                <div key={a.id} className="p-6 bg-card border border-border rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-all">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shrink-0">
                      <CreditCard size={28} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg tracking-tight">{a.clientName}</h4>
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        <IBlindBadge>IMEI: {a.deviceIMEI}</IBlindBadge>
                        <IBlindBadge variant="success">{a.warrantyId}</IBlindBadge>
                        <IBlindBadge>{a.deviceModel}</IBlindBadge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0">
                    <div className="text-right">
                      <p className="font-bold text-xl tracking-tighter">{formatCurrency(a.totalValue)}</p>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{a.technicianName} • {new Date(a.date).toLocaleDateString()}</p>
                    </div>
                    <button 
                      onClick={() => setAuditTarget(a.id)}
                      className="p-3.5 text-rose-500/30 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
              {filteredHistory.length === 0 && (
                <div className="p-32 text-center text-muted-foreground/30 font-medium">Nenhum registro encontrado.</div>
              )}
            </div>
          </div>
        )}

        {view === 'SETTINGS' && (
          <div className="max-w-4xl mx-auto space-y-12">
            <h1 className="text-4xl font-extrabold tracking-tighter">Configurações</h1>
            
            <section className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="space-y-1.5">
                <h3 className="font-bold text-lg tracking-tight">Personalização White-Label</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Ajuste a identidade visual do seu terminal operacional.</p>
              </div>
              <div className="md:col-span-2 bg-card border border-border rounded-3xl p-8 space-y-8 shadow-sm">
                <IBlindInput label="Nome da Organização" value={tenant.companyName} onChange={e => setTenant({...tenant, companyName: e.target.value})} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <IBlindInput label="Garantia Padrão (Dias)" type="number" value={tenant.warrantyDefaultDays} onChange={e => setTenant({...tenant, warrantyDefaultDays: Number(e.target.value)})} />
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Cor da Marca</label>
                    <div className="flex gap-3">
                      <input type="color" className="w-14 h-14 rounded-2xl bg-transparent border-none cursor-pointer" value={tenant.primaryColor} onChange={e => setTenant({...tenant, primaryColor: e.target.value})} />
                      <div className="flex-1 px-4 py-3 bg-secondary rounded-2xl font-mono text-sm uppercase flex items-center justify-center font-bold tracking-widest">{tenant.primaryColor}</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-10 border-t border-border pt-12">
              <div className="space-y-1.5">
                <h3 className="font-bold text-lg tracking-tight">Experiência do Usuário</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Configure suas preferências individuais de visualização.</p>
              </div>
              <div className="md:col-span-2 bg-card border border-border rounded-3xl p-8 flex items-center justify-between shadow-sm">
                <div>
                  <p className="font-bold text-sm">Aparência do Terminal</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Alternar entre Dark e Light mode.</p>
                </div>
                <IBlindButton variant="secondary" onClick={toggleTheme} className="gap-2 px-6">
                  {theme === 'DARK' ? <Moon size={16}/> : <Sun size={16}/>} {theme === 'DARK' ? 'Escuro' : 'Claro'}
                </IBlindButton>
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-10 border-t border-border pt-12">
              <div className="space-y-1.5">
                <h3 className="font-bold text-lg tracking-tight text-rose-500">Dados Críticos</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Manutenção e limpeza de banco de dados local.</p>
              </div>
              <div className="md:col-span-2 flex gap-4">
                <IBlindButton variant="outline" className="flex-1 py-4 font-bold uppercase tracking-widest text-[10px]" onClick={() => { if(confirm('Limpar cache de sistema?')) { localStorage.clear(); location.reload(); } }}>
                  <Trash size={16} className="mr-2" /> Limpar Cache
                </IBlindButton>
                <IBlindButton variant="secondary" className="flex-1 py-4 font-bold uppercase tracking-widest text-[10px]" onClick={() => {
                  const data = { history, inventory, tenant, exportDate: new Date().toISOString() };
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `backup-${tenant.companyName.toLowerCase().replace(/\s+/g, '-')}.json`;
                  a.click();
                }}>
                  <Download size={16} className="mr-2" /> Exportar Dados
                </IBlindButton>
              </div>
            </section>
          </div>
        )}

        {view === 'WIZARD' && (
          <div className="fixed inset-0 z-[1000] bg-background">
            <NewServiceWizard 
              inventory={inventory}
              onCancel={() => setView('DASHBOARD')}
              onComplete={(data) => {
                const now = new Date();
                const warrantyEnd = new Date(now);
                warrantyEnd.setDate(now.getDate() + tenant.warrantyDefaultDays);

                const newAttendance: Attendance = {
                  ...data,
                  id: Math.random().toString(36).substr(2, 6).toUpperCase(),
                  warrantyId: `IB-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
                  date: now.toISOString(),
                  warrantyUntil: warrantyEnd.toISOString(),
                  technicianId: user.id,
                  technicianName: user.name,
                  totalValue: data.valueBlindagem || 0
                } as Attendance;

                setHistory([newAttendance, ...history]);
                setView('DASHBOARD');
              }}
            />
          </div>
        )}

        <IBlindModal isOpen={!!auditTarget} onClose={() => setAuditTarget(null)} title="Auditoria de Segurança">
          <div className="space-y-6">
            <div className="flex items-start gap-4 p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl text-amber-600">
              <AlertTriangle size={20} className="mt-1 shrink-0" />
              <p className="text-xs font-medium leading-relaxed">A exclusão de registros é auditada. Informe o motivo técnico para esta ação.</p>
            </div>
            <IBlindInput label="Justificativa Técnica" placeholder="Ex: Erro de digitação, teste..." value={auditReason} onChange={e => setAuditReason(e.target.value)} />
            <div className="flex gap-3">
              <IBlindButton variant="ghost" className="flex-1" onClick={() => setAuditTarget(null)}>Cancelar</IBlindButton>
              <IBlindButton variant="danger" className="flex-1" disabled={!auditReason} onClick={() => {
                setHistory(prev => prev.map(a => a.id === auditTarget ? {...a, isDeleted: true} : a));
                setAuditTarget(null);
                setAuditReason('');
              }}>Confirmar Exclusão</IBlindButton>
            </div>
          </div>
        </IBlindModal>

      </div>
    </DashboardLayout>
  );
};

export default App;
