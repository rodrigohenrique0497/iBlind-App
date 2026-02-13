
import React from 'react';
import { Check, X, Loader2, AlertCircle, Camera, Trash2 } from 'lucide-react';

export const IBCard: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-card border border-border p-6 rounded-[24px] shadow-none transition-all hover:border-foreground/10 ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''} ${className}`}
  >
    {children}
  </div>
);

export const IBlindStatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color?: string }> = ({ title, value, icon, color = 'text-primary' }) => (
  <IBCard className="flex items-center gap-6 p-8 relative overflow-hidden group">
    <div className={`w-14 h-14 rounded-2xl bg-foreground/5 border border-border flex items-center justify-center ${color} transition-all duration-500 group-hover:bg-foreground group-hover:text-background`}>
      {icon}
    </div>
    <div>
      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-40">{title}</p>
      <p className="text-3xl brand-font-bold mt-1 tracking-tighter text-foreground">{value}</p>
    </div>
  </IBCard>
);

export const IBButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost', isLoading?: boolean }> = ({ 
  children, variant = 'primary', isLoading, className = '', ...props 
}) => {
  const base = "px-8 py-5 rounded-2xl font-black text-[10px] tracking-[0.3em] uppercase transition-all duration-500 active:scale-[0.96] flex items-center justify-center gap-3 disabled:opacity-50 select-none border";
  
  const variants = {
    primary: "bg-foreground text-background border-foreground hover:bg-transparent hover:text-foreground shadow-lg",
    secondary: "bg-transparent text-foreground border-foreground/10 hover:border-foreground hover:bg-foreground hover:text-background",
    danger: "bg-red-600 text-white border-red-600 hover:bg-transparent hover:text-red-500 shadow-lg shadow-red-600/10",
    ghost: "bg-transparent text-muted-foreground border-transparent hover:text-foreground hover:bg-foreground/5"
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {isLoading ? <Loader2 className="animate-spin" size={16} /> : children}
    </button>
  );
};

export const IBInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }> = ({ label, error, className = '', ...props }) => (
  <div className="space-y-2 w-full">
    {label && <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-1 opacity-40">{label}</label>}
    <input
      {...props}
      className={`w-full bg-background border border-foreground/10 focus:border-foreground/20 text-foreground px-6 py-5 rounded-2xl outline-none transition-all placeholder:text-foreground/5 text-xs font-medium text-left ${className}`}
    />
    {error && <p className="text-[9px] font-black text-red-500 uppercase ml-1 tracking-widest">{error}</p>}
  </div>
);

export const IBBinaryCheck: React.FC<{ label: string; value: boolean; onChange: (v: boolean) => void; notes?: string; onNotesChange?: (n: string) => void }> = ({ 
  label, value, onChange, notes, onNotesChange 
}) => (
  <div className="space-y-4">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <span className="text-[10px] font-black text-foreground brand-font-bold uppercase tracking-[0.2em]">{label}</span>
      <div className="flex bg-foreground/5 border border-border p-1 rounded-2xl w-full md:w-auto">
        <button 
          type="button"
          onClick={() => onChange(false)}
          className={`px-8 py-4 rounded-xl text-[9px] font-black tracking-widest transition-all ${!value ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'}`}
        >
          ÍNTREGRO
        </button>
        <button 
          type="button"
          onClick={() => onChange(true)}
          className={`px-8 py-4 rounded-xl text-[9px] font-black tracking-widest transition-all ${value ? 'bg-red-600 text-white' : 'text-muted-foreground hover:text-red-500'}`}
        >
          AVARIA
        </button>
      </div>
    </div>
    {value && onNotesChange && (
      <div className="animate-premium-in">
        <IBInput 
          label="Descrição da Avaria" 
          placeholder="Especifique os danos encontrados..."
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          className="border-red-500/20"
        />
      </div>
    )}
  </div>
);

export const IBImageUpload: React.FC<{ 
  label: string; 
  images: string[]; 
  onChange: (images: string[]) => void;
  max?: number;
}> = ({ label, images, onChange, max = 4 }) => {
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      if (images.length >= max) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onChange([...images, base64String]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em] ml-1 opacity-40">{label}</label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((img, i) => (
          <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group bg-foreground/5 border border-border">
            <img src={img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt={`Evidence ${i}`} />
            <button 
              type="button"
              onClick={() => removeImage(i)}
              className="absolute inset-0 bg-red-600/80 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
        {images.length < max && (
          <label className="aspect-square rounded-2xl border border-dashed border-foreground/10 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-foreground/5 hover:border-foreground/30 transition-all text-muted-foreground group">
            <Camera size={24} className="group-hover:text-foreground transition-colors" />
            <span className="text-[8px] font-black uppercase tracking-[0.3em]">Capturar</span>
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              className="hidden" 
              onChange={handleFile} 
              multiple 
            />
          </label>
        )}
      </div>
    </div>
  );
};

export const IBBadge: React.FC<{ children: React.ReactNode; variant?: 'success' | 'warning' | 'error' | 'neutral' | 'primary' }> = ({ children, variant = 'neutral' }) => {
  const styles = {
    success: 'bg-foreground text-background',
    warning: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
    error: 'bg-red-600 text-white',
    neutral: 'bg-transparent text-muted-foreground border border-foreground/10',
    primary: 'bg-foreground/10 text-foreground border border-foreground/20',
  };
  return (
    <span className={`text-[8px] font-black uppercase tracking-[0.3em] px-3 py-1.5 rounded-lg ${styles[variant]}`}>
      {children}
    </span>
  );
};

export const IBSkeleton: React.FC<{ className?: string }> = ({ className = "h-4 w-full" }) => (
  <div className={`skeleton ${className} opacity-5`} />
);
