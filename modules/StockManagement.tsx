
import React, { useState } from 'react';
import { Package, Search, Plus, Filter, Smartphone, Layers, AlertTriangle, X, MoreHorizontal, Users, Box } from 'lucide-react';
import { IBCard, IBButton, IBInput, IBBadge } from '../components/iBlindUI.tsx';
import { InventoryItem, User } from '../types.ts';

interface StockProps {
  items: InventoryItem[];
  specialists: User[];
  onUpdateItems: (items: InventoryItem[]) => void;
}

export const StockManagement: React.FC<StockProps> = ({ items, specialists, onUpdateItems }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [filterSpec, setFilterSpec] = useState<string>('ALL');

  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    brand: '', model: '', type: 'Tela', material: 'Hydrogel', currentStock: 0, minStock: 2, sku: '', 
    category: 'PELICULA', assignedSpecialistId: '', assignedSpecialistName: ''
  });

  const criticalItems = items.filter(item => {
    const isCritical = item.currentStock <= item.minStock;
    const matchesSpec = filterSpec === 'ALL' ? true : item.assignedSpecialistId === filterSpec;
    return isCritical && matchesSpec;
  });

  const filteredItems = items.filter(item => {
    const matchesSearch = `${item.brand} ${item.model} ${item.category}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpec = filterSpec === 'ALL' ? true : item.assignedSpecialistId === filterSpec;
    return matchesSearch && matchesSpec;
  });

  const handleSave = () => {
    if (!formData.model || !formData.brand) return;
    
    const specialist = specialists.find(s => s.id === formData.assignedSpecialistId);
    const finalData = {
      ...formData,
      assignedSpecialistName: specialist ? specialist.name : 'ESTOQUE CENTRAL'
    };

    if (editingItem) {
      const updated = items.map(i => i.id === editingItem.id ? { ...i, ...finalData } as InventoryItem : i);
      onUpdateItems(updated);
    } else {
      const newItem: InventoryItem = {
        ...finalData,
        id: Math.random().toString(36).substr(2, 9),
        sku: `SKU-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        lastEntryDate: new Date().toISOString()
      } as InventoryItem;
      onUpdateItems([...items, newItem]);
    }
    
    setIsAdding(false);
    setEditingItem(null);
    setFormData({ brand: '', model: '', type: 'Tela', material: 'Hydrogel', currentStock: 0, minStock: 2, category: 'PELICULA', assignedSpecialistId: '' });
  };

  return (
    <div className="space-y-10 animate-premium-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2 text-left">
          <h2 className="text-4xl brand-font-bold tracking-tight uppercase text-foreground">Estoque Operacional</h2>
          <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.4em] opacity-40">Gestão por Especialista</p>
        </div>
        <IBButton onClick={() => setIsAdding(true)} className="px-10">
          <Plus size={20} /> ADICIONAR ITEM
        </IBButton>
      </header>

      {/* Seção de Itens Críticos */}
      {criticalItems.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-4 px-6 py-4 bg-red-600 rounded-[24px] text-white shadow-xl shadow-red-600/20">
            <AlertTriangle size={24} className="animate-pulse" />
            <div className="flex-1 text-left">
              <h3 className="text-xs font-black uppercase tracking-[0.2em]">Alerta de Reposição</h3>
              <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Existem {criticalItems.length} itens com estoque abaixo do mínimo</p>
            </div>
            <IBBadge variant="error">Urgente</IBBadge>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-2 px-2">
            {criticalItems.map(item => (
              <IBCard 
                key={`critical-${item.id}`} 
                className="min-w-[280px] border-red-500/30 bg-red-500/[0.02] relative overflow-hidden group"
                onClick={() => { setEditingItem(item); setFormData(item); setIsAdding(true); }}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
                
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
                    {item.category === 'CAPA' ? <Box size={20} /> : <Smartphone size={20} />}
                  </div>
                  <IBBadge variant="error">Crítico</IBBadge>
                </div>

                <div className="space-y-1 relative z-10 text-left">
                  <h4 className="brand-font-bold text-base leading-tight uppercase text-foreground">{item.brand} {item.model}</h4>
                  <p className="text-[8px] font-black text-red-500/60 uppercase tracking-widest">Saldo: {item.currentStock} / Mín: {item.minStock}</p>
                </div>

                <div className="mt-6 flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-1.5 text-foreground/40">
                    <Users size={10} />
                    <span className="text-[8px] font-bold uppercase truncate max-w-[120px]">{item.assignedSpecialistName || 'ESTOQUE CENTRAL'}</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/40">
                    <Plus size={14} />
                  </div>
                </div>
              </IBCard>
            ))}
          </div>
        </section>
      )}

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <IBInput 
             placeholder="Pesquisar itens..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4 min-w-[240px]">
          <IBInput 
            as="select"
            value={filterSpec}
            onChange={(e) => setFilterSpec(e.target.value)}
          >
            <option value="ALL">TODOS ESPECIALISTAS</option>
            <option value="">ESTOQUE CENTRAL</option>
            {specialists.map(s => <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>)}
          </IBInput>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/40">Estoque Completo</h3>
          <span className="text-[10px] font-bold text-foreground/20">{filteredItems.length} ITENS</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map(item => (
            <IBCard key={item.id} className="relative group flex flex-col h-full text-left">
              <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${item.currentStock <= item.minStock ? 'bg-red-500/10 text-red-500' : 'bg-foreground/5 text-foreground'}`}>
                  {item.category === 'CAPA' ? <Box size={24} /> : <Smartphone size={24} />}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <IBBadge variant={item.category === 'PELICULA' ? 'primary' : 'success'}>
                    {item.category}
                  </IBBadge>
                  {item.currentStock <= item.minStock && (
                    <IBBadge variant="warning">ALERTA</IBBadge>
                  )}
                </div>
              </div>

              <div className="flex-1 space-y-1">
                <h4 className="brand-font-bold text-lg leading-tight uppercase text-foreground">{item.brand} {item.model}</h4>
                <p className="text-[9px] font-bold text-foreground/30 uppercase tracking-widest">{item.material} • {item.type}</p>
                <div className="flex items-center gap-2 mt-4 text-foreground/20">
                  <Users size={12} />
                  <span className="text-[9px] font-black uppercase tracking-tighter truncate">{item.assignedSpecialistName || 'ESTOQUE CENTRAL'}</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-border flex items-end justify-between">
                <div>
                  <p className="text-[8px] font-black text-foreground/20 uppercase tracking-widest mb-1">SALDO</p>
                  <p className={`text-2xl brand-font-bold ${item.currentStock <= item.minStock ? 'text-red-500' : 'text-foreground'}`}>
                    {item.currentStock} <span className="text-[10px] opacity-20">UN</span>
                  </p>
                </div>
                <IBButton variant="secondary" className="px-4 py-2 text-[8px]" onClick={() => { setEditingItem(item); setFormData(item); setIsAdding(true); }}>
                  AJUSTAR
                </IBButton>
              </div>
            </IBCard>
          ))}
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[500] bg-background/95 backdrop-blur-xl flex items-center justify-center p-6 animate-premium-in">
          <div className="w-full max-w-xl bg-card border border-border rounded-[40px] p-10 space-y-8 premium-shadow text-left">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl brand-font-bold uppercase text-foreground">{editingItem ? 'Editar Insumo' : 'Novo Insumo'}</h3>
              <button onClick={() => { setIsAdding(false); setEditingItem(null); }} className="text-foreground/20 hover:text-foreground transition-colors"><X size={24}/></button>
            </div>
            
            <div className="space-y-4">
              <IBInput 
                as="select"
                label="Especialista Alocado"
                value={formData.assignedSpecialistId}
                onChange={e => setFormData({...formData, assignedSpecialistId: e.target.value})}
              >
                <option value="">ESTOQUE CENTRAL (ADMIN)</option>
                {specialists.map(s => <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>)}
              </IBInput>

              <div className="grid grid-cols-2 gap-4">
                <IBInput 
                  as="select"
                  label="Categoria"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value as any})}
                >
                  <option value="PELICULA">PELÍCULA</option>
                  <option value="CAPA">CAPA</option>
                  <option value="ACESSORIO">ACESSÓRIO</option>
                </IBInput>
                <IBInput label="Marca" placeholder="Ex: Apple" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
              </div>

              <IBInput label="Modelo do Aparelho" placeholder="Ex: iPhone 16" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />

              <div className="grid grid-cols-2 gap-4">
                <IBInput label="Qtd Atual" type="number" value={formData.currentStock} onChange={e => setFormData({...formData, currentStock: parseInt(e.target.value) || 0})} />
                <IBInput label="Mínimo Alerta" type="number" value={formData.minStock} onChange={e => setFormData({...formData, minStock: parseInt(e.target.value) || 0})} />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <IBButton variant="ghost" className="flex-1" onClick={() => { setIsAdding(false); setEditingItem(null); }}>CANCELAR</IBButton>
              <IBButton variant="primary" className="flex-1" onClick={handleSave}>SALVAR NO ESTOQUE</IBButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
