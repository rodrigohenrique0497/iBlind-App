
import React, { useState } from 'react';
import { Package, Search, Plus, Smartphone, X, Users, Box } from 'lucide-react';
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
    <div className="space-y-12 animate-premium-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div className="space-y-3 text-left">
          <p className="text-[11px] font-black text-white/10 uppercase tracking-[0.5em] mb-1">Logística iPlanner</p>
          <h2 className="text-5xl font-extrabold tracking-tighter uppercase text-white">Inventário</h2>
        </div>
        <IBButton onClick={() => { setEditingItem(null); setIsAdding(true); }} className="px-12 h-18 text-xs font-black">
          <Plus size={20} strokeWidth={4} /> NOVO INSUMO
        </IBButton>
      </header>

      <div className="flex flex-col lg:flex-row gap-5">
        <div className="flex-1 relative">
          <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-white/10" size={18} />
          <IBInput 
             placeholder="Pesquisar estoque..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="pl-16 h-18 font-bold text-base"
          />
        </div>
        <div className="flex gap-4 min-w-[320px]">
          <IBInput 
            as="select"
            value={filterSpec}
            onChange={(e) => setFilterSpec(e.target.value)}
            className="h-18 font-black uppercase tracking-widest"
          >
            <option value="ALL">TODOS OS RESPONSÁVEIS</option>
            <option value="">ESTOQUE CENTRAL</option>
            {specialists.map(s => <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>)}
          </IBInput>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredItems.length > 0 ? filteredItems.map(item => (
          <IBCard key={item.id} className="relative group flex flex-col h-full text-left">
            <div className="flex justify-between items-start mb-10">
              <div className={`w-15 h-15 rounded-[22px] flex items-center justify-center transition-all duration-700 border border-white/5 ${item.currentStock <= item.minStock ? 'bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.15)]' : 'bg-white/[0.04] text-white'}`}>
                {item.category === 'CAPA' ? <Box size={26} /> : <Smartphone size={26} />}
              </div>
              <IBBadge variant={item.currentStock <= item.minStock ? 'error' : 'neutral'}>
                {item.category}
              </IBBadge>
            </div>

            <div className="flex-1 space-y-2">
              <h4 className="font-extrabold text-2xl leading-tight uppercase tracking-tight text-white">{item.brand} {item.model}</h4>
              <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.25em]">{item.material} • {item.type}</p>
              <div className="flex items-center gap-3 mt-6 p-4 bg-white/[0.02] rounded-2xl border border-white/[0.05]">
                <Users size={14} className="text-white/20" />
                <span className="text-[9px] font-black uppercase tracking-widest text-white/40 truncate">{item.assignedSpecialistName || 'ESTOQUE CENTRAL'}</span>
              </div>
            </div>

            <div className="mt-12 pt-10 border-t border-white/[0.05] flex items-end justify-between">
              <div>
                <p className="text-[9px] font-black text-white/10 uppercase tracking-[0.4em] mb-2">SALDO OPERACIONAL</p>
                <p className={`text-4xl font-black tracking-tighter ${item.currentStock <= item.minStock ? 'text-red-500' : 'text-white'}`}>
                  {item.currentStock} <span className="text-xs opacity-20 ml-1">UN</span>
                </p>
              </div>
              <IBButton variant="secondary" className="px-7 h-12 text-[9px] rounded-xl font-black" onClick={() => openAdjust(item)}>
                AJUSTAR
              </IBButton>
            </div>
          </IBCard>
        )) : (
          <div className="col-span-full py-60 flex flex-col items-center gap-8 opacity-10">
             <Package size={80} strokeWidth={1} />
             <p className="text-base font-black uppercase tracking-[0.6em]">Nada em estoque</p>
          </div>
        )}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[600] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6 animate-premium-in safe-top safe-bottom">
          <div className="w-full max-w-2xl bg-surface border border-white/10 rounded-super p-12 space-y-12 shadow-[0_40px_100px_rgba(0,0,0,0.8)] text-left">
            <header className="flex items-center justify-between">
              <div className="space-y-2">
                <IBBadge variant="primary">{editingItem ? 'MANUTENÇÃO DE SALDO' : 'CADASTRO ESTRUTURADO'}</IBBadge>
                <h3 className="text-3xl font-extrabold uppercase text-white mt-3 tracking-tighter">{editingItem ? 'Ajustar Insumo' : 'Novo Insumo'}</h3>
              </div>
              <button onClick={() => { setIsAdding(false); setEditingItem(null); }} className="w-14 h-14 flex items-center justify-center bg-white/5 rounded-2xl text-white/20 hover:text-white transition-all active:scale-90"><X size={28}/></button>
            </header>
            
            <div className="space-y-8">
              <IBInput 
                as="select"
                label="Responsável Alocado"
                value={formData.assignedSpecialistId}
                onChange={e => setFormData({...formData, assignedSpecialistId: e.target.value})}
                className="h-18 font-bold"
              >
                <option value="">ESTOQUE CENTRAL (ADMIN)</option>
                {specialists.map(s => <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>)}
              </IBInput>

              <div className="grid grid-cols-2 gap-6">
                <IBInput 
                  as="select"
                  label="Categoria de Insumo"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value as any})}
                  disabled={!!editingItem}
                  className={editingItem ? 'opacity-40 cursor-not-allowed h-18 font-bold' : 'h-18 font-bold'}
                >
                  <option value="PELICULA">PELÍCULA</option>
                  <option value="CAPA">CAPA</option>
                  <option value="ACESSORIO">ACESSÓRIO</option>
                </IBInput>
                <IBInput 
                  label="Fabricante / Marca" 
                  placeholder="Ex: Apple" 
                  value={formData.brand} 
                  onChange={e => setFormData({...formData, brand: e.target.value})} 
                  disabled={!!editingItem}
                  className={editingItem ? 'opacity-40 cursor-not-allowed h-18 font-bold' : 'h-18 font-bold'}
                />
              </div>

              <IBInput 
                label="Modelo do Dispositivo" 
                placeholder="Ex: iPhone 16 Pro Max" 
                value={formData.model} 
                onChange={e => setFormData({...formData, model: e.target.value})} 
                disabled={!!editingItem}
                className={editingItem ? 'opacity-40 cursor-not-allowed h-18 font-bold' : 'h-18 font-bold'}
              />

              <div className="grid grid-cols-2 gap-8 p-10 bg-white/[0.02] border border-white/5 rounded-super">
                <IBInput 
                  label="Estoque Atual" 
                  type="number" 
                  value={formData.currentStock} 
                  onChange={e => setFormData({...formData, currentStock: parseInt(e.target.value) || 0})} 
                  className="bg-black text-4xl font-black h-24 text-center border-white/10"
                />
                <IBInput 
                  label="Estoque Mínimo" 
                  type="number" 
                  value={formData.minStock} 
                  onChange={e => setFormData({...formData, minStock: parseInt(e.target.value) || 0})} 
                  className="bg-black text-4xl font-black h-24 text-center border-white/10"
                />
              </div>
            </div>

            <div className="flex gap-5 pt-6">
              <IBButton variant="ghost" className="flex-1 h-20 font-black" onClick={() => { setIsAdding(false); setEditingItem(null); }}>ABORTAR</IBButton>
              <IBButton variant="primary" className="flex-1 h-20 font-black text-base" onClick={handleSave}>SALVAR ALTERAÇÕES</IBButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
