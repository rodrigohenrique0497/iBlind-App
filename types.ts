
export type UserRole = 'ADMIN' | 'TECNICO';
export type AppTheme = 'DARK' | 'LIGHT';

export interface TenantConfig {
  companyName: string;
  logoUrl?: string;
  primaryColor: string; // Hex color
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
export type FilmHandling = 'NEW' | 'REAPPLIED' | 'NONE';

export interface InspectionItem {
  hasDamage: boolean;
  description?: string;
}

export interface DeviceState {
  tela: InspectionItem;
  traseira: InspectionItem;
  cameras: InspectionItem;
  botoes: InspectionItem;
}

export interface DeletionAudit {
  deletedBy: string;
  deletedByName: string;
  reason: string;
  timestamp: string;
}

export interface Attendance {
  id: string;
  warrantyId: string;
  date: string; // ISO String
  warrantyUntil: string; // ISO String
  technicianId: string;
  technicianName: string;
  
  clientName: string;
  clientPhone: string;
  deviceModel: string;
  deviceIMEI: string;

  state: DeviceState;
  coverage: ServiceCoverage;
  filmHandling: FilmHandling;
  
  appliedCourtesyFilm?: boolean;
  courtesyFilmId?: string;
  
  valueBlindagem: number;
  paymentMethod: PaymentMethod;
  totalValue: number;

  clientSignature: string; 
  photoUrls?: string[];
  
  isDeleted?: boolean;
  audit?: DeletionAudit;
}

export interface InventoryItem {
  id: string;
  name: string;
  currentStock: number;
  minStock: number;
  costPrice: number;
  category: 'PELICULA' | 'LIQUIDO' | 'ACESSORIO';
}
