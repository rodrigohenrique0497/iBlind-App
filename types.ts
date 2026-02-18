
export type UserRole = 'ADMIN' | 'ESPECIALISTA';
export type AppTheme = 'DARK' | 'LIGHT';

export interface TenantConfig {
  companyName: string;
  logoUrl?: string;
  primaryColor: string;
  warrantyDefaultDays: number;
  allowCustomPricing: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  themePreference?: AppTheme;
}

export type PaymentMethod = 'PIX' | 'CREDITO' | 'DEBITO' | 'DINHEIRO';
export type ServiceCoverage = 'FULL' | 'SCREEN' | 'BACK' | 'CAMERAS';
export type InventoryCategory = 'PELICULA' | 'CAPA' | 'ACESSORIO';
export type MovementType = 'IN' | 'OUT' | 'ADJUST' | 'AUTO_DEDUCTION';

export interface StockMovement {
  id: string;
  itemId: string;
  type: MovementType;
  quantity: number;
  userId: string;
  userName: string;
  timestamp: string;
  reason: string;
  relatedAttendanceId?: string;
}

export interface InventoryItem {
  id: string;
  brand: string;        
  model: string;        
  type: string;         
  material: string;     
  sku: string;          
  currentStock: number;
  minStock: number;
  supplier: string;
  costPrice: number;
  suggestedPrice: number;
  lastEntryDate: string;
  category: InventoryCategory;
  assignedSpecialistId?: string;
  assignedSpecialistName?: string;
  observations?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
  targetId?: string;
}

export interface Attendance {
  id: string;
  warrantyId: string;
  date: string;
  warrantyUntil: string;
  technicianId: string;
  technicianName: string;
  specialistId: string;
  specialistName: string;
  clientName: string;
  clientPhone: string;
  deviceModel: string;
  deviceIMEI: string;
  state: {
    tela: { hasDamage: boolean; notes?: string };
    traseira: { hasDamage: boolean; notes?: string };
    cameras: { hasDamage: boolean; notes?: string };
    botoes: { hasDamage: boolean; notes?: string };
  };
  coverage: ServiceCoverage;
  usedItemId?: string; 
  valueBlindagem: number;
  valuePelicula?: number;
  valueOthers?: number;
  paymentMethod: PaymentMethod;
  totalValue: number;
  clientSignature: string;
  photos?: string[]; 
  isDeleted?: boolean;
}
