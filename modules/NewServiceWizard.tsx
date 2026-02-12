
import React, { useState, useMemo } from 'react';
import { ArrowLeft, Smartphone, ShieldCheck, AlertCircle, Scan, Camera, CreditCard, PenTool, CheckCircle2 } from 'lucide-react';
import { IBlindInput, IBlindButton, IBlindBadge, IBlindOptionCard } from '../components/iBlindUI.tsx';
import { SignaturePad } from '../components/SignaturePad.tsx';
import { Attendance, InventoryItem } from '../types.ts';

interface WizardProps {
  inventory: InventoryItem[];
  onComplete: (data: Partial<Attendance>) => void;
  onCancel: () => void;
}

const STEPS = [
  { id: 'DEVICE', label: 'Dispositivo', icon: <Smartphone size={16}/> },
  { id: 'CHECKLIST', label: 'Integridade', icon: <Scan size={16}/> },
  { id: 'COVERAGE', label: 'Blindagem', icon: <ShieldCheck size={16}/> },
  { id: 'CHECKOUT', label: 'Checkout', icon: <CreditCard size={16}/> },
  { id: 'VALIDATE', label: 'Assinatura', icon: <PenTool size={16}/> },
];

export const NewServiceWizard: React.FC<WizardProps> = ({ inventory, onComplete, onCancel }) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Partial<Attendance>>({
    state: { 
      tela: { hasDamage: false }, 
      traseira: { hasDamage: false }, 
      cameras: { hasDamage: false },
      botoes: { hasDamage: false } 
    },
    coverage: 'FULL',
    appliedCourtesyFilm: false,
    valueBlindagem: 0,
    paymentMethod: 'PIX',
    deviceIMEI: ''
  });

  const next = () => setStep(s => Math.min(STEPS.length - 1, s + 1));
  const back = () => step === 0 ? onCancel() : setStep(s => s - 1);

  const canAdvance = useMemo(() => {
    if (step === 0) return data.clientName && data.deviceModel && data.deviceIMEI;
    if (step === 1) return true;
    if (step === 3) return data.valueBlindagem && data.valueBlindagem > 0;
    if (step === 4) return data.clientSignature;
    return true;
  }, [step, data]);

  return (
    <div className="h-full flex flex-col bg-background animate-in overflow-hidden">
      <header className="px-6 py-5 border-b border-border flex items-center justify-between glass sticky top-0 z-50">
        <button onClick={back} className="p-2.5 hover:bg-secondary rounded-2xl transition-all active:scale-90">
          <ArrowLeft size={20} />
        </button>
        <div className="flex gap-1.5">
          {STEPS.map((s, i) => (
            <div key={s.id} className={`h-1 rounded-full transition-all duration-500 ${i <= step ? 'w-6 bg-primary' : 'w-2 bg-secondary'}`} />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <IBlindBadge variant="primary">{step + 1}/{STEPS.length}</IBlindBadge>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 md:p-12">
        <div className="max-w-2xl mx-auto space-y-12">
          
          {step === 0 && (
            <div className="space-y-10 animate-slide-up">
              <div className="space-y-1">
                <h1 className="text-3xl font-extrabold tracking-tighter">Dados do Cliente</h1>
                <p className="text-muted-foreground text-sm font-medium leading-relaxed">Identifique o cliente e o dispositivo para rastreabilidade.</p>
              </div>
              <div className="space-y-6">
                <IBlindInput label="Nome Completo" placeholder="Ex: Rodrigo Silva" value={data.clientName} onChange={e => setData({...data, clientName: e.target.value})} />
                <IBlindInput label="WhatsApp / Telefone" placeholder="(00) 00000-0000" type="tel" value={data.clientPhone} onChange={e => setData({...data, clientPhone: e.target.value})} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                  <IBlindInput label="Modelo do Celular" placeholder="Ex: iPhone 16 Pro" value={data.deviceModel} onChange={e => setData({...data, deviceModel: e.target.value})} />
                  <IBlindInput label="IMEI / Serial Number" placeholder="Código identificador" value={data.deviceIMEI} onChange={e => setData({...data, deviceIMEI: e.target.value})} />
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-10 animate-slide-up">
              <div className="space-y-1">
                <h1 className="text-3xl font-extrabold tracking-tighter">Checklist de Entrada</h1>
                <p className="text-muted-foreground text-sm font-medium">O aparelho apresenta riscos ou danos prévios? Marque apenas se houver avaria.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <IBlindOptionCard 
                  label="Riscos na Tela" 
                  description="Arranhões ou trincas frontais"
                  active={data.state!.tela.hasDamage} 
                  variant={data.state!.tela.hasDamage ? 'danger' : 'default'}
                  onClick={() => setData({...data, state: {...data.state!, tela: {hasDamage: !data.state!.tela.hasDamage}}})} 
                />
                <IBlindOptionCard 
                  label="Danos na Traseira" 
                  description="Vidro traseiro ou quinas"
                  active={data.state!.traseira.hasDamage} 
                  variant={data.state!.traseira.hasDamage ? 'danger' : 'default'}
                  onClick={() => setData({...data, state: {...data.state!, traseira: {hasDamage: !data.state!.traseira.hasDamage}}})} 
                />
                <IBlindOptionCard 
                  label="Lentes da Câmera" 
                  description="Riscos nas lentes circulares"
                  active={data.state!.cameras.hasDamage} 
                  variant={data.state!.cameras.hasDamage ? 'danger' : 'default'}
                  onClick={() => setData({...data, state: {...data.state!, cameras: {hasDamage: !data.state!.cameras.hasDamage}}})} 
                />
                <IBlindOptionCard 
                  label="Borda / Botões" 
                  description="Descascados ou amassados"
                  active={data.state!.botoes.hasDamage} 
                  variant={data.state!.botoes.hasDamage ? 'danger' : 'default'}
                  onClick={() => setData({...data, state: {...data.state!, botoes: {hasDamage: !data.state!.botoes.hasDamage}}})} 
                />
              </div>
              {/* Fix: Explicitly cast 'v' to any to avoid 'Property 'hasDamage' does not exist on type 'unknown'' error */}
              {Object.values(data.state!).some((v: any) => v.hasDamage) && (
                <div className="p-5 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex gap-4 items-start">
                  <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] font-bold text-amber-600 uppercase tracking-widest leading-relaxed">Atenção: Avarias detectadas serão impressas no certificado de garantia para proteção operacional.</p>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-10 animate-slide-up">
              <div className="space-y-1">
                <h1 className="text-3xl font-extrabold tracking-tighter">Plano de Proteção</h1>
                <p className="text-muted-foreground text-sm font-medium">Selecione o serviço executado neste atendimento.</p>
              </div>
              <div className="space-y-4">
                <IBlindOptionCard 
                  label="Blindagem Titanium Full" 
                  description="Proteção 360º: Frente, Verso e Laterais" 
                  active={data.coverage === 'FULL'} 
                  onClick={() => setData({...data, coverage: 'FULL'})} 
                  icon={<ShieldCheck size={20}/>}
                />
                <IBlindOptionCard 
                  label="Frente (Nanotecnológica)" 
                  description="Blindagem líquida de alta resistência" 
                  active={data.coverage === 'SCREEN'} 
                  onClick={() => setData({...data, coverage: 'SCREEN'})} 
                  icon={<Smartphone size={20}/>}
                />
                <IBlindOptionCard 
                  label="Back & Cameras" 
                  description="Traseira e lentes de alto impacto" 
                  active={data.coverage === 'BACK'} 
                  onClick={() => setData({...data, coverage: 'BACK'})} 
                  icon={<Camera size={20}/>}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-10 animate-slide-up">
              <div className="space-y-1 text-center">
                <h1 className="text-3xl font-extrabold tracking-tighter">Resumo de Pagamento</h1>
                <p className="text-muted-foreground text-sm font-medium">Confirme os valores finais acordados.</p>
              </div>
              <div className="bg-card border border-border p-10 rounded-[40px] text-center space-y-3 shadow-sm ring-1 ring-border">
                <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-[0.2em]">Investimento Total</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl font-bold opacity-20">R$</span>
                  <input 
                    type="number" 
                    className="bg-transparent text-6xl font-extrabold text-foreground outline-none w-48 text-center tracking-tighter"
                    placeholder="000"
                    autoFocus
                    onChange={e => setData({...data, valueBlindagem: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {['PIX', 'CREDITO', 'DEBITO', 'DINHEIRO'].map(method => (
                  <IBlindOptionCard 
                    key={method} 
                    label={method} 
                    active={data.paymentMethod === method} 
                    onClick={() => setData({...data, paymentMethod: method as any})} 
                  />
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-10 animate-slide-up">
              <div className="space-y-1 text-center">
                <h1 className="text-3xl font-extrabold tracking-tighter">Validação Jurídica</h1>
                <p className="text-muted-foreground text-sm font-medium">O cliente deve assinar abaixo para validar o estado do aparelho e a garantia.</p>
              </div>
              <div className="space-y-6">
                <SignaturePad 
                  onSave={sig => setData({...data, clientSignature: sig})} 
                  onClear={() => setData({...data, clientSignature: ''})} 
                />
                <div className="flex items-center justify-center gap-2 text-primary">
                  <CheckCircle2 size={14} strokeWidth={3} />
                  <p className="text-[10px] font-bold uppercase tracking-widest">Protocolo de Segurança Criptografado</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="p-6 border-t border-border glass bg-card/50 px-safe">
        <div className="max-w-2xl mx-auto flex gap-4">
          {step > 0 && (
            <IBlindButton variant="secondary" onClick={back} className="px-8 h-14 rounded-2xl">
              Voltar
            </IBlindButton>
          )}
          <IBlindButton 
            disabled={!canAdvance}
            onClick={() => step < 4 ? next() : onComplete(data)} 
            className="flex-1 h-14 rounded-2xl text-base font-bold tracking-tight"
          >
            {step === 4 ? 'Finalizar Atendimento' : 'Próximo Passo'}
          </IBlindButton>
        </div>
      </footer>
    </div>
  );
};
