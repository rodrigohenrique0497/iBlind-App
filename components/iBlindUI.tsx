
import React from 'react';
import { Check, X, Loader2, AlertCircle, Camera, Trash2, ChevronDown } from 'lucide-react';

export const IBCard: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-card border border-border p-5 rounded-[24px] premium-shadow transition-all hover:border-foreground/10 hover:bg-foreground/[0.01] ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''} ${className}`}
  >
    {children}
  </div>
);

export const IBlindStatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color?: string }> = ({ title, value, icon, color = 'text-primary' }) => (
  <IBCard className="flex items-center gap-3 p-4 relative group">
    <div className={`w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center ${color} transition-all duration-500 group-hover:bg-foreground group-hover:text-background shrink-0`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[8px] font-black text-foreground/50 uppercase tracking-[0.1em] leading-none">{title}</p>
      <p className="text-sm sm:text-xl brand-font-bold mt-1 tracking-tighter text-foreground whitespace-normal break-words leading-tight">
        {value}
      </p>
    </div>
  </IBCard>
);

export const IBButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost', isLoading?: boolean }> = ({ 
  children, variant = 'primary', isLoading, className = '', ...props 
}) => {
  const base = "px-6 h-16 rounded-2xl font-black text-[10px] tracking-[0.25em] uppercase transition-all duration-300 active:scale-[0.94] flex items-center justify-center gap-3 disabled:opacity-50 select-none border shrink-0";
  
  const variants = {
    primary: "bg-foreground text-background border-foreground shadow-lg",
    secondary: "bg-muted text-foreground border-border",
    danger: "bg-red-600 text-white border-red-600",
    ghost: "bg-transparent text-muted-foreground border-transparent hover:text-foreground"
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {isLoading ? <Loader2 className="animate-spin" size={16} /> : children}
    </button>
  );
};

export const IBInput: React.FC<React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement> & { label?: string; error?: string; as?: 'input' | 'select' }> = ({ label, error, className = '', as = 'input', children, ...props }) => {
  const Component = as;
  
  // Aumento de contraste: text-foreground sólido, placeholder mais visível (opacity-60), font-bold e size 16px
  const inputBaseClasses = `
    w-full bg-muted border border-border
    focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20
    text-foreground px-5 h-16 rounded-2xl 
    outline-none transition-all duration-300 
    placeholder:text-foreground/40 text-[16px] font-bold 
    appearance-none
  `;

  return (
    <div className="space-y-2 w-full text-left">
      {label && <label className="text-[9px] font-black text-foreground/60 uppercase tracking-[0.3em] ml-1">{label}</label>}
      <div className="relative">
        <Component
          {...props as any}
          className={`${inputBaseClasses} ${className}`}
        >
          {children}
        </Component>
        {as === 'select' && (
          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-foreground/40">
             <ChevronDown size={16} />
          </div>
        )}
      </div>
      {error && <p className="text-[9px] font-bold text-red-500 uppercase ml-1 tracking-widest">{error}</p>}
    </div>
  );
};

export const IBBinaryCheck: React.FC<{ label: string; value: boolean; onChange: (v: boolean) => void; notes?: string; onNotesChange?: (n: string) => void }> = ({ 
  label, value, onChange, notes, onNotesChange 
}) => (
  <div className="space-y-3">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
      <span className="text-[10px] font-black text-foreground uppercase tracking-[0.2em] ml-1">{label}</span>
      <div className="flex bg-muted border border-border p-1 rounded-2xl w-full md:w-auto overflow-hidden">
        <button 
          type="button"
          onClick={() => onChange(false)}
          className={`px-6 h-12 rounded-xl text-[9px] font-black tracking-widest transition-all flex-1 md:flex-none ${!value ? 'bg-foreground text-background shadow-md' : 'text-foreground/40'}`}
        >
          ÍNTEGRO
        </button>
        <button 
          type="button"
          onClick={() => onChange(true)}
          className={`px-6 h-12 rounded-xl text-[9px] font-black tracking-widest transition-all flex-1 md:flex-none ${value ? 'bg-red-600 text-white shadow-md' : 'text-foreground/40'}`}
        >
          AVARIA
        </button>
      </div>
    </div>
    {value && onNotesChange && (
      <div className="animate-premium-in">
        <IBInput 
          label="OBSERVAÇÃO DA AVARIA" 
          placeholder="Especifique..."
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          className="border-red-500/20 h-14"
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
    <div className="space-y-3">
      <label className="text-[9px] font-black text-foreground/60 uppercase tracking-[0.3em] ml-1">{label}</label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {images.map((img, i) => (
          <div key={i} className="relative aspect-square rounded-xl overflow-hidden group bg-muted border border-border">
            <img src={img} className="w-full h-full object-cover grayscale" alt={`Evidence ${i}`} />
            <button 
              type="button"
              onClick={() => removeImage(i)}
              className="absolute inset-0 bg-red-600/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={24} />
            </button>
          </div>
        ))}
        {images.length < max && (
          <label className="aspect-square rounded-xl border border-dashed border-border flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-foreground/[0.03] transition-all text-foreground/40 group">
            <Camera size={24} className="group-hover:text-foreground transition-colors" />
            <span className="text-[8px] font-black uppercase tracking-[0.2em]">Câmera</span>
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
    neutral: 'bg-transparent text-foreground/60 border border-border',
    primary: 'bg-foreground/10 text-foreground border border-foreground/10',
  };
  return (
    <span className={`text-[8px] font-black uppercase tracking-[0.25em] px-2.5 py-1.5 rounded-lg ${styles[variant]} shrink-0`}>
      {children}
    </span>
  );
};

export const IBSkeleton: React.FC<{ className?: string }> = ({ className = "h-4 w-full" }) => (
  <div className={`skeleton ${className} opacity-5`} />
);
