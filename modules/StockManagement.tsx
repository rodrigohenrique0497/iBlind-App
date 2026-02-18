
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

  const openAdjust = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData(item);
    setIsAdding(true);
  };

  return (
    <div className="space-y-10 animate-premium-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2 text-left">
          <p className="text-[11px] font-extrabold text-white/20 uppercase tracking-[0.3em] mb-1">Inventário</p>
          <h2 className="text-4xl font-extrabold tracking-tighter uppercase text-foreground">Estoque Operacional</h2>
        </div>
        <IBButton onClick={() => { setEditingItem(null); setIsAdding(true); }} className="px-10 h-16 rounded-super">
          <Plus size={20} strokeWidth={3} /> NOVO INSUMO
        </IBButton>
      </header>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/10" size={18} />
          <IBInput 
             placeholder="Pesquisar por marca, modelo ou categoria..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="pl-14"
          />
        </div>
        <div className="flex gap-4 min-w-[280px]">
          <IBInput 
            as="select"
            value={filterSpec}
            onChange={(e) => setFilterSpec(e.target.value)}
          >
            <option value="ALL">TODOS OS ESPECIALISTAS</option>
            <option value="">ESTOQUE CENTRAL (SÉDE)</option>
            {specialists.map(s => <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>)}
          </IBInput>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredItems.length > 0 ? filteredItems.map(item => (
          <IBCard key={item.id} className="relative group flex flex-col h-full text-left border-white/[0.03]">
            <div className="flex justify-between items-start mb-8">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 border border-white/5 ${item.currentStock <= item.minStock ? 'bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'bg-white/[0.03] text-foreground'}`}>
                {item.category === 'CAPA' ? <Box size={24} /> : <Smartphone size={24} />}
              </div>
              <IBBadge variant={item.currentStock <= item.minStock ? 'error' : 'neutral'}>
                {item.category}
              </IBBadge>
            </div>

            <div className="flex-1 space-y-2">
              <h4 className="font-extrabold text-xl leading-tight uppercase tracking-tight text-foreground">{item.brand} {item.model}</h4>
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">{item.material} • {item.type}</p>
              <div className="flex items-center gap-2.5 mt-5 p-3 bg-white/[0.02] rounded-xl border border-white/[0.05]">
                <Users size={12} className="text-white/20" />
                <span className="text-[9px] font-black uppercase tracking-widest text-white/40 truncate">{item.assignedSpecialistName || 'ESTOQUE CENTRAL'}</span>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-white/[0.05] flex items-end justify-between">
              <div>
                <p className="text-[9px] font-black text-white/10 uppercase tracking-[0.3em] mb-1.5">SALDO DISPONÍVEL</p>
                <p className={`text-3xl font-black tracking-tighter ${item.currentStock <= item.minStock ? 'text-red-500' : 'text-foreground'}`}>
                  {item.currentStock} <span className="text-xs opacity-20 ml-1">UN</span>
                </p>
              </div>
              <IBButton variant="secondary" className="px-6 h-12 text-[9px] rounded-xl" onClick={() => openAdjust(item)}>
                AJUSTAR
              </IBButton>
            </div>
          </IBCard>
        )) : (
          <div className="col-span-full py-40 flex flex-col items-center gap-6 opacity-20">
             <Package size={64} strokeWidth={1} />
             <p className="text-sm font-bold uppercase tracking-[0.4em]">Nenhum item encontrado</p>
          </div>
        )}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[600] bg-black/90 backdrop-blur-3xl flex items-center justify-center p-6 animate-premium-in safe-top safe-bottom">
          <div className="w-full max-w-xl bg-card border border-white/10 rounded-super p-10 space-y-10 shadow-[0_0_100px_rgba(0,0,0,0.5)] text-left">
            <header className="flex items-center justify-between">
              <div className="space-y-1">
                <IBBadge variant="primary">{editingItem ? 'MANUTENÇÃO' : 'CADASTRO'}</IBBadge>
                <h3 className="text-2xl font-black uppercase text-foreground mt-2">{editingItem ? 'Ajustar Insumo' : 'Novo Insumo'}</h3>
              </div>
              <button onClick={() => { setIsAdding(false); setEditingItem(null); }} className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl text-white/20 hover:text-white transition-all"><X size={24}/></button>
            </header>
            
            <div className="space-y-6">
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
                  label="Categoria do Item"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value as any})}
                  disabled={!!editingItem}
                  className={editingItem ? 'opacity-40 cursor-not-allowed' : ''}
                >
                  <option value="PELICULA">PELÍCULA</option>
                  <option value="CAPA">CAPA</option>
                  <option value="ACESSORIO">ACESSÓRIO</option>
                </IBInput>
                <IBInput 
                  label="Marca / Fabricante" 
                  placeholder="Ex: Apple" 
                  value={formData.brand} 
                  onChange={e => setFormData({...formData, brand: e.target.value})} 
                  disabled={!!editingItem}
                  className={editingItem ? 'opacity-40 cursor-not-allowed' : ''}
                />
              </div>

              <IBInput 
                label="Modelo do Dispositivo" 
                placeholder="Ex: iPhone 16 Pro Max" 
                value={formData.model} 
                onChange={e => setFormData({...formData, model: e.target.value})} 
                disabled={!!editingItem}
                className={editingItem ? 'opacity-40 cursor-not-allowed' : ''}
              />

              <div className="grid grid-cols-2 gap-6 p-6 bg-white/[0.02] border border-white/5 rounded-super">
                <IBInput 
                  label="Estoque Atual" 
                  type="number" 
                  value={formData.currentStock} 
                  onChange={e => setFormData({...formData, currentStock: parseInt(e.target.value) || 0})} 
                  className="bg-background text-2xl font-black h-16"
                />
                <IBInput 
                  label="Estoque Mínimo" 
                  type="number" 
                  value={formData.minStock} 
                  onChange={e => setFormData({...formData, minStock: parseInt(e.target.value) || 0})} 
                  className="bg-background text-2xl font-black h-16"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <IBButton variant="ghost" className="flex-1 h-16" onClick={() => { setIsAdding(false); setEditingItem(null); }}>ABORTAR</IBButton>
              <IBButton variant="primary" className="flex-1 h-16" onClick={handleSave}>SALVAR ALTERAÇÕES</IBButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
