
import React, { useState, useMemo } from 'react';
import { ArrowLeft, Smartphone, ShieldCheck, Box, CreditCard, PenTool, CheckCircle, Info, Sparkles, Camera, Wallet, Plus, Zap } from 'lucide-react';
import { IBInput, IBButton, IBBinaryCheck, IBBadge, IBCard, IBImageUpload } from '../components/iBlindUI.tsx';
import { SignaturePad } from '../components/SignaturePad.tsx';
import { Attendance, InventoryItem } from '../types.ts';

interface WizardProps {
  inventory: InventoryItem[];
  onComplete: (data: Partial<Attendance>) => void;
  onCancel: () => void;
}

const STEPS = [
  { id: 'EQUIP', label: 'Equipamento' },
  { id: 'CHECK', label: 'Estado Físico' },
  { id: 'STOCK', label: 'Financeiro' },
  { id: 'FINISH', label: 'Finalizar' },
];

export const NewServiceWizard: React.FC<WizardProps> = ({ inventory, onComplete, onCancel }) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Partial<Attendance>>({
    state: { 
      tela: { hasDamage: false, notes: '' }, 
      traseira: { hasDamage: false, notes: '' }, 
      cameras: { hasDamage: false, notes: '' }, 
      botoes: { hasDamage: false, notes: '' } 
    },
    paymentMethod: 'PIX',
    valueBlindagem: 0,
    valuePelicula: 0,
    valueOthers: 0,
    usedItemId: '',
    photos: []
  });

  const next = () => setStep(s => Math.min(STEPS.length - 1, s + 1));
  const back = () => step === 0 ? onCancel() : setStep(s => s - 1);

  const totalCalculated = useMemo(() => {
    return (data.valueBlindagem || 0) + (data.valuePelicula || 0) + (data.valueOthers || 0);
  }, [data.valueBlindagem, data.valuePelicula, data.valueOthers]);

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const suggestedItems = useMemo(() => {
    if (!data.deviceModel || data.deviceModel.length < 3) return [];
    return inventory.filter(item => 
        item.model.toLowerCase().includes(data.deviceModel!.toLowerCase()) ||
        data.deviceModel!.toLowerCase().includes(item.model.toLowerCase())
    );
  }, [data.deviceModel, inventory]);

  const canAdvance = useMemo(() => {
    if (step === 0) return data.clientName && data.deviceModel && data.deviceIMEI;
    if (step === 1) {
      const s = data.state!;
      if (s.tela.hasDamage && (!s.tela.notes || s.tela.notes.length < 3)) return false;
      if (s.traseira.hasDamage && (!s.traseira.notes || s.traseira.notes.length < 3)) return false;
      if (s.cameras.hasDamage && (!s.cameras.notes || s.cameras.notes.length < 3)) return false;
      return true;
    }
    if (step === 2) return totalCalculated > 0;
    if (step === 3) return !!data.clientSignature;
    return true;
  }, [step, data, totalCalculated]);

  const handleNumericInput = (field: string, value: string) => {
    const numericValue = parseFloat(value) || 0;
    setData(prev => ({ ...prev, [field]: numericValue }));
  };

  return (
    <div className="h-full flex flex-col bg-background animate-premium-in">
      <header className="px-6 md:px-12 py-8 border-b border-border flex items-center justify-between glass shadow-sm">
        <button onClick={back} className="p-4 hover:bg-muted rounded-[22px] transition-all active:scale-90"><ArrowLeft size={24}/></button>
        <div className="flex gap-3">
          {STEPS.map((s, i) => (
            <div key={s.id} className={`h-2 rounded-full transition-all duration-700 ${i <= step ? 'w-12 bg-primary' : 'w-3 bg-border'}`} />
          ))}
        </div>
        <div className="hidden md:block">
            <IBBadge variant="primary">PASSO {step + 1} DE {STEPS.length}</IBBadge>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 md:p-12 no-scrollbar">
        <div className="max-w-3xl mx-auto space-y-12">
          
          {step === 0 && (
            <div className="space-y-12">
              <div className="space-y-2 text-left">
                <h1 className="text-4xl md:text-5xl brand-font-bold tracking-tight">Registro</h1>
                <p className="text-muted-foreground text-sm font-medium">Insira as informações básicas do cliente.</p>
              </div>
              <div className="space-y-6">
                <IBInput label="Nome do Cliente" placeholder="Ex: João Silva" value={data.clientName} onChange={e => setData({...data, clientName: e.target.value})} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <IBInput label="Aparelho" placeholder="Ex: iPhone 16 Pro" value={data.deviceModel} onChange={e => setData({...data, deviceModel: e.target.value})} />
                  <IBInput label="IMEI / Serial" placeholder="Identificação única" value={data.deviceIMEI} onChange={e => setData({...data, deviceIMEI: e.target.value})} />
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-12">
              <div className="space-y-2 text-left">
                <h1 className="text-4xl md:text-5xl brand-font-bold tracking-tight">Vistoria</h1>
                <p className="text-muted-foreground text-sm font-medium">Estado físico do dispositivo na chegada.</p>
              </div>

              <div className="space-y-8">
                <IBBinaryCheck 
                  label="Display" 
                  value={data.state!.tela.hasDamage} 
                  onChange={(v) => setData({...data, state: {...data.state!, tela: {...data.state!.tela, hasDamage: v}}})}
                  notes={data.state!.tela.notes}
                  onNotesChange={(n) => setData({...data, state: {...data.state!, tela: {...data.state!.tela, notes: n}}})}
                />
                <IBBinaryCheck 
                  label="Traseira" 
                  value={data.state!.traseira.hasDamage} 
                  onChange={(v) => setData({...data, state: {...data.state!, traseira: {...data.state!.traseira, hasDamage: v}}})}
                  notes={data.state!.traseira.notes}
                  onNotesChange={(n) => setData({...data, state: {...data.state!, traseira: {...data.state!.traseira, notes: n}}})}
                />
                <IBBinaryCheck 
                  label="Câmeras" 
                  value={data.state!.cameras.hasDamage} 
                  onChange={(v) => setData({...data, state: {...data.state!, cameras: {...data.state!.cameras, hasDamage: v}}})}
                  notes={data.state!.cameras.notes}
                  onNotesChange={(n) => setData({...data, state: {...data.state!, cameras: {...data.state!.cameras, notes: n}}})}
                />

                <div className="pt-10 border-t border-white/5">
                  <IBImageUpload 
                    label="Anexar Fotos" 
                    images={data.photos || []} 
                    onChange={(imgs) => setData({...data, photos: imgs})} 
                    max={6}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-12">
              <div className="space-y-2 text-left">
                <h1 className="text-4xl md:text-5xl brand-font-bold tracking-tight">Financeiro</h1>
                <p className="text-muted-foreground text-sm font-medium">Valores e itens utilizados.</p>
              </div>

              {suggestedItems.length > 0 && (
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] ml-1">Sugestões de Estoque</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {suggestedItems.map(item => (
                      <IBCard 
                        key={item.id} 
                        onClick={() => setData({...data, usedItemId: item.id})}
                        className={`flex flex-col gap-3 p-5 border transition-all ${data.usedItemId === item.id ? 'border-white/40 bg-white/5' : 'border-white/5'}`}
                      >
                        <div className="flex justify-between items-start">
                            <span className="text-xs font-bold uppercase tracking-tight">{item.brand} {item.model}</span>
                            <IBBadge variant={item.currentStock > 0 ? 'success' : 'error'}>{item.currentStock} UN</IBBadge>
                        </div>
                        <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest">{item.material}</p>
                      </IBCard>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <IBCard className="space-y-4">
                  <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">Blindagem</label>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-white/10">R$</span>
                    <input 
                      type="number"
                      placeholder="0,00"
                      className="w-full bg-transparent text-3xl brand-font-bold outline-none border-b border-white/10 focus:border-white transition-colors py-2 text-left"
                      value={data.valueBlindagem || ''}
                      onChange={(e) => handleNumericInput('valueBlindagem', e.target.value)}
                    />
                  </div>
                </IBCard>

                <IBCard className="space-y-4">
                  <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">Película</label>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-white/10">R$</span>
                    <input 
                      type="number"
                      placeholder="0,00"
                      className="w-full bg-transparent text-3xl brand-font-bold outline-none border-b border-white/10 focus:border-white transition-colors py-2 text-left"
                      value={data.valuePelicula || ''}
                      onChange={(e) => handleNumericInput('valuePelicula', e.target.value)}
                    />
                  </div>
                </IBCard>

                <IBCard className="space-y-4">
                  <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">Outros</label>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-white/10">R$</span>
                    <input 
                      type="number"
                      placeholder="0,00"
                      className="w-full bg-transparent text-3xl brand-font-bold outline-none border-b border-white/10 focus:border-white transition-colors py-2 text-left"
                      value={data.valueOthers || ''}
                      onChange={(e) => handleNumericInput('valueOthers', e.target.value)}
                    />
                  </div>
                </IBCard>
              </div>

              <IBCard className="bg-white/[0.02] border-white/10 text-left py-10 px-10">
                <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] mb-4">Valor Final</p>
                <h2 className="text-6xl brand-font-bold tracking-tighter">
                  {formatCurrency(totalCalculated)}
                </h2>
              </IBCard>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['PIX', 'CREDITO', 'DEBITO', 'DINHEIRO'].map(method => (
                  <button 
                    key={method}
                    onClick={() => setData({...data, paymentMethod: method as any})}
                    className={`h-24 rounded-2xl border font-black transition-all flex flex-col items-center justify-center gap-2 ${data.paymentMethod === method ? 'border-white bg-white text-black' : 'border-white/5 text-white/20 hover:border-white/20'}`}
                  >
                    <span className="text-[10px] uppercase tracking-widest">{method}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-12">
              <div className="space-y-4 text-left">
                <h1 className="text-4xl md:text-5xl brand-font-bold tracking-tight">Finalização</h1>
                <p className="text-muted-foreground text-sm font-medium">Assinatura digital do cliente.</p>
              </div>
              <div className="bg-card border-white/5 border p-2 rounded-[40px]">
                <SignaturePad 
                    onSave={sig => setData({...data, clientSignature: sig})} 
                    onClear={() => setData({...data, clientSignature: ''})} 
                />
              </div>
              
              <IBCard className="bg-white/5 border-dashed border border-white/10 p-8">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Total Confirmado</span>
                    <span className="text-2xl brand-font-bold text-white">{formatCurrency(totalCalculated)}</span>
                  </div>
              </IBCard>

              <div className="flex items-center gap-3 text-white/20">
                <CheckCircle size={16} />
                <span className="text-[9px] font-black uppercase tracking-widest">Aguardando validação</span>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="p-8 md:p-12 border-t border-white/5 bg-black/50 flex gap-4 max-w-4xl mx-auto w-full sticky bottom-0 backdrop-blur-md">
        {step > 0 && <IBButton variant="secondary" onClick={back} className="px-10 h-16">Voltar</IBButton>}
        <IBButton 
          disabled={!canAdvance} 
          onClick={() => step < 3 ? next() : onComplete({...data, totalValue: totalCalculated})} 
          className="flex-1 h-16"
        >
          {step === 3 ? 'Concluir Protocolo' : 'Próximo Passo'}
        </IBButton>
      </footer>
    </div>
  );
};
