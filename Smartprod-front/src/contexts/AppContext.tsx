import React, { createContext, useContext, useState, useEffect } from 'react';
import type { 
  Product, 
  BOM, 
  StockMovement, 
  ProductionOrder, 
  Invoice 
} from '../models';

// Re-export models for backward compatibility
export type { 
  Product, 
  BOM, 
  StockMovement, 
  ProductionOrder, 
  Invoice 
};

interface AppContextType {
  products: Product[];
  boms: BOM[];
  stockMovements: StockMovement[];
  productionOrders: ProductionOrder[];
  invoices: Invoice[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  addProductionOrder: (order: Omit<ProductionOrder, 'id' | 'createdAt' | 'produced'>) => void;
  updateProductionOrder: (id: string, order: Partial<ProductionOrder>) => void;
  addStockMovement: (movement: Omit<StockMovement, 'id'>) => void;
  addInvoice: (invoice: Omit<Invoice, 'id'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Mock data
const initialProducts: Product[] = [
  { id: '1', code: 'MP001', name: 'Aço Inox 304', type: 'MP', unit: 'kg', currentStock: 150, reservedStock: 20, minStock: 50 },
  { id: '2', code: 'MP002', name: 'Parafuso M6x20', type: 'MP', unit: 'un', currentStock: 5000, reservedStock: 500, minStock: 1000 },
  { id: '3', code: 'PA001', name: 'Suporte Metálico A1', type: 'PA', unit: 'un', currentStock: 25, reservedStock: 5, minStock: 10, bomId: '1' },
  { id: '4', code: 'PA002', name: 'Base Industrial B2', type: 'PA', unit: 'un', currentStock: 8, reservedStock: 2, minStock: 5, bomId: '2' },
];

const initialBOMs: BOM[] = [
  { id: '1', productId: '3', materials: [{ materialId: '1', quantity: 2.5 }, { materialId: '2', quantity: 4 }] },
  { id: '2', productId: '4', materials: [{ materialId: '1', quantity: 5.0 }, { materialId: '2', quantity: 8 }] },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [boms, setBoms] = useState<BOM[]>(initialBOMs);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  // Initialize with some mock data
  useEffect(() => {
    const mockMovements: StockMovement[] = [
      { id: '1', productId: '1', type: 'entrada', quantity: 100, date: new Date('2025-10-01'), notes: 'Compra Fornecedor A' },
      { id: '2', productId: '2', type: 'entrada', quantity: 2000, date: new Date('2025-10-01'), notes: 'Compra Fornecedor B' },
      { id: '3', productId: '3', type: 'producao', quantity: 10, date: new Date('2025-10-02'), orderId: '1' },
    ];

    const mockOrders: ProductionOrder[] = [
      { id: '1', productId: '3', quantity: 50, status: 'em_producao', createdAt: new Date('2025-10-01'), startedAt: new Date('2025-10-02'), produced: 15 },
      { id: '2', productId: '4', quantity: 20, status: 'planejada', createdAt: new Date('2025-10-02'), produced: 0 },
    ];

    setStockMovements(mockMovements);
    setProductionOrders(mockOrders);
  }, []);

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct = { ...product, id: Date.now().toString() };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (id: string, product: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...product } : p));
  };

  const addProductionOrder = (order: Omit<ProductionOrder, 'id' | 'createdAt' | 'produced'>) => {
    const newOrder = { ...order, id: Date.now().toString(), createdAt: new Date(), produced: 0 };
    setProductionOrders(prev => [...prev, newOrder]);
  };

  const updateProductionOrder = (id: string, order: Partial<ProductionOrder>) => {
    setProductionOrders(prev => prev.map(o => o.id === id ? { ...o, ...order } : o));
  };

  const addStockMovement = (movement: Omit<StockMovement, 'id'>) => {
    const newMovement = { ...movement, id: Date.now().toString() };
    setStockMovements(prev => [newMovement, ...prev]);
  };

  const addInvoice = (invoice: Omit<Invoice, 'id'>) => {
    const newInvoice = { ...invoice, id: Date.now().toString() };
    setInvoices(prev => [newInvoice, ...prev]);
  };

  return (
    <AppContext.Provider value={{
      products,
      boms,
      stockMovements,
      productionOrders,
      invoices,
      addProduct,
      updateProduct,
      addProductionOrder,
      updateProductionOrder,
      addStockMovement,
      addInvoice,
    }}>
      {children}
    </AppContext.Provider>
  );
};