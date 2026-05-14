
export type Role = 'Banco' | 'Agente' | 'CCR' | 'Regional' | 'Logistica' | 'Inventario';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  institution?: string; // For 'Banco' role
  region?: string; // For 'Regional' role
}

export type ViewState = 'login' | 'dashboard' | 'sales' | 'warehouse' | 'finance' | 'inquiry';

export type SaleChannel = 'Venta Ordinaria' | 'Jornada';
export type StartMethod = 'Afiliado' | 'RIF';
export type SaleModality = 'Contado' | 'Financiado' | 'Comodato' | 'Contado con garantía extendida' | 'Contado sin garantía extendida';
export type PaymentMethod = 'Transferencia' | 'POS' | 'Efectivo' | 'Boton';

export interface ClientData {
  businessName: string;
  rif: string;
  fiscalAddress: string;
  email: string;
  email2?: string;
  phone1: string;
  phone2?: string;
  social1?: string;
  social2?: string;
  bank: string;
  affiliateNumber?: string;
  status: 'Activo' | 'Inactivo' | 'Mora';
  terminalsCount: number;
}

export interface Affiliate {
  id: string;
  bank: string;
  mid: string;
  status: 'Activo' | 'Inactivo';
  region: string;
}

export interface WarehouseRequest {
  id: string;
  model: string;
  quantity: number;
  operator: 'Movistar' | 'Digitel' | 'Ambas';
  method: 'Sede' | 'Envío';
  status: 'Aprobada' | 'Rechazada' | 'Editada' | 'Pending';
  reason?: string;
  date: string;
  userId: string;
  requester: string;
}

export interface InventoryItem {
  id: string;
  model: string;
  type: 'POS' | 'SIM';
  stock: number;
  reserved: number;
  isFixedAsset?: boolean; // Para Contraloría (Comodato)
  entryDate?: string;
  operator?: 'Movistar' | 'Digitel';
}

export interface Invoice {
  id: string;
  rif: string;
  clientName: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  date: string;
  type: 'Venta' | 'Servicio' | 'CCO' | 'Comodato';
  serial?: string;
  controlNumber?: string;
  items?: { name: string, qty: number, price: number }[];
  posModel?: string;
  simCount?: number;
  taxes?: number;
  paymentTerms?: string;
  userId: string; 
  institution?: string; 
  hasExtendedWarranty?: boolean;
}

export interface AssistantMessage {
  role: 'user' | 'model';
  text: string;
}

// Alias mantenido para compatibilidad. El asistente ahora corre 100% local (mock).
export type GeminiMessage = AssistantMessage;
