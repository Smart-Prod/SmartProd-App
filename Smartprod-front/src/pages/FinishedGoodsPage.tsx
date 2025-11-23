import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, Truck, AlertTriangle, TrendingUp, ArrowDown, Factory } from 'lucide-react';
import { toast } from 'sonner';

export const FinishedGoodsPage: React.FC = () => {
  const { products, addStockMovement, updateProduct, stockMovements, productionOrders } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    quantity: 0,
    notes: '',
    customer: '',
  });

  const finishedGoods = products.filter(p => p.type === 'PA');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const product = finishedGoods.find(p => p.id === formData.productId);
    if (!product) return;

    const available = product.currentStock - product.reservedStock;
    if (formData.quantity > available) {
      toast.error('Quantidade insuficiente em estoque!');
      return;
    }

    // Update stock (saída)
    updateProduct(formData.productId, { 
      currentStock: product.currentStock - formData.quantity 
    });

    // Add movement record
    addStockMovement({
      productId: formData.productId,
      type: 'saida',
      quantity: formData.quantity,
      date: new Date(),
      notes: formData.notes || `Expedição para ${formData.customer || 'cliente'}`
    });

    toast.success('Expedição registrada com sucesso!');
    setIsDialogOpen(false);
    setFormData({ productId: '', quantity: 0, notes: '', customer: '' });
  };

  const getStockStatus = (product: any) => {
    const available = product.currentStock - product.reservedStock;
    if (available <= 0) {
      return { label: 'Sem Estoque', variant: 'destructive' as const };
    }
    if (product.currentStock <= product.minStock) {
      return { label: 'Baixo', variant: 'destructive' as const };
    }
    if (product.currentStock <= product.minStock * 1.5) {
      return { label: 'Atenção', variant: 'secondary' as const };
    }
    return { label: 'Adequado', variant: 'default' as const };
  };

  const getProductionInfo = (productId: string) => {
    const orders = productionOrders.filter(o => o.productId === productId);
    const inProduction = orders.filter(o => o.status === 'em_producao').reduce((sum, o) => sum + (o.quantity - o.produced), 0);
    const planned = orders.filter(o => o.status === 'planejada').reduce((sum, o) => sum + o.quantity, 0);
    
    return { inProduction, planned };
  };

  const getRecentShipments = (productId: string) => {
    return stockMovements
      .filter(m => m.productId === productId && m.type === 'saida')
      .slice(0, 3);
  };

  const totalStock = finishedGoods.reduce((sum, p) => sum + p.currentStock, 0);
  const totalAvailable = finishedGoods.reduce((sum, p) => sum + (p.currentStock - p.reservedStock), 0);
  const lowStockCount = finishedGoods.filter(p => p.currentStock <= p.minStock).length;
  const totalProduced = productionOrders
    .filter(o => o.status === 'concluida')
    .reduce((sum, o) => sum + o.produced, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl">Produtos Acabados</h1>
          <p className="text-gray-600">Controle de estoque e expedição de produtos acabados</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Truck className="mr-2 h-4 w-4" />
              Nova Expedição
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Nova Expedição</DialogTitle>
              <DialogDescription>
                Registre a saída de produtos acabados
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product">Produto</Label>
                <select
                  id="product"
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="">Selecione um produto</option>
                  {finishedGoods.map((product) => {
                    const available = product.currentStock - product.reservedStock;
                    return (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.code}) - Disponível: {available} {product.unit}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer">Cliente</Label>
                <Input
                  id="customer"
                  value={formData.customer}
                  onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                  placeholder="Nome do cliente"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantidade</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                  required
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Nota fiscal, transportadora, etc."
                />
              </div>
              {formData.productId && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  {(() => {
                    const product = finishedGoods.find(p => p.id === formData.productId);
                    if (!product) return null;
                    const available = product.currentStock - product.reservedStock;
                    const production = getProductionInfo(product.id);
                    return (
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Estoque atual:</span>
                          <span>{product.currentStock} {product.unit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Reservado:</span>
                          <span>{product.reservedStock} {product.unit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Disponível:</span>
                          <span className={available <= 0 ? 'text-red-600' : 'text-green-600'}>
                            {available} {product.unit}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Em produção:</span>
                          <span className="text-blue-600">{production.inProduction} {product.unit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Planejado:</span>
                          <span className="text-gray-600">{production.planned} {product.unit}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Registrar Expedição
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total em Estoque</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{totalStock}</div>
            <p className="text-xs text-muted-foreground">Unidades em estoque</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Disponível</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">{totalAvailable}</div>
            <p className="text-xs text-muted-foreground">Unidades disponíveis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-red-600">{lowStockCount}</div>
            <p className="text-xs text-muted-foreground">Produtos abaixo do mínimo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Produzido</CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{totalProduced}</div>
            <p className="text-xs text-muted-foreground">Total produzido</p>
          </CardContent>
        </Card>
      </div>

      {/* Finished Goods Table */}
      <Card>
        <CardHeader>
          <CardTitle>Estoque de Produtos Acabados</CardTitle>
          <CardDescription>
            Controle detalhado do estoque e expedição de produtos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead>Reservado</TableHead>
                <TableHead>Disponível</TableHead>
                <TableHead>Em Produção</TableHead>
                <TableHead>Planejado</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Últimas Expedições</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {finishedGoods.map((product) => {
                const available = product.currentStock - product.reservedStock;
                const status = getStockStatus(product);
                const production = getProductionInfo(product.id);
                const recentShipments = getRecentShipments(product.id);
                
                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-mono">{product.code}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.unit}</TableCell>
                    <TableCell>{product.currentStock}</TableCell>
                    <TableCell className="text-yellow-600">{product.reservedStock}</TableCell>
                    <TableCell className={available <= 0 ? 'text-red-600' : 'text-green-600'}>
                      {available}
                    </TableCell>
                    <TableCell className="text-blue-600">{production.inProduction}</TableCell>
                    <TableCell className="text-gray-600">{production.planned}</TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {recentShipments.length === 0 ? (
                          <span className="text-xs text-gray-500">Nenhuma expedição</span>
                        ) : (
                          recentShipments.map((movement) => (
                            <div key={movement.id} className="text-xs flex items-center space-x-1">
                              <ArrowDown className="h-3 w-3 text-red-600" />
                              <span>
                                {movement.quantity} em {movement.date.toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};