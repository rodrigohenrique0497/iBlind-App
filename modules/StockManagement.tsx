
import React, { useState } from 'react';
import { Package, Search, Plus, Filter, Smartphone, Layers, AlertTriangle, X, MoreHorizontal } from 'lucide-react';
import { IBCard, IBButton, IBInput, IBBadge } from '../components/iBlindUI.tsx';
import { InventoryItem } from '../types.ts';

interface StockProps {
  items: InventoryItem[];
  onUpdateItems: (items: InventoryItem[]) => void;
}

export const StockManagement: React.FC<StockProps> = ({ items, onUpdateItems }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    brand: '', model: '', type: 'TELA', material: 'Vidro', currentStock: 0, minStock: 2, sku: ''
  });

  const filteredItems = items.filter(item => 
    `${item.brand} ${item.model}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    if (!formData.model || !formData.brand) return;
    
    if (editingItem) {
      const updated = items.map(i => i.id === editingItem.id ? { ...i, ...formData } as InventoryItem : i);
      onUpdateItems(updated);
    } else {
      const newItem: InventoryItem = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
        sku: `SKU-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        lastEntryDate: new Date().toISOString()
      } as InventoryItem;
      onUpdateItems([...items, newItem]);
    }
    
    setIsAdding(false);
    setEditingItem(null);
    setFormData({ brand: '', model: '', type: 'TELA', material: 'Vidro', currentStock: 0, minStock: 2 });
  };

  return (
    <div className="space-y-10 animate-premium-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2 text-left">
          <h2 className="text-4xl brand-font-bold tracking-tight uppercase">Estoque</h2>
          <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.4em] opacity-40">Controle de Inventário</p>
        </div>
        <IBButton onClick={() => setIsAdding(true)} className="px-10">
          <Plus size={20} /> ADICIONAR ITEM
        </IBButton>
      </header>

      <div className="relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={20} />
        <input 
          className="w-full bg-white/5 border border-white/5 focus:border-white/20 text-white pl-16 pr-6 py-5 rounded-2xl text-xs font-semibold outline-none transition-all placeholder:text-white/10"
          placeholder="Pesquisar por marca ou modelo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredItems.map(item => (
          <IBCard key={item.id} className="relative group flex flex-col h-full hover:border-white/10">
            <div className="flex justify-between items-start mb-6">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.currentStock <= item.minStock ? 'bg-red-500/10 text-red-500' : 'bg-white/5 text-white'}`}>
                <Smartphone size={24} />
              </div>
              <IBBadge variant={item.currentStock <= item.minStock ? 'error' : 'neutral'}>
                {item.currentStock <= item.minStock ? 'CRÍTICO' : 'NORMAL'}
              </IBBadge>
            </div>

            <div className="flex-1 space-y-1 text-left">
              <h4 className="brand-font-bold text-lg leading-tight uppercase">{item.brand} {item.model}</h4>
              <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{item.material} • {item.type}</p>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 flex items-end justify-between">
              <div className="text-left">
                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">SALDO</p>
                <p className={`text-2xl brand-font-bold ${item.currentStock <= item.minStock ? 'text-red-500' : 'text-white'}`}>
                  {item.currentStock} <span className="text-[10px] opacity-20">UN</span>
                </p>
              </div>
              <IBButton 
                variant="secondary" 
                className="px-4 py-2 text-[8px]" 
                onClick={() => { setEditingItem(item); setFormData(item); setIsAdding(true); }}
              >
                AJUSTAR
              </IBButton>
            </div>
          </IBCard>
        ))}
        {filteredItems.length === 0 && (
          <div className="col-span-full py-20 text-center border border-dashed border-white/5 rounded-[40px]">
            <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.5em]">Nenhum item encontrado</p>
          </div>
        )}
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[500] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 animate-premium-in">
          <div className="w-full max-w-xl bg-[#0A0A0A] border border-white/10 rounded-[40px] p-10 space-y-8 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl brand-font-bold uppercase">{editingItem ? 'Editar Insumo' : 'Novo Insumo'}</h3>
              <button onClick={() => { setIsAdding(false); setEditingItem(null); }} className="text-white/20 hover:text-white transition-colors"><X size={24}/></button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <IBInput label="Marca do Aparelho" placeholder="Ex: Apple" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
                <IBInput label="Modelo do Aparelho" placeholder="Ex: iPhone 16" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <IBInput label="Material" placeholder="Ex: Hydrogel" value={formData.material} onChange={e => setFormData({...formData, material: e.target.value})} />
                <IBInput label="Parte" placeholder="Ex: Tela" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <IBInput label="Qtd Atual" type="number" value={formData.currentStock} onChange={e => setFormData({...formData, currentStock: parseInt(e.target.value) || 0})} />
                <IBInput label="Mínimo para Alerta" type="number" value={formData.minStock} onChange={e => setFormData({...formData, minStock: parseInt(e.target.value) || 0})} />
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
