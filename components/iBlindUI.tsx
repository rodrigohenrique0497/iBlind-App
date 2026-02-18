
import React from 'react';
import { Check, X, Loader2, AlertCircle, Camera, Trash2, ChevronDown } from 'lucide-react';

export const IBCard: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-card border border-border p-6 rounded-super transition-all duration-300 ${onClick ? 'cursor-pointer hover:bg-white/[0.02] active:scale-[0.98]' : ''} ${className}`}
  >
    {children}
  </div>
);

export const IBlindStatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color?: string }> = ({ title, value, icon, color = 'text-primary' }) => (
  <IBCard className="flex items-center gap-5 p-6 border-white/[0.03]">
    <div className={`w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center ${color}`}>
      {React.cloneElement(icon as React.ReactElement, { size: 20 })}
    </div>
    <div className="text-left">
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-50 mb-0.5">{title}</p>
      <p className="text-2xl font-extrabold tracking-tighter text-foreground">{value}</p>
    </div>
  </IBCard>
);

export const IBButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost', isLoading?: boolean }> = ({ 
  children, variant = 'primary', isLoading, className = '', ...props 
}) => {
  const base = "h-14 px-8 rounded-premium font-bold text-[11px] tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2.5 disabled:opacity-50 select-none";
  
  const variants = {
    primary: "bg-foreground text-background border border-foreground hover:opacity-90 active:bg-foreground/80 shadow-lg shadow-foreground/5",
    secondary: "bg-surface text-foreground border border-white/5 hover:bg-white/[0.08] active:bg-white/[0.12]",
    danger: "bg-red-600/10 text-red-500 border border-red-500/20 hover:bg-red-600/20 active:bg-red-600/30",
    ghost: "bg-transparent text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {isLoading ? <Loader2 className="animate-spin" size={16} /> : children}
    </button>
  );
};

export const IBInput: React.FC<React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement> & { label?: string; error?: string; as?: 'input' | 'select' }> = ({ label, error, className = '', as = 'input', children, ...props }) => {
  const Component = as;
  
  const inputBaseClasses = `
    w-full h-14 bg-surface border border-white/5 
    focus:border-white/20 focus:bg-[#1A1A1A] 
    text-foreground px-5 rounded-premium 
    outline-none transition-all duration-200 
    placeholder:text-white/10 text-sm font-medium
    appearance-none
  `;

  return (
    <div className="space-y-2 w-full text-left">
      {label && <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">{label}</label>}
      <div className="relative">
        <Component
          {...props as any}
          className={`${inputBaseClasses} ${className}`}
        >
          {children}
        </Component>
        {as === 'select' && (
          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
             <ChevronDown size={14} />
          </div>
        )}
      </div>
      {error && <p className="text-[10px] font-semibold text-red-500 uppercase ml-1 tracking-tight">{error}</p>}
    </div>
  );
};

export const IBBinaryCheck: React.FC<{ label: string; value: boolean; onChange: (v: boolean) => void; notes?: string; onNotesChange?: (n: string) => void }> = ({ 
  label, value, onChange, notes, onNotesChange 
}) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between gap-4">
      <span className="text-[11px] font-extrabold text-foreground uppercase tracking-tight">{label}</span>
      <div className="flex bg-surface border border-white/5 p-1 rounded-2xl">
        <button 
          type="button"
          onClick={() => onChange(false)}
          className={`h-10 px-6 rounded-xl text-[10px] font-bold transition-all ${!value ? 'bg-white text-black' : 'text-white/30 hover:text-white'}`}
        >
          ÍNTEGRO
        </button>
        <button 
          type="button"
          onClick={() => onChange(true)}
          className={`h-10 px-6 rounded-xl text-[10px] font-bold transition-all ${value ? 'bg-red-600 text-white' : 'text-white/30 hover:text-red-500'}`}
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
          className="border-red-500/20 focus:border-red-500/40"
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

  return (
    <div className="space-y-4">
      <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">{label}</label>
      <div className="grid grid-cols-4 gap-3">
        {images.map((img, i) => (
          <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group bg-surface border border-white/5">
            <img src={img} className="w-full h-full object-cover grayscale opacity-80" alt={`Evidence ${i}`} />
            <button 
              type="button"
              onClick={() => onChange(images.filter((_, idx) => idx !== i))}
              className="absolute inset-0 bg-red-600/80 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {images.length < max && (
          <label className="aspect-square rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/[0.04] transition-all text-white/20 hover:text-white">
            <Camera size={20} />
            <span className="text-[9px] font-bold uppercase tracking-tighter">Capturar</span>
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} multiple />
          </label>
        )}
      </div>
    </div>
  );
};

export const IBBadge: React.FC<{ children: React.ReactNode; variant?: 'success' | 'warning' | 'error' | 'neutral' | 'primary' }> = ({ children, variant = 'neutral' }) => {
  const styles = {
    success: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10',
    warning: 'bg-amber-500/10 text-amber-500 border border-amber-500/10',
    error: 'bg-red-500/10 text-red-500 border border-red-500/10',
    neutral: 'bg-white/5 text-white/30 border border-white/5',
    primary: 'bg-white text-black',
  };
  return (
    <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${styles[variant]}`}>
      {children}
    </span>
  );
};

export const IBSkeleton: React.FC<{ className?: string }> = ({ className = "h-4 w-full" }) => (
  <div className={`skeleton ${className} opacity-5 bg-white/20`} />
);
