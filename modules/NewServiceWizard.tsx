
import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, Smartphone, ShieldCheck, Box, CreditCard, 
  PenTool, CheckCircle, Camera, Wallet, Plus, Zap, 
  Shield, Layers, ChevronRight, AlertCircle, Phone, User as UserIcon,
  X, Users as UsersIcon, LogIn, LogOut, ClipboardCheck
} from 'lucide-react';
import { IBInput, IBButton, IBBinaryCheck, IBBadge, IBCard, IBImageUpload } from '../components/iBlindUI.tsx';
import { Attendance, InventoryItem, ServiceCoverage, PaymentMethod, User } from '../types.ts';

interface WizardProps {
  inventory: InventoryItem[];
  specialists: User[];
  onComplete: (data: Partial<Attendance>) => void;
  onCancel: () => void;
}

const STEPS = [
  { id: 'CLIENT', label: 'CLIENTE', icon: <UserIcon size={18} /> },
  { id: 'ENTRY', label: 'ENTRADA', icon: <LogIn size={18} /> },
  { id: 'SERVICE', label: 'SERVIÇO', icon: <Shield size={18} /> },
  { id: 'EXIT', label: 'SAÍDA', icon: <LogOut size={18} /> },
  { id: 'FINISH', label: 'RESUMO', icon: <ClipboardCheck size={18} /> },
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
    entryState: { 
      tela: { hasDamage: false, notes: '' }, 
      traseira: { hasDamage: false, notes: '' }, 
      cameras: { hasDamage: false, notes: '' }, 
      botoes: { hasDamage: false, notes: '' } 
    },
    exitState: { 
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
    photos: [],
    exitPhotos: []
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
      if (!data.clientName) newErrors.clientName = 'Obrigatório';
      if (!data.deviceModel) newErrors.deviceModel = 'Obrigatório';
      if (!data.specialistId) newErrors.specialistId = 'Selecione';
    }
    if (step === 2) {
      if (!data.valueBlindagem || data.valueBlindagem <= 0) {
        newErrors.valueBlindagem = 'Valor Inválido';
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
    <div className="fixed inset-0 bg-background flex flex-col h-full overflow-hidden z-[500] animate-premium-in">
      {/* HEADER WIZARD */}
      <header className="h-[72px] border-b border-border bg-background/90 backdrop-blur-2xl flex items-center justify-between px-5 shrink-0 relative z-10 pt-[env(safe-area-inset-top)]">
        <button onClick={back} className="w-10 h-10 flex items-center justify-center bg-muted rounded-xl text-foreground/40 active:scale-90 transition-all border border-border">
          <ArrowLeft size={18}/>
        </button>
        
        <div className="flex gap-2 px-3 py-1.5 bg-muted rounded-full border border-border">
          {STEPS.map((s, i) => (
            <div key={s.id} className={`h-1 rounded-full transition-all duration-700 ${i <= step ? 'w-8 bg-foreground' : 'w-1.5 bg-foreground/10'}`} />
          ))}
        </div>

        <button onClick={onCancel} className="w-10 h-10 flex items-center justify-center bg-red-500/5 rounded-xl text-red-500/40 border border-red-500/10">
          <X size={18}/>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
        <div className="max-w-xl mx-auto px-5 pt-8 pb-32 space-y-10">
          <div className="space-y-3 text-center">
            <IBBadge variant="primary">{STEPS[step].label}</IBBadge>
            <h1 className="text-2xl brand-font-bold tracking-tighter text-foreground uppercase mt-3">Atendimento iBlind</h1>
            <p className="text-[8px] font-black text-foreground/20 tracking-[0.4em] uppercase">Passo {step + 1} de {STEPS.length}</p>
          </div>

          {step === 0 && (
            <div className="space-y-6 animate-premium-in">
              <div className="grid gap-5">
                <div className="space-y-3 text-left">
                  <label className="text-[9px] font-black text-foreground/30 uppercase tracking-[0.3em] ml-1">Equipe Técnica</label>
                  <div className="grid grid-cols-1 gap-2">
                    {specialists.map(spec => (
                      <button 
                        key={spec.id}
                        onClick={() => setData({...data, specialistId: spec.id, specialistName: spec.name})}
                        className={`w-full p-4 h-16 rounded-xl flex items-center justify-between border transition-all active:scale-[0.98] ${data.specialistId === spec.id ? 'bg-foreground text-background border-foreground shadow-md' : 'bg-muted text-foreground/40 border-border'}`}
                      >
                        <div className="flex items-center gap-3">
                          <UsersIcon size={16} />
                          <span className="text-[10px] font-bold uppercase">{spec.name}</span>
                        </div>
                        {data.specialistId === spec.id && <CheckCircle size={16} />}
                      </button>
                    ))}
                  </div>
                </div>
                <IBInput label="NOME DO CLIENTE" placeholder="Ex: João Silva" value={data.clientName} error={errors.clientName} onChange={e => setData({...data, clientName: e.target.value})} />
                <IBInput label="TELEFONE" placeholder="(00) 0 0000-0000" value={data.clientPhone} onChange={e => setData({...data, clientPhone: e.target.value})} />
                <IBInput label="APARELHO" placeholder="Ex: iPhone 16 Pro" value={data.deviceModel} error={errors.deviceModel} onChange={e => setData({...data, deviceModel: e.target.value})} />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6 animate-premium-in">
              <div className="space-y-2 text-left">
                <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Vistoria de Entrada</h3>
                <p className="text-[9px] text-foreground/40 uppercase">Estado do dispositivo ao chegar</p>
              </div>
              <div className="grid gap-6">
                <IBBinaryCheck label="DISPLAY / TELA" value={data.entryState!.tela.hasDamage} onChange={(v) => setData({...data, entryState: {...data.entryState!, tela: {...data.entryState!.tela, hasDamage: v}}})} notes={data.entryState!.tela.notes} onNotesChange={(n) => setData({...data, entryState: {...data.entryState!, tela: {...data.entryState!.tela, notes: n}}})} />
                <IBBinaryCheck label="TRASEIRA" value={data.entryState!.traseira.hasDamage} onChange={(v) => setData({...data, entryState: {...data.entryState!, traseira: {...data.entryState!.traseira, hasDamage: v}}})} notes={data.entryState!.traseira.notes} onNotesChange={(n) => setData({...data, entryState: {...data.entryState!, traseira: {...data.entryState!.traseira, notes: n}}})} />
                <IBBinaryCheck label="MÓDULO CÂMERA" value={data.entryState!.cameras.hasDamage} onChange={(v) => setData({...data, entryState: {...data.entryState!, cameras: {...data.entryState!.cameras, hasDamage: v}}})} notes={data.entryState!.cameras.notes} onNotesChange={(n) => setData({...data, entryState: {...data.entryState!, cameras: {...data.entryState!.cameras, notes: n}}})} />
              </div>
              <div className="pt-4">
                <IBImageUpload label="FOTOS DE ENTRADA" images={data.photos || []} onChange={(imgs) => setData({...data, photos: imgs})} max={3} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-premium-in">
              <div className="space-y-4">
                <label className="text-[9px] font-black text-foreground/30 uppercase tracking-[0.3em] ml-1 block">COBERTURA ESCOLHIDA</label>
                <div className="grid grid-cols-1 gap-2.5">
                  {(['FULL', 'SCREEN', 'BACK'] as ServiceCoverage[]).map((cov) => (
                    <button key={cov} onClick={() => setData({...data, coverage: cov})} className={`w-full p-5 h-20 rounded-2xl flex items-center justify-between border transition-all active:scale-[0.98] ${data.coverage === cov ? 'bg-foreground text-background border-foreground shadow-xl' : 'bg-muted text-foreground/40 border-border'}`}>
                      <div className="flex items-center gap-4 text-left">
                        {cov === 'FULL' ? <Shield size={20} /> : cov === 'SCREEN' ? <Smartphone size={20} /> : <Layers size={20} />}
                        <span className="font-black text-xs uppercase">{cov === 'FULL' ? 'BLINDAGEM 360' : cov === 'SCREEN' ? 'BLINDAGEM FRONTAL' : 'BLINDAGEM TRASEIRA'}</span>
                      </div>
                      {data.coverage === cov && <CheckCircle size={18} />}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-6 pt-6 border-t border-border">
                <IBInput label="VALOR BLINDAGEM" type="number" placeholder="0.00" value={data.valueBlindagem || ''} error={errors.valueBlindagem} onChange={(e) => handleNumericInput('valueBlindagem', e.target.value)} />
                <IBInput label="MODO DE ACERTO" as="select" value={data.paymentMethod} onChange={(e) => setData({...data, paymentMethod: e.target.value as any})}>
                  <option value="PIX">PIX</option>
                  <option value="CREDITO">CARTÃO DE CRÉDITO</option>
                  <option value="DEBITO">CARTÃO DE DÉBITO</option>
                  <option value="DINHEIRO">DINHEIRO ESPÉCIE</option>
                </IBInput>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-premium-in">
              <div className="space-y-2 text-left">
                <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Vistoria de Saída</h3>
                <p className="text-[9px] text-foreground/40 uppercase">Estado do dispositivo após o serviço</p>
              </div>
              <div className="grid gap-6">
                <IBBinaryCheck label="DISPLAY / TELA" value={data.exitState!.tela.hasDamage} onChange={(v) => setData({...data, exitState: {...data.exitState!, tela: {...data.exitState!.tela, hasDamage: v}}})} notes={data.exitState!.tela.notes} onNotesChange={(n) => setData({...data, exitState: {...data.exitState!, tela: {...data.exitState!.tela, notes: n}}})} />
                <IBBinaryCheck label="TRASEIRA" value={data.exitState!.traseira.hasDamage} onChange={(v) => setData({...data, exitState: {...data.exitState!, traseira: {...data.exitState!.traseira, hasDamage: v}}})} notes={data.exitState!.traseira.notes} onNotesChange={(n) => setData({...data, exitState: {...data.exitState!, traseira: {...data.exitState!.traseira, notes: n}}})} />
                <IBBinaryCheck label="MÓDULO CÂMERA" value={data.exitState!.cameras.hasDamage} onChange={(v) => setData({...data, exitState: {...data.exitState!, cameras: {...data.exitState!.cameras, hasDamage: v}}})} notes={data.exitState!.cameras.notes} onNotesChange={(n) => setData({...data, exitState: {...data.exitState!, cameras: {...data.exitState!.cameras, notes: n}}})} />
              </div>
              <div className="pt-4">
                <IBImageUpload label="FOTOS DE SAÍDA" images={data.exitPhotos || []} onChange={(imgs) => setData({...data, exitPhotos: imgs})} max={3} />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8 animate-premium-in">
              <div className="space-y-6 text-left">
                <div className="p-6 bg-muted border border-border rounded-[32px] space-y-4">
                  <h3 className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.4em]">Resumo do Atendimento</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-bold text-foreground/60 uppercase">Cliente</span>
                      <span className="text-[10px] font-black text-foreground uppercase">{data.clientName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-bold text-foreground/60 uppercase">Aparelho</span>
                      <span className="text-[10px] font-black text-foreground uppercase">{data.deviceModel}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-bold text-foreground/60 uppercase">Serviço</span>
                      <span className="text-[10px] font-black text-foreground uppercase">{data.coverage}</span>
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-foreground text-background rounded-[40px] flex justify-between items-center shadow-2xl">
                    <div className="space-y-0.5 text-left">
                      <span className="text-[8px] font-black opacity-40 uppercase tracking-[0.3em]">VALOR TOTAL</span>
                      <span className="text-4xl font-black tracking-tighter">{formatCurrency(totalCalculated)}</span>
                    </div>
                    <div className="w-12 h-12 bg-background/10 rounded-full flex items-center justify-center">
                      <CheckCircle size={24} />
                    </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* FOOTER WIZARD */}
      <footer className="p-5 pb-[calc(env(safe-area-inset-bottom)+12px)] bg-background/90 backdrop-blur-3xl border-t border-border sticky bottom-0 z-10 flex justify-center">
        <div className="w-full max-w-sm">
          <IBButton 
            onClick={next} 
            className="w-full h-16 rounded-2xl text-[10px] shadow-2xl active:scale-95" 
          >
            <span className="flex items-center gap-2">
              {step === 4 ? 'FINALIZAR OPERAÇÃO' : 'PRÓXIMO PASSO'}
              {step < 4 && <ChevronRight size={16} />}
            </span>
          </IBButton>
        </div>
      </footer>
    </div>
  );
};
