import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import type { Product, BOM, StockMovement, ProductionOrder, Invoice } from '../models/index';

export type { Product, BOM, StockMovement, ProductionOrder, Invoice };

interface AppContextType {
  products: Product[];
  boms: BOM[];
  stockMovements: StockMovement[];
  productionOrders: ProductionOrder[];
  invoices: Invoice[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: number, product: Partial<Product>) => void;
  addProductionOrder: (order: Omit<ProductionOrder, 'id' | 'createdAt' | 'produced'>) => void;
  updateProductionOrder: (id: number, order: Partial<ProductionOrder>) => void;
  addStockMovement: (movement: Omit<StockMovement, 'id'>) => void;
  addInvoice: (invoice: Omit<Invoice, 'id'>) => void;
  // adiciona addBOM ao tipo do contexto
  addBOM: (bom: BOM) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [boms, setBoms] = useState<BOM[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, bomsRes, stockRes, ordersRes, invoicesRes] = await Promise.all([
          axios.get<Product[]>('http://localhost:5000/api/products'),
          axios.get<BOM[]>('http://localhost:5000/api/boms'),
          axios.get<StockMovement[]>('http://localhost:5000/api/stock-movements'),
          axios.get<ProductionOrder[]>('http://localhost:5000/api/production-orders'),
          axios.get<Invoice[]>('http://localhost:5000/api/invoices'),
        ]);

        setProducts(productsRes.data);
        setBoms(bomsRes.data);
        setStockMovements(stockRes.data);
        setProductionOrders(ordersRes.data);
        setInvoices(invoicesRes.data);
      } catch (err) {
        console.error('Erro ao buscar dados da API:', err);
      }
    };

    fetchData();
  }, []);

  // CRUD functions

  const addProduct = (product: Omit<Product, 'id'>): void => {
    const newProduct: Product = { ...product, id: Date.now() };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (id: number, product: Partial<Product>): void => {
    setProducts(prev => prev.map(p => (p.id === id ? { ...p, ...product } : p)));
  };

  const addProductionOrder = (
    order: Omit<ProductionOrder, 'id' | 'createdAt' | 'produced'>
  ): void => {
    const newOrder: ProductionOrder = {
      ...order,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      produced: 0,
    };
    setProductionOrders(prev => [...prev, newOrder]);
  };

  const updateProductionOrder = (id: number, order: Partial<ProductionOrder>): void => {
    setProductionOrders(prev => prev.map(o => (o.id === id ? { ...o, ...order } : o)));
  };

  const addStockMovement = (movement: Omit<StockMovement, 'id'>): void => {
    const newMovement: StockMovement = {
      ...movement,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };
    setStockMovements(prev => [newMovement, ...prev]);
  };

  const addInvoice = (invoice: Omit<Invoice, 'id'>): void => {
    const newInvoice: Invoice = {
      ...invoice,
      id: Date.now(),
      date: new Date().toISOString(),
    };
    setInvoices(prev => [newInvoice, ...prev]);
  };

  // implementação addBOM — adiciona uma nova BOM no estado
  const addBOM = (bom: BOM): void => {
    setBoms(prev => [...prev, bom]);
  };

  return (
    <AppContext.Provider
      value={{
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
        addBOM,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};