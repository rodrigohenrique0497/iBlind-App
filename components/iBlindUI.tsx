
import React from 'react';
import { Loader2, ChevronDown, Camera, Trash2 } from 'lucide-react';

export const IBCard: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-surface border border-white/5 p-8 rounded-premium transition-all duration-500 ${onClick ? 'cursor-pointer hover:bg-surface-lighter hover:border-white/10 active:scale-[0.98]' : ''} ${className}`}
  >
    {children}
  </div>
);

export const IBlindStatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color?: string }> = ({ title, value, icon, color = 'text-white' }) => (
  <IBCard className="flex items-center gap-6 p-7">
    <div className={`w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center ${color}`}>
      {React.cloneElement(icon as React.ReactElement, { size: 22 })}
    </div>
    <div className="text-left">
      <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-1">{title}</p>
      <p className="text-2xl font-extrabold tracking-tight text-white leading-none">{value}</p>
    </div>
  </IBCard>
);

export const IBButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost', isLoading?: boolean }> = ({ 
  children, variant = 'primary', isLoading, className = '', ...props 
}) => {
  const base = "h-14 px-8 rounded-premium font-extrabold text-[11px] tracking-[0.15em] uppercase transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 select-none cursor-pointer";
  
  const variants = {
    primary: "bg-white text-black border border-white hover:bg-white/90 active:scale-95 shadow-[0_10px_40px_rgba(255,255,255,0.1)]",
    secondary: "bg-surface-lighter text-white border border-white/5 hover:border-white/20 active:bg-white/[0.08] active:scale-95",
    danger: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white active:scale-95",
    ghost: "bg-transparent text-white/40 hover:text-white hover:bg-white/[0.04] active:scale-95"
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
    w-full h-15 bg-surface-lighter border border-white/5 
    focus:border-white/30 focus:bg-[#1A1A1A] 
    text-white px-6 rounded-premium 
    outline-none transition-all duration-300 
    placeholder:text-white/10 text-sm font-semibold
    appearance-none
  `;

  return (
    <div className="space-y-3 w-full text-left">
      {label && <label className="text-[10px] font-extrabold text-white/20 uppercase tracking-[0.3em] ml-2">{label}</label>}
      <div className="relative">
        <Component
          {...props as any}
          className={`${inputBaseClasses} ${className}`}
        >
          {children}
        </Component>
        {as === 'select' && (
          <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
             <ChevronDown size={16} />
          </div>
        )}
      </div>
      {error && <p className="text-[10px] font-bold text-red-500 uppercase ml-2 tracking-wide">{error}</p>}
    </div>
  );
};

export const IBBinaryCheck: React.FC<{ label: string; value: boolean; onChange: (v: boolean) => void; notes?: string; onNotesChange?: (n: string) => void }> = ({ 
  label, value, onChange, notes, onNotesChange 
}) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between gap-6 p-2 bg-surface rounded-premium border border-white/5 transition-all hover:border-white/10">
      <span className="text-[11px] font-extrabold text-white uppercase tracking-[0.1em] ml-4">{label}</span>
      <div className="flex bg-background p-1 rounded-2xl border border-white/5">
        <button 
          type="button"
          onClick={() => onChange(false)}
          className={`h-11 px-8 rounded-xl text-[10px] font-black tracking-widest transition-all ${!value ? 'bg-white text-black' : 'text-white/20 hover:text-white'}`}
        >
          ÍNTEGRO
        </button>
        <button 
          type="button"
          onClick={() => onChange(true)}
          className={`h-11 px-8 rounded-xl text-[10px] font-black tracking-widest transition-all ${value ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'text-white/20 hover:text-red-400'}`}
        >
          AVARIA
        </button>
      </div>
    </div>
    {value && onNotesChange && (
      <div className="animate-premium-in px-2">
        <IBInput 
          label="Nota de Vistoria" 
          placeholder="Especifique o dano..."
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

  return (
    <div className="space-y-4">
      <label className="text-[10px] font-extrabold text-white/20 uppercase tracking-[0.3em] ml-2">{label}</label>
      <div className="grid grid-cols-4 gap-4">
        {images.map((img, i) => (
          <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group bg-surface-lighter border border-white/5">
            <img src={img} className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 transition-all duration-500" alt={`Evidence ${i}`} />
            <button 
              type="button"
              onClick={() => onChange(images.filter((_, idx) => idx !== i))}
              className="absolute inset-0 bg-red-600/90 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
        {images.length < max && (
          <label className="aspect-square rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/[0.04] hover:border-white/30 transition-all text-white/10 hover:text-white active:scale-95">
            <Camera size={24} />
            <span className="text-[9px] font-black uppercase tracking-widest">Adicionar</span>
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} multiple />
          </label>
        )}
      </div>
    </div>
  );
};

export const IBBadge: React.FC<{ children: React.ReactNode; variant?: 'success' | 'warning' | 'error' | 'neutral' | 'primary' }> = ({ children, variant = 'neutral' }) => {
  const styles = {
    success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    error: 'bg-red-500/10 text-red-400 border border-red-500/20',
    neutral: 'bg-white/5 text-white/40 border border-white/5',
    primary: 'bg-white text-black font-extrabold',
  };
  return (
    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg ${styles[variant]}`}>
      {children}
    </span>
  );
};
