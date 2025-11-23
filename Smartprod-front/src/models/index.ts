// Tipos de produto
export type ProductType = 'MP' | 'PA';
export type ProductionStatus = 'PLANEJADA' | 'EM_PRODUCAO' | 'PAUSADA' | 'CONCLUIDA' | 'CANCELADA';
export type InvoiceType = 'ENTRADA' | 'SAIDA';
export type InvoiceStatus = 'PROCESSADA' | 'PENDENTE' | 'ERRO';
export type MovementType = 'ENTRADA' | 'SAIDA' | 'PRODUCAO' | 'CONSUMO';

export interface Usuario {
  id: number;
  name: string;
  email: string;
  senha: string;
  createdAt: string;
  products?: Product[];
  productionOrders?: ProductionOrder[];
  invoices?: Invoice[];
}

export interface Product {
  id: number;
  code: string;
  name: string;
  type: ProductType;
  unit: string;
  currentStock: number;
  reservedStock: number;
  minStock: number;
  usuarioId: number;
  bom?: BOM;
  materialsUsed?: BOMItem[];
  productionOrders?: ProductionOrder[];
  invoiceItems?: InvoiceItem[];
  stockMovements?: StockMovement[];
  createdAt: string;
  updatedAt: string;
}

export interface BOM {
  id: number;
  productId: number;
  product: Product;
  materials: BOMItem[];
  createdAt: string;
  updatedAt: string;
}

export interface BOMItem {
  id: number;
  bomId: number;
  materialId: number;
  bom: BOM;
  material: Product;
  quantity: number;
}

export interface ProductionOrder {
  id: number;
  productId: number;
  usuarioId: number;
  quantity: number;
  status: ProductionStatus;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  produced: number;
  product: Product;
  usuario: Usuario;
}

export interface Invoice {
  id: number;
  usuarioId: number;
  type: InvoiceType;
  number: string;
  date: string;
  supplier?: string;
  customer?: string;
  status: InvoiceStatus;
  usuario: Usuario;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  id: number;
  invoiceId: number;
  productId: number;
  quantity: number;
  value: number;
  invoice: Invoice;
  product: Product;
}

export interface StockMovement {
  id: number;
  productId: number;
  orderId?: number;
  type: MovementType;
  quantity: number;
  createdAt: string;
  product: Product;
}
