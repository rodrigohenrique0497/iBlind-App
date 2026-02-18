
import React, { useState } from 'react';
import { Package, Search, Plus, Filter, Smartphone, Layers, AlertTriangle, X, MoreHorizontal, Users, Box } from 'lucide-react';
import { IBCard, IBButton, IBInput, IBBadge } from '../components/iBlindUI.tsx';
import { InventoryItem, User } from '../types.ts';

interface StockProps {
  items: InventoryItem[];
  specialists: User[];
  onUpdateItems: (items: InventoryItem[]) => void;
}

// Fix: Removed stray 'A' in the props destructuring on line 13
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

  return (
    <div className="space-y-10 animate-premium-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2 text-left">
          <h2 className="text-4xl brand-font-bold tracking-tight uppercase">Estoque Operacional</h2>
          <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.4em] opacity-40">Gestão por Especialista</p>
        </div>
        <IBButton onClick={() => setIsAdding(true)} className="px-10">
          <Plus size={20} /> ADICIONAR ITEM
        </IBButton>
      </header>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative group flex-1">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={20} />
          <input 
            className="w-full bg-white/5 border border-white/5 focus:border-white/20 text-white pl-16 pr-6 py-5 rounded-2xl text-xs font-semibold outline-none transition-all placeholder:text-white/10"
            placeholder="Pesquisar itens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <select 
            className="bg-white/5 border border-white/5 text-white px-6 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-white/20 min-w-[200px]"
            value={filterSpec}
            onChange={(e) => setFilterSpec(e.target.value)}
          >
            <option value="ALL">TODOS ESPECIALISTAS</option>
            <option value="">ESTOQUE CENTRAL</option>
            {specialists.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredItems.map(item => (
          <IBCard key={item.id} className="relative group flex flex-col h-full hover:border-white/10 text-left">
            <div className="flex justify-between items-start mb-6">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.currentStock <= item.minStock ? 'bg-red-500/10 text-red-500' : 'bg-white/5 text-white'}`}>
                {item.category === 'CAPA' ? <Box size={24} /> : <Smartphone size={24} />}
              </div>
              <IBBadge variant={item.category === 'PELICULA' ? 'primary' : 'success'}>
                {item.category}
              </IBBadge>
            </div>

            <div className="flex-1 space-y-1">
              <h4 className="brand-font-bold text-lg leading-tight uppercase">{item.brand} {item.model}</h4>
              <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{item.material} • {item.type}</p>
              <div className="flex items-center gap-2 mt-4 text-white/20">
                <Users size={12} />
                <span className="text-[9px] font-black uppercase tracking-tighter truncate">{item.assignedSpecialistName || 'ESTOQUE CENTRAL'}</span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 flex items-end justify-between">
              <div>
                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">SALDO</p>
                <p className={`text-2xl brand-font-bold ${item.currentStock <= item.minStock ? 'text-red-500' : 'text-white'}`}>
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

      {isAdding && (
        <div className="fixed inset-0 z-[500] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 animate-premium-in">
          <div className="w-full max-w-xl bg-[#0A0A0A] border border-white/10 rounded-[40px] p-10 space-y-8 shadow-2xl text-left">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl brand-font-bold uppercase">{editingItem ? 'Editar Insumo' : 'Novo Insumo'}</h3>
              <button onClick={() => { setIsAdding(false); setEditingItem(null); }} className="text-white/20 hover:text-white transition-colors"><X size={24}/></button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] ml-1">Especialista Alocado</label>
                <select 
                  className="w-full bg-white/5 border border-white/5 text-white px-6 py-5 rounded-2xl text-xs font-semibold outline-none focus:border-white/20"
                  value={formData.assignedSpecialistId}
                  onChange={e => setFormData({...formData, assignedSpecialistId: e.target.value})}
                >
                  <option value="">ESTOQUE CENTRAL (ADMIN)</option>
                  {specialists.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] ml-1">Categoria</label>
                  <select 
                    className="w-full bg-white/5 border border-white/5 text-white px-6 py-5 rounded-2xl text-xs font-semibold outline-none focus:border-white/20"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value as any})}
                  >
                    <option value="PELICULA">PELÍCULA</option>
                    <option value="CAPA">CAPA</option>
                    <option value="ACESSORIO">ACESSÓRIO</option>
                  </select>
                </div>
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
