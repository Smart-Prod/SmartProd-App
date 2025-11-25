import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Download, Calendar, TrendingUp, Package, Factory, Truck } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { products, stockMovements, productionOrders, invoices } = useApp();
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  const filteredMovements = stockMovements.filter(
    m => new Date(m.createdAt) >= new Date(dateRange.start) && new Date(m.createdAt) <= new Date(dateRange.end)
  );

  const filteredOrders = productionOrders.filter(
    o => new Date(o.createdAt) >= new Date(dateRange.start) && new Date(o.createdAt) <= new Date(dateRange.end)
  );

  const filteredInvoices = invoices.filter(
    i => new Date(i.date) >= new Date(dateRange.start) && new Date(i.date) <= new Date(dateRange.end)
  );

  // Production Report Data
  const productionData = products
    .filter(p => p.type === 'PA')
    .map(product => {
      const orders = filteredOrders.filter(o => o.productId === product.id);
      const produced = orders.reduce((sum, o) => sum + o.produced, 0);
      const planned = orders.reduce((sum, o) => sum + o.quantity, 0);
      
      return {
        produto: product.name,
        planejado: planned,
        produzido: produced,
        eficiencia: planned > 0 ? Math.round((produced / planned) * 100) : 0,
      };
    })
    .filter(item => item.planejado > 0 || item.produzido > 0);

  // Stock Level Report Data
  const stockData = products.map(product => ({
    produto: product.name,
    codigo: product.code,
    tipo: product.type,
    atual: product.currentStock,
    minimo: product.minStock,
    disponivel: product.currentStock - product.reservedStock,
    status: product.currentStock <= product.minStock ? 'Baixo' : product.currentStock <= product.minStock * 1.5 ? 'Atenção' : 'Adequado',
  }));

  // Movement Analysis Data
  const movementData = filteredMovements.reduce((acc, movement) => {
    const date = new Date(movement.createdAt).toLocaleDateString('pt-BR');
    const existing = acc.find(item => item.data === date);
    
    if (existing) {
      existing[movement.type] = (existing[movement.type] || 0) + movement.quantity;
    } else {
      acc.push({
        data: date,
        entrada: movement.type === 'ENTRADA' ? movement.quantity : 0,
        saida: movement.type === 'SAIDA' ? movement.quantity : 0,
        producao: movement.type === 'PRODUCAO' ? movement.quantity : 0,
        consumo: movement.type === 'CONSUMO' ? movement.quantity : 0,
      });
    }
    
    return acc;
  }, [] as any[]).sort((a, b) => new Date(a.data.split('/').reverse().join('-')).getTime() - new Date(b.data.split('/').reverse().join('-')).getTime());

  // Sales/Output Report Data
  const salesData = products
    .filter(p => p.type === 'PA')
    .map(product => {
      const sales = filteredMovements
        .filter(m => m.productId === product.id && m.type === 'SAIDA')
        .reduce((sum, m) => sum + m.quantity, 0);
      
      return {
        produto: product.name,
        codigo: product.code,
        vendido: sales,
        estoque: product.currentStock,
      };
    })
    .filter(item => item.vendido > 0)
    .sort((a, b) => b.vendido - a.vendido);

  // Material Consumption Report Data
  const consumptionData = products
    .filter(p => p.type === 'MP')
    .map(product => {
      const consumed = filteredMovements
        .filter(m => m.productId === product.id && m.type === 'CONSUMO')
        .reduce((sum, m) => sum + m.quantity, 0);
      
      return {
        material: product.name,
        codigo: product.code,
        consumido: consumed,
        estoque: product.currentStock,
        unidade: product.unit,
      };
    })
    .filter(item => item.consumido > 0)
    .sort((a, b) => b.consumido - a.consumido);

  // Stock Status Distribution
  const stockStatusData = [
    { name: 'Adequado', value: stockData.filter(s => s.status === 'Adequado').length, color: '#10b981' },
    { name: 'Atenção', value: stockData.filter(s => s.status === 'Atenção').length, color: '#f59e0b' },
    { name: 'Baixo', value: stockData.filter(s => s.status === 'Baixo').length, color: '#ef4444' },
  ];

  const exportReport = (reportType: string) => {
    let data: any[] = [];
    let filename = '';

    switch (reportType) {
      case 'production':
        data = productionData;
        filename = 'relatorio_producao';
        break;
      case 'stock':
        data = stockData;
        filename = 'relatorio_estoque';
        break;
      case 'sales':
        data = salesData;
        filename = 'relatorio_vendas';
        break;
      case 'consumption':
        data = consumptionData;
        filename = 'relatorio_consumo';
        break;
      default:
        return;
    }

    const csv = [
      Object.keys(data[0] || {}).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${dateRange.start}_${dateRange.end}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Relatórios</h1>
        <p className="text-gray-600">Análises e relatórios detalhados do sistema</p>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Período de Análise</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Data Inicial</Label>
              <Input
                id="start-date"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">Data Final</Label>
              <Input
                id="end-date"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => setDateRange({
                  start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  end: new Date().toISOString().split('T')[0],
                })}
                className="w-full"
              >
                Últimos 30 dias
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="production" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="production">Produção</TabsTrigger>
          <TabsTrigger value="stock">Estoque</TabsTrigger>
          <TabsTrigger value="sales">Vendas</TabsTrigger>
          <TabsTrigger value="consumption">Consumo MP</TabsTrigger>
        </TabsList>

        {/* Production Report */}
        <TabsContent value="production" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl">Relatório de Produção</h2>
            <Button onClick={() => exportReport('production')} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Total Planejado</CardTitle>
                <Factory className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">
                  {filteredOrders.reduce((sum, o) => sum + o.quantity, 0)}
                </div>
                <p className="text-xs text-muted-foreground">Unidades planejadas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Total Produzido</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">
                  {filteredOrders.reduce((sum, o) => sum + o.produced, 0)}
                </div>
                <p className="text-xs text-muted-foreground">Unidades produzidas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Eficiência Média</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">
                  {productionData.length > 0 
                    ? Math.round(productionData.reduce((sum, p) => sum + p.eficiencia, 0) / productionData.length)
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">Produzido vs planejado</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Produção por Produto</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={productionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="produto" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="planejado" fill="#e2e8f0" name="Planejado" />
                  <Bar dataKey="produzido" fill="#3b82f6" name="Produzido" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stock Report */}
        <TabsContent value="stock" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl">Relatório de Estoque</h2>
            <Button onClick={() => exportReport('stock')} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Status do Estoque</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stockStatusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {stockStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Movimentações por Período</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={movementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="data" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="entrada" stroke="#10b981" name="Entradas" />
                    <Line type="monotone" dataKey="saida" stroke="#ef4444" name="Saídas" />
                    <Line type="monotone" dataKey="producao" stroke="#3b82f6" name="Produção" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sales Report */}
        <TabsContent value="sales" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl">Relatório de Vendas/Saídas</h2>
            <Button onClick={() => exportReport('sales')} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Produtos Mais Vendidos</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={salesData.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="produto" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="vendido" fill="#3b82f6" name="Vendido" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Material Consumption Report */}
        <TabsContent value="consumption" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl">Relatório de Consumo de Matéria-Prima</h2>
            <Button onClick={() => exportReport('consumption')} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Consumo por Material</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={consumptionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="material" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="consumido" fill="#f59e0b" name="Consumido" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};