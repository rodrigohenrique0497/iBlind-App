
import React from 'react';
import { Check, ChevronRight, Loader2 } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: string; isUp: boolean };
  onClick?: () => void;
}

export const IBlindStatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-card border border-border p-5 rounded-2xl flex flex-col justify-between transition-all duration-300 hover:ring-1 hover:ring-primary/20 active:scale-[0.98] ${onClick ? 'cursor-pointer' : ''}`}
  >
    <div className="flex justify-between items-start">
      <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
        {icon}
      </div>
      {trend && (
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${trend.isUp ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'}`}>
          {trend.value}
        </span>
      )}
    </div>
    <div className="mt-4">
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em]">{title}</p>
      <h3 className="text-2xl font-bold tracking-tight text-foreground mt-0.5">{value}</h3>
    </div>
  </div>
);

export const IBlindButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger',
  size?: 'sm' | 'md' | 'lg',
  isLoading?: boolean
}> = ({ children, variant = 'primary', size = 'md', isLoading, className, ...props }) => {
  const baseStyles = "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-primary text-primary-foreground hover:brightness-110 shadow-sm",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "border border-border bg-transparent hover:bg-accent",
    ghost: "bg-transparent hover:bg-accent",
    danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  };

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  return (
    <button {...props} className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className || ''}`}>
      {isLoading ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
      {children}
    </button>
  );
};

export const IBlindInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ label, ...props }) => (
  <div className="space-y-1.5 w-full">
    {label && <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">{label}</label>}
    <input
      {...props}
      className="w-full bg-background border border-border focus:border-primary focus:ring-4 focus:ring-primary/10 text-foreground px-4 py-3.5 rounded-xl outline-none transition-all placeholder:text-muted-foreground/40 text-sm font-medium"
    />
  </div>
);

export const IBlindBadge: React.FC<{ children: React.ReactNode; variant?: 'primary' | 'success' | 'warning' | 'error' | 'neutral' }> = ({ children, variant = 'neutral' }) => {
  const styles = {
    primary: 'bg-primary/10 text-primary border-primary/20',
    success: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    error: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    neutral: 'bg-secondary text-muted-foreground border-border',
  };
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${styles[variant]}`}>
      {children}
    </span>
  );
};

export const IBlindOptionCard: React.FC<{ 
  label: string, 
  description?: string, 
  active: boolean, 
  onClick: () => void,
  icon?: React.ReactNode,
  variant?: 'default' | 'danger'
}> = ({ label, description, active, onClick, icon, variant = 'default' }) => (
  <button 
    onClick={onClick}
    className={`w-full p-4 rounded-2xl border text-left transition-all duration-300 flex items-center gap-4 group ${
      active 
      ? variant === 'danger' 
        ? 'bg-destructive/10 border-destructive ring-1 ring-destructive text-foreground'
        : 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20' 
      : 'bg-card border-border hover:border-primary/50 text-foreground'
    }`}
  >
    {icon && <div className={`${active && variant === 'default' ? 'text-primary-foreground' : 'text-primary'} transition-colors`}>{icon}</div>}
    <div className="flex-1">
      <p className="font-bold text-sm tracking-tight">{label}</p>
      {description && <p className={`text-[11px] mt-0.5 ${active && variant === 'default' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{description}</p>}
    </div>
    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${active ? 'bg-primary-foreground border-primary-foreground' : 'border-border group-hover:border-primary/30'}`}>
      {active && <Check size={14} className={variant === 'danger' ? 'text-destructive' : 'text-primary'} strokeWidth={4} />}
    </div>
  </button>
);

export const IBlindModal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in">
      <div className="bg-card border border-border w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
        <div className="px-6 py-5 border-b border-border flex justify-between items-center">
          <h3 className="font-bold text-lg tracking-tight">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-xl transition-colors text-muted-foreground">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
