
import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, Smartphone, ShieldCheck, Box, CreditCard, 
  PenTool, CheckCircle, Camera, Wallet, Plus, Zap, 
  Shield, Layers, ChevronRight, AlertCircle, Phone, User as UserIcon,
  X, Users
} from 'lucide-react';
import { IBInput, IBButton, IBBinaryCheck, IBBadge, IBCard, IBImageUpload } from '../components/iBlindUI.tsx';
import { SignaturePad } from '../components/SignaturePad.tsx';
import { Attendance, InventoryItem, ServiceCoverage, PaymentMethod, User } from '../types.ts';

interface WizardProps {
  inventory: InventoryItem[];
  specialists: User[];
  onComplete: (data: Partial<Attendance>) => void;
  onCancel: () => void;
}

const STEPS = [
  { id: 'CLIENT', label: 'ENTRADA', icon: <UserIcon size={18} /> },
  { id: 'DEVICE', label: 'VISTORIA', icon: <Smartphone size={18} /> },
  { id: 'COVERAGE', label: 'BLINDAGEM', icon: <Shield size={18} /> },
  { id: 'FINISH', label: 'ASSINATURA', icon: <PenTool size={18} /> },
];

export const NewServiceWizard: React.FC<WizardProps> = ({ inventory, specialists, onComplete, onCancel }) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Partial<Attendance>>({
    clientName: '',
    clientPhone: '',
    deviceModel: '',
    deviceIMEI: '',
    specialistId: '',
    specialistName: '',
    state: { 
      tela: { hasDamage: false, notes: '' }, 
      traseira: { hasDamage: false, notes: '' }, 
      cameras: { hasDamage: false, notes: '' }, 
      botoes: { hasDamage: false, notes: '' } 
    },
    coverage: 'FULL',
    paymentMethod: 'PIX',
    valueBlindagem: 0,
    valuePelicula: 0,
    valueOthers: 0,
    photos: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const next = () => {
    if (validateStep()) {
      if (step === STEPS.length - 1) {
        onComplete(data);
      } else {
        setStep(s => Math.min(STEPS.length - 1, s + 1));
      }
    }
  };
  
  const back = () => step === 0 ? onCancel() : setStep(s => s - 1);

  const totalCalculated = useMemo(() => {
    return (data.valueBlindagem || 0) + (data.valuePelicula || 0) + (data.valueOthers || 0);
  }, [data.valueBlindagem, data.valuePelicula, data.valueOthers]);

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    
    if (step === 0) {
      if (!data.clientName) newErrors.clientName = 'Campo obrigatório';
      if (!data.deviceModel) newErrors.deviceModel = 'Campo obrigatório';
      if (!data.specialistId) newErrors.specialistId = 'Selecione um especialista';
    }
    
    if (step === 2) {
      if (!data.valueBlindagem || data.valueBlindagem <= 0) {
        newErrors.valueBlindagem = 'Insira um valor válido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNumericInput = (field: keyof Attendance, value: string) => {
    const cleanValue = value.replace(/[^0-9.]/g, '');
    const numericValue = parseFloat(cleanValue) || 0;
    setData(prev => ({ ...prev, [field]: numericValue }));
    if (numericValue > 0) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="fixed inset-0 bg-black flex flex-col h-full overflow-hidden z-[500] animate-premium-in">
      <header className="h-24 border-b border-white/5 bg-black/90 backdrop-blur-2xl flex items-center justify-between px-8 shrink-0 relative z-10">
        <button onClick={back} className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl text-white/40 hover:text-white transition-all active:scale-90 border border-white/5">
          <ArrowLeft size={20}/>
        </button>
        
        <div className="flex gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/5">
          {STEPS.map((s, i) => (
            <div key={s.id} className={`h-1.5 rounded-full transition-all duration-700 ${i <= step ? 'w-10 bg-white' : 'w-2 bg-white/10'}`} />
          ))}
        </div>

        <button onClick={onCancel} className="w-12 h-12 flex items-center justify-center bg-red-500/5 rounded-2xl text-red-500/40 hover:text-red-500 transition-all border border-red-500/10">
          <X size={20}/>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
        <div className="max-w-xl mx-auto px-6 pt-20 pb-40 space-y-16">
          <div className="space-y-4 text-center md:text-left">
            <IBBadge variant="primary">MODALIDADE: {STEPS[step].label}</IBBadge>
            <h1 className="text-4xl brand-font-bold tracking-tighter text-white uppercase leading-none">Novo Atendimento</h1>
            <p className="text-[10px] font-black text-white/20 tracking-[0.5em] uppercase">Etapa {step + 1} de {STEPS.length}</p>
          </div>

          {step === 0 && (
            <div className="space-y-10 animate-premium-in">
              <div className="grid gap-8">
                <div className="space-y-4 text-left">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] ml-1">Especialista Responsável</label>
                  <div className="grid grid-cols-1 gap-3">
                    {specialists.map(spec => (
                      <button 
                        key={spec.id}
                        onClick={() => setData({...data, specialistId: spec.id, specialistName: spec.name})}
                        className={`w-full p-6 rounded-2xl flex items-center justify-between border transition-all ${data.specialistId === spec.id ? 'bg-white text-black border-white' : 'bg-white/5 text-white/40 border-white/5 hover:border-white/10'}`}
                      >
                        <div className="flex items-center gap-4">
                          <Users size={18} />
                          <span className="text-xs font-bold uppercase">{spec.name}</span>
                        </div>
                        {data.specialistId === spec.id && <CheckCircle size={18} />}
                      </button>
                    ))}
                    {errors.specialistId && <p className="text-[9px] text-red-500 font-bold uppercase ml-1">{errors.specialistId}</p>}
                  </div>
                </div>

                <IBInput label="NOME COMPLETO DO CLIENTE" placeholder="Ex: João Silva" value={data.clientName} error={errors.clientName} onChange={e => setData({...data, clientName: e.target.value})} />
                <IBInput label="TELEFONE PARA CONTATO" placeholder="(00) 0 0000-0000" value={data.clientPhone} onChange={e => setData({...data, clientPhone: e.target.value})} />
                <IBInput label="APARELHO E MODELO" placeholder="Ex: iPhone 15 Pro Max" value={data.deviceModel} error={errors.deviceModel} onChange={e => setData({...data, deviceModel: e.target.value})} />
              </div>

              <div className="pt-6">
                <IBCard className="border-dashed bg-white/[0.01] hover:bg-white/[0.03] transition-colors p-8">
                  <IBImageUpload label="EVIDÊNCIAS DO ESTADO INICIAL" images={data.photos || []} onChange={(imgs) => setData({...data, photos: imgs})} max={3} />
                </IBCard>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-12 animate-premium-in">
              <div className="grid gap-10">
                <IBBinaryCheck label="ESTADO DO DISPLAY (TELA)" value={data.state!.tela.hasDamage} onChange={(v) => setData({...data, state: {...data.state!, tela: {...data.state!.tela, hasDamage: v}}})} notes={data.state!.tela.notes} onNotesChange={(n) => setData({...data, state: {...data.state!, tela: {...data.state!.tela, notes: n}}})} />
                <IBBinaryCheck label="ESTADO DA TRASEIRA (VIDRO)" value={data.state!.traseira.hasDamage} onChange={(v) => setData({...data, state: {...data.state!, traseira: {...data.state!.traseira, hasDamage: v}}})} notes={data.state!.traseira.notes} onNotesChange={(n) => setData({...data, state: {...data.state!, traseira: {...data.state!.traseira, notes: n}}})} />
                <IBBinaryCheck label="LENTES E SENSORES" value={data.state!.cameras.hasDamage} onChange={(v) => setData({...data, state: {...data.state!, cameras: {...data.state!.cameras, hasDamage: v}}})} notes={data.state!.cameras.notes} onNotesChange={(n) => setData({...data, state: {...data.state!, cameras: {...data.state!.cameras, notes: n}}})} />
              </div>
              <div className="pt-8 border-t border-white/5">
                <IBInput label="NÚMERO DE SÉRIE / IMEI" placeholder="Digite o identificador único" value={data.deviceIMEI} onChange={e => setData({...data, deviceIMEI: e.target.value})} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-12 animate-premium-in">
              <div className="space-y-6">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] ml-1 block">TIPO DE COBERTURA</label>
                <div className="grid grid-cols-1 gap-4">
                  {(['FULL', 'SCREEN', 'BACK'] as ServiceCoverage[]).map((cov) => (
                    <button key={cov} onClick={() => setData({...data, coverage: cov})} className={`w-full p-8 rounded-3xl flex items-center justify-between border transition-all duration-500 group ${data.coverage === cov ? 'bg-white text-black border-white scale-[1.03] z-20' : 'bg-white/5 text-white/40 border-white/5 hover:border-white/10 hover:bg-white/10'}`}>
                      <div className="flex items-center gap-6">
                        <div className={`p-4 rounded-2xl transition-colors ${data.coverage === cov ? 'bg-black/5' : 'bg-white/5 group-hover:bg-white/10'}`}>
                          {cov === 'FULL' && <Shield size={28} />}
                          {cov === 'SCREEN' && <Smartphone size={28} />}
                          {cov === 'BACK' && <Layers size={28} />}
                        </div>
                        <div className="text-left">
                          <span className="font-black text-base uppercase tracking-tight block">{cov === 'FULL' ? 'BLINDAGEM 360' : cov === 'SCREEN' ? 'BLINDAGEM FRONTAL' : 'BLINDAGEM TRASEIRA'}</span>
                        </div>
                      </div>
                      {data.coverage === cov && <CheckCircle size={24} />}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-10 pt-10 border-t border-white/5">
                <div className="relative group text-left">
                   <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] ml-1 mb-4 block">INVESTIMENTO BLINDAGEM</label>
                   <div className="flex items-baseline gap-4">
                     <span className="text-2xl font-black text-white/20">R$</span>
                     <input type="number" placeholder="0.00" className={`w-full bg-transparent text-6xl font-black outline-none border-b-2 py-4 transition-all tracking-tighter ${errors.valueBlindagem ? 'border-red-500' : 'border-white/10 focus:border-white'}`} value={data.valueBlindagem || ''} onChange={(e) => handleNumericInput('valueBlindagem', e.target.value)} />
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-8 text-left">
                  <IBInput label="ADICIONAL PELÍCULA" placeholder="0.00" type="number" value={data.valuePelicula || ''} onChange={(e) => handleNumericInput('valuePelicula', e.target.value)} />
                  <IBInput label="OUTROS SERVIÇOS" placeholder="0.00" type="number" value={data.valueOthers || ''} onChange={(e) => handleNumericInput('valueOthers', e.target.value)} />
                </div>
              </div>
              <div className="space-y-6 text-left">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] ml-1 block">FORMA DE ACERTO</label>
                <div className="grid grid-cols-2 gap-4">
                  {(['PIX', 'CREDITO', 'DEBITO', 'DINHEIRO'] as PaymentMethod[]).map(method => (
                    <button key={method} onClick={() => setData({...data, paymentMethod: method})} className={`py-6 rounded-2xl border text-[11px] font-black tracking-widest uppercase transition-all duration-300 ${data.paymentMethod === method ? 'bg-white text-black border-white' : 'bg-white/5 text-white/30 border-white/5 hover:bg-white/10'}`}>
                      {method}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-12 animate-premium-in">
              <div className="space-y-6 text-left">
                <div className="flex items-center gap-3 text-white/30 mb-2">
                  <PenTool size={16} />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em]">VALORIZAÇÃO DO ACORDO</span>
                </div>
                <p className="text-xs font-medium text-white/40 leading-relaxed uppercase tracking-wider bg-white/5 p-6 rounded-2xl border border-white/5">Ao assinar, o cliente confirma a vistoria realizada e aceita os termos de garantia vitalícia da blindagem iBlind.</p>
                <div className="bg-[#0A0A0A] border border-white/10 rounded-[48px] p-4 shadow-2xl">
                  <SignaturePad onSave={sig => setData({...data, clientSignature: sig})} onClear={() => setData({...data, clientSignature: ''})} />
                </div>
              </div>
              <div className="p-10 bg-white/5 border border-white/5 rounded-[40px] flex justify-between items-center">
                  <div className="space-y-1 text-left">
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em] block">TOTAL FINAL</span>
                    <span className="text-4xl font-black text-white tracking-tighter">{formatCurrency(totalCalculated)}</span>
                  </div>
                  <div className={`p-4 rounded-full ${data.clientSignature ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/20'}`}>
                    <CheckCircle size={32} />
                  </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="p-8 bg-black/90 backdrop-blur-3xl border-t border-white/5 sticky bottom-0 z-10">
        <div className="max-w-xl mx-auto flex gap-4">
          <IBButton onClick={next} className="flex-1 h-20 rounded-[32px] text-sm" disabled={step === 3 && !data.clientSignature}>
            {step === 3 ? 'FINALIZAR ATENDIMENTO' : 'PRÓXIMO PASSO'}
            {step < 3 && <ChevronRight size={20} />}
          </IBButton>
        </div>
      </footer>
    </div>
  );
};
