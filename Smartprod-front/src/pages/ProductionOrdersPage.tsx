import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Plus, Play, Pause, CheckCircle, XCircle, Clock, Factory } from 'lucide-react';
import { toast } from 'sonner';

export const ProductionOrdersPage: React.FC = () => {
  const { products, productionOrders, boms, addProductionOrder, updateProductionOrder, addStockMovement, updateProduct } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [producedQuantity, setProducedQuantity] = useState(0);
  const [formData, setFormData] = useState({
    productId: '',
    quantity: 0,
  });

  const finishedProducts = products.filter(p => p.type === 'PA');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const product = products.find(p => p.id === formData.productId);
    if (!product) return;

    // Check if there's enough raw materials
    const bom = boms.find(b => b.productId === formData.productId);
    if (bom) {
      const canProduce = bom.materials.every(material => {
        const rawMaterial = products.find(p => p.id === material.materialId);
        if (!rawMaterial) return false;
        const needed = material.quantity * formData.quantity;
        return rawMaterial.currentStock - rawMaterial.reservedStock >= needed;
      });

      if (!canProduce) {
        toast.error('Estoque insuficiente de matéria-prima!');
        return;
      }

      // Reserve materials
      bom.materials.forEach(material => {
        const needed = material.quantity * formData.quantity;
        const rawMaterial = products.find(p => p.id === material.materialId);
        if (rawMaterial) {
          updateProduct(material.materialId, {
            reservedStock: rawMaterial.reservedStock + needed
          });
        }
      });
    }

    addProductionOrder({
      productId: formData.productId,
      quantity: formData.quantity,
      status: 'planejada',
    });

    toast.success('Ordem de produção criada com sucesso!');
    setIsDialogOpen(false);
    setFormData({ productId: '', quantity: 0 });
  };

  const handleOpenCompleteDialog = (orderId: string) => {
    const order = productionOrders.find(o => o.id === orderId);
    if (!order) return;
    
    setSelectedOrderId(orderId);
    // Set default to remaining quantity
    setProducedQuantity(order.quantity - order.produced);
    setIsCompleteDialogOpen(true);
  };

  const handleCompleteOrder = () => {
    if (!selectedOrderId) return;
    
    const order = productionOrders.find(o => o.id === selectedOrderId);
    if (!order) return;

    if (producedQuantity <= 0) {
      toast.error('A quantidade produzida deve ser maior que zero!');
      return;
    }

    const remainingQuantity = order.quantity - order.produced;
    if (producedQuantity > remainingQuantity) {
      toast.error(`A quantidade produzida não pode ser maior que a quantidade restante (${remainingQuantity})!`);
      return;
    }

    const newProducedTotal = order.produced + producedQuantity;
    const isFullyCompleted = newProducedTotal >= order.quantity;
    
    const updateData: any = { 
      status: isFullyCompleted ? 'concluida' : 'pausada',
      produced: newProducedTotal
    };

    if (isFullyCompleted) {
      updateData.completedAt = new Date();
    }

    // Add to finished goods stock
    const product = products.find(p => p.id === order.productId);
    if (product) {
      updateProduct(order.productId, {
        currentStock: product.currentStock + producedQuantity
      });

      const statusText = isFullyCompleted ? 'concluída' : 'pausada';
      addStockMovement({
        productId: order.productId,
        type: 'producao',
        quantity: producedQuantity,
        date: new Date(),
        orderId: order.id,
        notes: `Produção ${statusText} - OP ${order.id} (${newProducedTotal} de ${order.quantity} ${product.unit})`
      });
    }

    // Consume raw materials proportionally
    const bom = boms.find(b => b.productId === order.productId);
    if (bom) {
      bom.materials.forEach(material => {
        const consumed = material.quantity * producedQuantity;
        const rawMaterial = products.find(p => p.id === material.materialId);
        if (rawMaterial) {
          // Only release reserved stock if order is fully completed
          const reservedToRelease = isFullyCompleted ? (material.quantity * order.quantity) : 0;
          
          updateProduct(material.materialId, {
            currentStock: rawMaterial.currentStock - consumed,
            reservedStock: rawMaterial.reservedStock - reservedToRelease
          });

          addStockMovement({
            productId: material.materialId,
            type: 'consumo',
            quantity: consumed,
            date: new Date(),
            orderId: order.id,
            notes: `Consumo para produção - OP ${order.id}`
          });
        }
      });
    }

    updateProductionOrder(selectedOrderId, updateData);
    
    if (isFullyCompleted) {
      toast.success(`Ordem concluída com ${newProducedTotal} unidades produzidas!`);
    } else {
      toast.info(`Produção pausada. ${producedQuantity} unidades produzidas. Restam ${order.quantity - newProducedTotal} unidades.`);
    }
    
    setIsCompleteDialogOpen(false);
    setSelectedOrderId(null);
    setProducedQuantity(0);
  };

  const handleStatusChange = (orderId: string, newStatus: 'planejada' | 'em_producao' | 'pausada' | 'concluida' | 'cancelada') => {
    const order = productionOrders.find(o => o.id === orderId);
    if (!order) return;

    const updateData: any = { status: newStatus };

    if (newStatus === 'em_producao' && (order.status === 'planejada' || order.status === 'pausada')) {
      if (order.status === 'planejada') {
        updateData.startedAt = new Date();
      }
      updateProductionOrder(orderId, updateData);
      toast.success(`Ordem ${order.status === 'pausada' ? 'retomada' : 'iniciada'} com sucesso!`);
      return;
    }

    if (newStatus === 'cancelada') {
      // Release reserved materials
      const bom = boms.find(b => b.productId === order.productId);
      if (bom) {
        bom.materials.forEach(material => {
          const reserved = material.quantity * order.quantity;
          const rawMaterial = products.find(p => p.id === material.materialId);
          if (rawMaterial) {
            updateProduct(material.materialId, {
              reservedStock: rawMaterial.reservedStock - reserved
            });
          }
        });
      }
      updateProductionOrder(orderId, updateData);
      toast.success(`Ordem cancelada com sucesso!`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planejada': return <Clock className="h-4 w-4" />;
      case 'em_producao': return <Play className="h-4 w-4" />;
      case 'pausada': return <Pause className="h-4 w-4" />;
      case 'concluida': return <CheckCircle className="h-4 w-4" />;
      case 'cancelada': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planejada': return 'secondary';
      case 'em_producao': return 'default';
      case 'pausada': return 'outline';
      case 'concluida': return 'secondary';
      case 'cancelada': return 'destructive';
      default: return 'secondary';
    }
  };

  const getProgress = (order: any) => {
    return Math.round((order.produced / order.quantity) * 100);
  };

  const activeOrders = productionOrders.filter(o => o.status === 'em_producao');
  const plannedOrders = productionOrders.filter(o => o.status === 'planejada');
  const completedOrders = productionOrders.filter(o => o.status === 'concluida');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl">Ordens de Produção</h1>
          <p className="text-gray-600">Gerencie as ordens de produção e acompanhe o progresso</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Ordem
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Nova Ordem de Produção</DialogTitle>
              <DialogDescription>
                Crie uma nova ordem de produção para um produto acabado
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product">Produto</Label>
                <Select value={formData.productId} onValueChange={(value) => setFormData({ ...formData, productId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {finishedProducts.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} ({product.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              {formData.productId && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm mb-2">Receita (BOM)</h4>
                  {(() => {
                    const bom = boms.find(b => b.productId === formData.productId);
                    if (!bom) return <p className="text-xs text-gray-500">Nenhuma receita configurada</p>;
                    
                    return (
                      <div className="space-y-1">
                        {bom.materials.map((material) => {
                          const rawMaterial = products.find(p => p.id === material.materialId);
                          const needed = material.quantity * formData.quantity;
                          const available = rawMaterial ? rawMaterial.currentStock - rawMaterial.reservedStock : 0;
                          const sufficient = available >= needed;
                          
                          return (
                            <div key={material.materialId} className="flex justify-between text-xs">
                              <span>{rawMaterial?.name}</span>
                              <span className={sufficient ? 'text-green-600' : 'text-red-600'}>
                                {needed.toFixed(2)} {rawMaterial?.unit} 
                                {!sufficient && ' (Insuficiente)'}
                              </span>
                            </div>
                          );
                        })}
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
                  Criar Ordem
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
            <CardTitle className="text-sm">Ordens Ativas</CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{activeOrders.length}</div>
            <p className="text-xs text-muted-foreground">Em produção</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Planejadas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{plannedOrders.length}</div>
            <p className="text-xs text-muted-foreground">Aguardando início</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Concluídas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{completedOrders.length}</div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Eficiência</CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {activeOrders.length > 0 
                ? Math.round(activeOrders.reduce((sum, o) => sum + getProgress(o), 0) / activeOrders.length)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Progresso médio</p>
          </CardContent>
        </Card>
      </div>

      {/* Complete Order Dialog */}
      <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Registrar Produção</DialogTitle>
            <DialogDescription>
              Informe a quantidade produzida nesta sessão de produção
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedOrderId && (() => {
              const order = productionOrders.find(o => o.id === selectedOrderId);
              const product = products.find(p => p.id === order?.productId);
              const remainingQuantity = order ? order.quantity - order.produced : 0;
              return order ? (
                <>
                  <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ordem:</span>
                      <span className="font-mono">OP-{order.id}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Produto:</span>
                      <span>{product?.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Quantidade Planejada:</span>
                      <span>{order.quantity} {product?.unit}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Já Produzido:</span>
                      <span>{order.produced} {product?.unit}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-medium">Restante:</span>
                      <span className="font-medium text-brand-orange">{remainingQuantity} {product?.unit}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="produced-quantity">Quantidade Produzida Agora</Label>
                    <Input
                      id="produced-quantity"
                      type="number"
                      value={producedQuantity}
                      onChange={(e) => setProducedQuantity(parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      required
                      min="0.01"
                      max={remainingQuantity}
                      step="0.01"
                    />
                    <p className="text-xs text-muted-foreground">
                      Máximo: {remainingQuantity} {product?.unit}. Se produzir menos, a ordem ficará pausada para continuar depois.
                    </p>
                  </div>
                </>
              ) : null;
            })()}
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsCompleteDialogOpen(false);
                  setSelectedOrderId(null);
                  setProducedQuantity(0);
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleCompleteOrder}>
                Registrar Produção
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Ordens de Produção</CardTitle>
          <CardDescription>
            Gerencie todas as ordens de produção do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Produzido</TableHead>
                <TableHead>Progresso</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productionOrders.map((order) => {
                const product = products.find(p => p.id === order.productId);
                const progress = getProgress(order);
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono">OP-{order.id}</TableCell>
                    <TableCell>{product?.name}</TableCell>
                    <TableCell>{order.quantity} {product?.unit}</TableCell>
                    <TableCell>{order.produced} {product?.unit}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(order.status) as any} className="flex items-center space-x-1">
                        {getStatusIcon(order.status)}
                        <span>{order.status.replace('_', ' ')}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {order.createdAt.toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        {order.status === 'planejada' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(order.id, 'em_producao')}
                            title="Iniciar produção"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        {order.status === 'pausada' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(order.id, 'em_producao')}
                            title="Retomar produção"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        {order.status === 'em_producao' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenCompleteDialog(order.id)}
                            title="Registrar produção"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        {(order.status === 'planejada' || order.status === 'em_producao' || order.status === 'pausada') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(order.id, 'cancelada')}
                            title="Cancelar ordem"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
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