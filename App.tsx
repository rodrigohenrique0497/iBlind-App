
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Shield, TrendingUp, Package, BarChart3, Plus, History, 
  Settings as SettingsIcon, Moon, Sun, Search, Smartphone, Clock, AlertTriangle,
  Zap, Trash2, ArrowUpRight, Activity, Camera, X, FileText, ChevronRight
} from 'lucide-react';
import { Attendance, User, InventoryItem, AppTheme, TenantConfig, AuditLog } from './types.ts';
import { Auth, BrandLogo } from './components/Auth.tsx';
import { authService } from './auth.ts';
import { DashboardLayout } from './layouts/DashboardLayout.tsx';
import { IBCard, IBButton, IBBadge, IBlindStatCard, IBInput } from './components/iBlindUI.tsx';
import { NewServiceWizard } from './modules/NewServiceWizard.tsx';
import { StockManagement } from './modules/StockManagement.tsx';

const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

const App = () => {
  const [user, setUser] = useState<User | null>(() => authService.getSession());
  const [view, setView] = useState<'DASHBOARD' | 'WIZARD' | 'HISTORY' | 'STOCK' | 'SETTINGS' | 'LOGS'>('DASHBOARD');
  const [tenant, setTenant] = useState<TenantConfig>(() => JSON.parse(localStorage.getItem('iblind_v12_tenant') || JSON.stringify({
    companyName: 'iBlind Pro',
    primaryColor: '#FFFFFF',
    warrantyDefaultDays: 365,
    allowCustomPricing: true
  })));
  
  const [history, setHistory] = useState<Attendance[]>(() => JSON.parse(localStorage.getItem('iblind_v12_history') || '[]'));
  const [inventory, setInventory] = useState<InventoryItem[]>(() => JSON.parse(localStorage.getItem('iblind_v12_stock') || '[]'));
  const [logs, setLogs] = useState<AuditLog[]>(() => JSON.parse(localStorage.getItem('iblind_v12_logs') || '[]'));
  
  const [selectedProtocol, setSelectedProtocol] = useState<Attendance | null>(null);
  const [auditTarget, setAuditTarget] = useState<string | null>(null);
  const [auditReason, setAuditReason] = useState('');
  const [theme, setTheme] = useState<AppTheme>('DARK');

  useEffect(() => {
    document.documentElement.className = 'dark';
    localStorage.setItem('iblind_v12_tenant', JSON.stringify(tenant));
    localStorage.setItem('iblind_v12_history', JSON.stringify(history));
    localStorage.setItem('iblind_v12_stock', JSON.stringify(inventory));
    localStorage.setItem('iblind_v12_logs', JSON.stringify(logs));
  }, [tenant, history, inventory, logs]);

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

  const handleCompleteService = (data: Partial<Attendance>) => {
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

    if (data.usedItemId) {
      setInventory(prev => prev.map(item => {
        if (item.id === data.usedItemId) {
          const newQty = Math.max(0, item.currentStock - 1);
          return { ...item, currentStock: newQty };
        }
        return item;
      }));
    }

    setHistory([newAttendance, ...history]);
    setView('DASHBOARD');
  };

  const handleUpdateStock = (updatedItems: InventoryItem[]) => {
    setInventory(updatedItems);
  };

  const handleExcluir = (id: string) => {
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
    setLogs([log, ...logs]);
    setHistory(prev => prev.map(a => a.id === id ? { ...a, isDeleted: true } : a));
    setAuditTarget(null);
    setAuditReason('');
  };

  if (!user) return <Auth onLogin={(u) => { setUser(u); }} />;

  return (
    <DashboardLayout 
      activeView={view} 
      onViewChange={setView} 
      userName={user.name} 
      onLogout={() => { authService.setSession(null); setUser(null); }}
    >
      <div className="max-content space-y-12 animate-premium-in pb-20">
        
        {view === 'DASHBOARD' && (
          <div className="space-y-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="space-y-2">
                <h1 className="text-3xl brand-font-bold tracking-tight">{tenant.companyName}</h1>
                <p className="text-muted-foreground text-[10px] font-bold tracking-[0.4em] uppercase opacity-40">Intelligence Dashboard</p>
              </div>
              <IBButton onClick={() => setView('WIZARD')} className="w-full md:w-auto px-10">
                <Plus size={20} /> Novo Atendimento
              </IBButton>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <IBlindStatCard title="Receita Acumulada" value={formatCurrency(stats.revenue)} icon={<TrendingUp size={20}/>} />
              <IBlindStatCard title="Serviços Hoje" value={stats.countToday} icon={<Zap size={20}/>} color="text-amber-500" />
              <IBlindStatCard title="Itens Críticos" value={stats.criticalStock} icon={<Package size={20}/>} color={stats.criticalStock > 0 ? "text-red-500" : "text-emerald-500"} />
              <IBlindStatCard title="Base de Dados" value={stats.totalServices} icon={<Activity size={20}/>} color="text-indigo-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <IBCard className="lg:col-span-2 space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="brand-font-bold text-xl flex items-center gap-3">Atividades Recentes</h2>
                  <IBButton variant="ghost" className="px-4 py-2 text-xs" onClick={() => setView('HISTORY')}>Ver Tudo</IBButton>
                </div>
                <div className="space-y-4">
                  {history.filter(a => !a.isDeleted).slice(0, 5).map(a => (
                    <div 
                      key={a.id} 
                      onClick={() => setSelectedProtocol(a)}
                      className="group flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-transparent hover:border-white/10 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/5 text-white rounded-xl flex items-center justify-center">
                          <Smartphone size={18}/>
                        </div>
                        <div>
                          <p className="text-xs font-bold brand-font-bold">{a.clientName}</p>
                          <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-1">{a.deviceModel} • {new Date(a.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <p className="text-xs font-bold">{formatCurrency(a.totalValue)}</p>
                        <ChevronRight size={14} className="text-white/10 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  ))}
                  {history.length === 0 && <p className="text-center text-white/10 text-xs py-10 uppercase tracking-widest">Sem atividades registradas</p>}
                </div>
              </IBCard>

              <IBCard className="space-y-8">
                <h2 className="brand-font-bold text-xl flex items-center gap-3">Estoque</h2>
                <div className="space-y-4">
                  {inventory.filter(i => i.currentStock <= i.minStock).slice(0, 4).map(item => (
                    <div key={item.id} className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold uppercase">{item.model}</p>
                        <p className="text-[8px] text-red-500 font-bold uppercase mt-1">Reposição Necessária</p>
                      </div>
                      <IBBadge variant="error">{item.currentStock} un</IBBadge>
                    </div>
                  ))}
                  <IBButton variant="secondary" className="w-full" onClick={() => setView('STOCK')}>
                    Acessar Inventário
                  </IBButton>
                </div>
              </IBCard>
            </div>
          </div>
        )}

        {view === 'STOCK' && (
          <StockManagement 
            items={inventory} 
            onUpdateItems={handleUpdateStock}
          />
        )}

        {view === 'HISTORY' && (
          <div className="space-y-10">
            <header className="space-y-2">
              <h2 className="text-4xl brand-font-bold">Histórico</h2>
              <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.4em] opacity-40">Operational Records</p>
            </header>
            <div className="grid gap-4">
              {history.map(a => (
                <IBCard 
                  key={a.id} 
                  onClick={() => !a.isDeleted && setSelectedProtocol(a)}
                  className={`flex items-center justify-between p-6 ${a.isDeleted ? 'opacity-20 pointer-events-none' : 'hover:border-white/20 pointer-events-auto cursor-pointer'}`}
                >
                  <div className="flex gap-6">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/50">
                        <FileText size={24} />
                    </div>
                    <div>
                      <h4 className="brand-font-bold text-lg">{a.clientName}</h4>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">{a.deviceModel} • {a.warrantyId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-bold">{formatCurrency(a.totalValue)}</p>
                      <p className="text-[8px] text-muted-foreground uppercase mt-1">{new Date(a.date).toLocaleDateString()}</p>
                    </div>
                    {!a.isDeleted && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setAuditTarget(a.id); }}
                        className="p-3 text-white/10 hover:text-red-500 transition-colors"
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

        {view === 'SETTINGS' && (
          <div className="max-w-2xl space-y-12">
            <header className="space-y-2">
              <h2 className="text-4xl brand-font-bold">Ajustes</h2>
              <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.4em] opacity-40">System Configuration</p>
            </header>
            <div className="space-y-8">
              <IBInput 
                label="Nome da Empresa" 
                value={tenant.companyName} 
                onChange={e => setTenant({...tenant, companyName: e.target.value})} 
              />
              <IBInput 
                label="Dias de Garantia (Padrão)" 
                type="number"
                value={tenant.warrantyDefaultDays} 
                onChange={e => setTenant({...tenant, warrantyDefaultDays: parseInt(e.target.value) || 0})} 
              />
              <IBButton onClick={() => setView('DASHBOARD')} className="w-full">Salvar Alterações</IBButton>
            </div>
          </div>
        )}

        {view === 'LOGS' && (
          <div className="space-y-10">
            <header className="space-y-2">
              <h2 className="text-4xl brand-font-bold">Auditoria</h2>
              <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.4em] opacity-40">Security Logs</p>
            </header>
            <div className="bg-white/5 border border-white/5 rounded-3xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-white/5 border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-white/30">Data</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-white/30">Operador</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-white/30">Ação</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-white/30">Detalhes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {logs.map(log => (
                    <tr key={log.id} className="text-[11px] text-white/60">
                      <td className="px-6 py-4">{new Date(log.timestamp).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-bold">{log.userName}</td>
                      <td className="px-6 py-4"><IBBadge variant="error">{log.action}</IBBadge></td>
                      <td className="px-6 py-4 max-w-xs truncate">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {logs.length === 0 && <p className="text-center py-20 text-white/10 uppercase tracking-widest text-[10px]">Sem logs registrados</p>}
            </div>
          </div>
        )}

        {/* MODAL: PROTOCOLO DETALHADO */}
        {selectedProtocol && (
          <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8 animate-premium-in">
            <div className="w-full max-w-4xl bg-[#0A0A0A] border border-white/10 rounded-[40px] flex flex-col h-[90vh] shadow-2xl overflow-hidden">
              <header className="p-8 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl brand-font-bold">Detalhes do Serviço</h3>
                  <p className="text-[9px] text-white/20 uppercase tracking-[0.3em] mt-1">ID: {selectedProtocol.warrantyId}</p>
                </div>
                <button onClick={() => setSelectedProtocol(null)} className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-colors">
                  <X size={24} />
                </button>
              </header>
              <div className="flex-1 overflow-y-auto p-8 space-y-12 no-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <section className="space-y-6">
                    <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Informações do Cliente</h4>
                    <div className="space-y-2">
                      <p className="text-xl font-bold">{selectedProtocol.clientName}</p>
                      <p className="text-sm text-white/40">{selectedProtocol.clientPhone || 'Sem telefone'}</p>
                    </div>
                    <div className="pt-6 border-t border-white/5">
                      <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-4">Aparelho</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[8px] text-white/20 uppercase font-black">Modelo</p>
                          <p className="text-xs font-bold mt-1 uppercase">{selectedProtocol.deviceModel}</p>
                        </div>
                        <div>
                          <p className="text-[8px] text-white/20 uppercase font-black">IMEI/SN</p>
                          <p className="text-xs font-bold mt-1 uppercase">{selectedProtocol.deviceIMEI}</p>
                        </div>
                      </div>
                    </div>
                  </section>
                  <section className="space-y-6">
                    <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Vistoria Técnica</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {['tela', 'traseira', 'cameras'].map(part => (
                        <div key={part} className={`p-4 rounded-2xl border ${selectedProtocol.state[part].hasDamage ? 'border-red-500/20 bg-red-500/5' : 'border-white/5 bg-white/5'}`}>
                          <p className="text-[8px] font-black uppercase opacity-40">{part}</p>
                          <p className="text-[10px] font-bold mt-1 uppercase">
                            {selectedProtocol.state[part].hasDamage ? 'COM AVARIA' : 'INTEGRO'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                {selectedProtocol.photos && selectedProtocol.photos.length > 0 && (
                  <section className="space-y-6">
                    <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Evidências Fotográficas</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {selectedProtocol.photos.map((photo, i) => (
                        <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-white/5">
                          <img src={photo} className="w-full h-full object-cover grayscale" />
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                <section className="space-y-6">
                  <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Assinatura Digital</h4>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-3xl h-48 flex items-center justify-center">
                    {selectedProtocol.clientSignature ? (
                      <img src={selectedProtocol.clientSignature} className="max-h-full invert" />
                    ) : (
                      <p className="text-[9px] text-white/10 uppercase tracking-widest">Sem assinatura registrada</p>
                    )}
                  </div>
                </section>
              </div>
              <footer className="p-8 border-t border-white/5 flex justify-between items-center">
                <div>
                  <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">Valor do Protocolo</p>
                  <p className="text-3xl brand-font-bold mt-1">{formatCurrency(selectedProtocol.totalValue)}</p>
                </div>
                <IBButton variant="secondary" onClick={() => window.print()} className="px-8">Exportar PDF</IBButton>
              </footer>
            </div>
          </div>
        )}

        {/* MODAL: EXCLUSÃO */}
        {auditTarget && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-premium-in">
            <IBCard className="w-full max-w-lg space-y-8 p-10 border-red-500/20">
              <div className="flex items-center gap-4 text-red-500">
                  <AlertTriangle size={24}/>
                  <h3 className="text-2xl brand-font-bold">Remover Registro</h3>
              </div>
              <p className="text-xs text-white/40 leading-relaxed uppercase tracking-wider">Esta ação é irreversível e será registrada nos logs de auditoria.</p>
              <textarea 
                className="w-full bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 text-xs outline-none focus:border-red-500 transition-all h-32 resize-none text-white font-bold"
                placeholder="Motivo da exclusão..."
                value={auditReason}
                onChange={(e) => setAuditReason(e.target.value)}
              />
              <div className="flex gap-4 pt-4">
                <IBButton variant="ghost" className="flex-1" onClick={() => setAuditTarget(null)}>Cancelar</IBButton>
                <IBButton variant="danger" className="flex-1" disabled={auditReason.length < 5} onClick={() => handleExcluir(auditTarget)}>Confirmar</IBButton>
              </div>
            </IBCard>
          </div>
        )}

        {view === 'WIZARD' && (
          <div className="fixed inset-0 z-[400] bg-[#000000]">
            <NewServiceWizard 
              inventory={inventory}
              onCancel={() => setView('DASHBOARD')}
              onComplete={handleCompleteService}
            />
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default App;
