import React from 'react';
import { useApp } from '../contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Package,
  Factory,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

type Status = 'planejada' | 'em_producao' | 'pausada' | 'concluida' | 'cancelada';

const COLORS = ['#FE924F', '#535353', '#FFA66F', '#10B981'];

const statusColors: Record<Status, string> = {
  planejada: 'bg-info',
  em_producao: 'bg-brand-orange',
  pausada: 'bg-gray-500',
  concluida: 'bg-success',
  cancelada: 'bg-danger'
};

// runtime guard to narrow unknown/any status values to the Status union
function isStatus(value: unknown): value is Status {
  return (
    typeof value === 'string' &&
    (value === 'planejada' ||
      value === 'em_producao' ||
      value === 'pausada' ||
      value === 'concluida' ||
      value === 'cancelada')
  );
}

export const Dashboard: React.FC = () => {
  const { products, productionOrders, stockMovements } = useApp();

  // Calculate metrics
  const mpProducts = products.filter(p => p.type === 'MP');
  const paProducts = products.filter(p => p.type === 'PA');

  const lowStockProducts = products.filter(p => p.currentStock <= p.minStock);
  const activeOrders = productionOrders.filter(o => o.status === 'em_producao');
  const plannedOrders = productionOrders.filter(o => o.status === 'planejada');
  const completedOrders = productionOrders.filter(o => o.status === 'concluida');

  // Production chart data
  const productionData = productionOrders.map((order: { productId: string; quantity: number; produced: number; status: unknown }) => {
    const product = products.find(p => p.id === order.productId);
    return {
      produto: product?.name || 'Produto',
      planejado: order.quantity,
      produzido: order.produced,
      progresso: Math.round((order.produced / order.quantity) * 100)
    };
  });

  // Stock levels chart
  const stockData = products.map(product => ({
    produto: product.name,
    atual: product.currentStock,
    minimo: product.minStock,
    tipo: product.type
  }));

  // Recent movements chart
  const movementData = stockMovements.slice(0, 7).reverse().map((movement, index) => {
    const product = products.find(p => p.id === movement.productId);
    return {
      data: movement.date.toLocaleDateString('pt-BR').slice(0, 5),
      entradas: movement.type === 'entrada' ? movement.quantity : 0,
      saidas: movement.type === 'saida' ? movement.quantity : 0,
      producao: movement.type === 'producao' ? movement.quantity : 0
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Dashboard</h1>
        <p className="text-gray-600">Visão geral do sistema em tempo real</p>
      </div>

      {/* Alerts */}
      {lowStockProducts.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {lowStockProducts.length} produto(s) com estoque baixo: {lowStockProducts.map(p => p.name).join(', ')}
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Matéria-Prima</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{mpProducts.length}</div>
            <p className="text-xs text-muted-foreground">
              {mpProducts.filter(p => p.currentStock > p.minStock).length} em níveis adequados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Produtos Acabados</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{paProducts.length}</div>
            <p className="text-xs text-muted-foreground">
              {paProducts.reduce((sum, p) => sum + p.currentStock, 0)} unidades em estoque
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">OPs Ativas</CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{activeOrders.length}</div>
            <p className="text-xs text-muted-foreground">
              {plannedOrders.length} planejadas, {completedOrders.length} concluídas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Movimentações</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stockMovements.length}</div>
            <p className="text-xs text-muted-foreground">
              Total de movimentações registradas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Progresso das Ordens de Produção</CardTitle>
            <CardDescription>Planejado vs Produzido</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
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

        <Card>
          <CardHeader>
            <CardTitle>Níveis de Estoque</CardTitle>
            <CardDescription>Atual vs Mínimo</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stockData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="produto" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="minimo" fill="#ef4444" name="Mínimo" />
                <Bar dataKey="atual" fill="#10b981" name="Atual" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Production Orders Status */}
      <Card>
        <CardHeader>
          <CardTitle>Status das Ordens de Produção</CardTitle>
          <CardDescription>Situação atual das OPs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {productionOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhuma ordem de produção registrada</p>
            ) : (
              productionOrders.map((order: { id: string; productId: string; produced: number; quantity: number; status: unknown }) => {
                const product = products.find(p => p.id === order.productId);
                const progress = Math.round((order.produced / order.quantity) * 100);

                // isStatus can now narrow because order.status is unknown (not any)
                const badgeClass = isStatus(order.status) ? statusColors[order.status] : 'bg-gray-400';
                const statusLabel = isStatus(order.status) ? order.status.replace('_', ' ') : String(order.status);

                return (
                  <div key={order.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm">{product?.name}</p>
                        <p className="text-xs text-gray-500">OP: {order.id}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{order.produced}/{order.quantity}</span>
                        <Badge
                          variant="outline"
                          className={`text-white ${badgeClass}`}
                        >
                          {statusLabel}
                        </Badge>
                      </div>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Stock Movements */}
      {movementData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Movimentações Recentes</CardTitle>
            <CardDescription>Entradas, saídas e produção dos últimos dias</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={movementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="data" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="entradas" stroke="#10b981" name="Entradas" />
                <Line type="monotone" dataKey="saidas" stroke="#ef4444" name="Saídas" />
                <Line type="monotone" dataKey="producao" stroke="#3b82f6" name="Produção" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};