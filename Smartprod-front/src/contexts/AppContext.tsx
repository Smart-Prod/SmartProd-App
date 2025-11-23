import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import type { Product, BOM, StockMovement, ProductionOrder, Invoice } from '../models/index';

export type { Product, BOM, StockMovement, ProductionOrder, Invoice };

interface AppContextType {
  products: Product[];
  boms: BOM[];
  stockMovements: StockMovement[];
  productionOrders: ProductionOrder[];
  invoices: Invoice[];
  addProduct: (product: Omit<Product, 'id'>) => Promise<Product>;
  updateProduct: (id: number, product: Partial<Product>) => Promise<void>;
  addProductionOrder: (order: Omit<ProductionOrder, 'id' | 'createdAt' | 'produced'>) => Promise<ProductionOrder>;
  updateProductionOrder: (id: number, order: Partial<ProductionOrder>) => Promise<void>;
  addStockMovement: (movement: Omit<StockMovement, 'id' | 'createdAt'>) => Promise<StockMovement>;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'date'>) => Promise<Invoice>;
  // addBOM accepts BOM without id — provider generates id
  addBOM: (bom: Omit<BOM, 'id'>) => Promise<BOM>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

// Use Vite's import.meta.env for environment variable access
const api = axios.create({
  // VITE_API_URL provided in your message, fallback to prior default if not set
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api',
  // You can add headers/interceptors here if needed
});

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [boms, setBoms] = useState<BOM[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const [productsRes, bomsRes, stockRes, ordersRes, invoicesRes] = await Promise.all([
          api.get<Product[]>('/products'),
          api.get<BOM[]>('/boms'),
          api.get<StockMovement[]>('/stock-movements'),
          api.get<ProductionOrder[]>('/production-orders'),
          api.get<Invoice[]>('/invoices'),
        ]);

        if (!mounted) return;

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
    return () => {
      mounted = false;
    };
  }, []);

  const genId = () => Date.now();

  const addProduct = useCallback(async (product: Omit<Product, 'id'>): Promise<Product> => {
    try {
      const res = await api.post<Product>('/products', product);
      setProducts(prev => [...prev, res.data]);
      return res.data;
    } catch (err) {
      console.warn('addProduct: API failed, using local fallback', err);
      const newProduct: Product = { ...product, id: genId() };
      setProducts(prev => [...prev, newProduct]);
      return newProduct;
    }
  }, []);

  const updateProduct = useCallback(async (id: number, product: Partial<Product>): Promise<void> => {
    try {
      await api.put(`/products/${id}`, product);
      setProducts(prev => prev.map(p => (p.id === id ? { ...p, ...product } : p)));
    } catch (err) {
      console.warn('updateProduct: API failed, applied local update', err);
      setProducts(prev => prev.map(p => (p.id === id ? { ...p, ...product } : p)));
    }
  }, []);

  const addProductionOrder = useCallback(async (
    order: Omit<ProductionOrder, 'id' | 'createdAt' | 'produced'>
  ): Promise<ProductionOrder> => {
    const payload = { ...order, createdAt: new Date().toISOString(), produced: 0 };
    try {
      const res = await api.post<ProductionOrder>('/production-orders', payload);
      setProductionOrders(prev => [...prev, res.data]);
      return res.data;
    } catch (err) {
      console.warn('addProductionOrder: API failed, using local fallback', err);
      const newOrder: ProductionOrder = { ...payload, id: genId() };
      setProductionOrders(prev => [...prev, newOrder]);
      return newOrder;
    }
  }, []);

  const updateProductionOrder = useCallback(async (id: number, order: Partial<ProductionOrder>): Promise<void> => {
    try {
      await api.put(`/production-orders/${id}`, order);
      setProductionOrders(prev => prev.map(o => (o.id === id ? { ...o, ...order } : o)));
    } catch (err) {
      console.warn('updateProductionOrder: API failed, applied local update', err);
      setProductionOrders(prev => prev.map(o => (o.id === id ? { ...o, ...order } : o)));
    }
  }, []);

  const addStockMovement = useCallback(async (movement: Omit<StockMovement, 'id' | 'createdAt'>): Promise<StockMovement> => {
    const payload = { ...movement, createdAt: new Date().toISOString() };
    try {
      const res = await api.post<StockMovement>('/stock-movements', payload);
      setStockMovements(prev => [res.data, ...prev]);
      return res.data;
    } catch (err) {
      console.warn('addStockMovement: API failed, using local fallback', err);
      const newMovement: StockMovement = { ...payload, id: genId() };
      setStockMovements(prev => [newMovement, ...prev]);
      return newMovement;
    }
  }, []);

  const addInvoice = useCallback(async (invoice: Omit<Invoice, 'id' | 'date'>): Promise<Invoice> => {
    const payload = { ...invoice, date: new Date().toISOString() };
    try {
      const res = await api.post<Invoice>('/invoices', payload);
      setInvoices(prev => [res.data, ...prev]);
      return res.data;
    } catch (err) {
      console.warn('addInvoice: API failed, using local fallback', err);
      const newInvoice: Invoice = { ...payload, id: genId() };
      setInvoices(prev => [newInvoice, ...prev]);
      return newInvoice;
    }
  }, []);

  const addBOM = useCallback(async (bom: Omit<BOM, 'id'>): Promise<BOM> => {
    try {
      const res = await api.post<BOM>('/boms', bom);
      setBoms(prev => [...prev, res.data]);
      return res.data;
    } catch (err) {
      console.warn('addBOM: API failed, using local fallback', err);
      const newBOM: BOM = { ...bom, id: genId() };
      setBoms(prev => [...prev, newBOM]);
      return newBOM;
    }
  }, []);

  const value = useMemo(() => ({
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
  }), [
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
  ]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};