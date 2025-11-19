import React, { useState } from 'react';
import { useApp } from './AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Plus, Package, AlertTriangle, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export const RawMaterialsPage: React.FC = () => {
  const { products, addStockMovement, updateProduct, stockMovements } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [movementType, setMovementType] = useState<'entrada' | 'saida'>('entrada');
  const [formData, setFormData] = useState({
    productId: '',
    quantity: 0,
    notes: '',
  });

  const rawMaterials = products.filter(p => p.type === 'MP');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const product = rawMaterials.find(p => p.id === formData.productId);
    if (!product) return;

    if (movementType === 'saida' && formData.quantity > (product.currentStock - product.reservedStock)) {
      toast.error('Quantidade insuficiente em estoque!');
      return;
    }

    // Update stock
    const newStock = movementType === 'entrada' 
      ? product.currentStock + formData.quantity
      : product.currentStock - formData.quantity;

    updateProduct(formData.productId, { currentStock: newStock });

    // Add movement record
    addStockMovement({
      productId: formData.productId,
      type: movementType,
      quantity: formData.quantity,
      date: new Date(),
      notes: formData.notes || `${movementType === 'entrada' ? 'Entrada' : 'Saída'} manual`
    });

    toast.success(`${movementType === 'entrada' ? 'Entrada' : 'Saída'} registrada com sucesso!`);
    setIsDialogOpen(false);
    setFormData({ productId: '', quantity: 0, notes: '' });
  };

  const getStockStatus = (product: any) => {
    const available = product.currentStock - product.reservedStock;
    if (available <= 0) {
      return { label: 'Sem Estoque', variant: 'destructive' as const, icon: AlertTriangle };
    }
    if (product.currentStock <= product.minStock) {
      return { label: 'Baixo', variant: 'destructive' as const, icon: AlertTriangle };
    }
    if (product.currentStock <= product.minStock * 1.5) {
      return { label: 'Atenção', variant: 'secondary' as const, icon: AlertTriangle };
    }
    return { label: 'Adequado', variant: 'default' as const, icon: Package };
  };

  const getRecentMovements = (productId: string) => {
    return stockMovements
      .filter(m => m.productId === productId)
      .slice(0, 3);
  };

  const totalValue = rawMaterials.reduce((sum, p) => sum + p.currentStock, 0);
  const lowStockCount = rawMaterials.filter(p => p.currentStock <= p.minStock).length;
  const totalReserved = rawMaterials.reduce((sum, p) => sum + p.reservedStock, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl">Gestão de Matéria-Prima</h1>
          <p className="text-gray-600">Controle de estoque e movimentações de matérias-primas</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setMovementType('entrada')}>
                <ArrowUp className="mr-2 h-4 w-4" />
                Entrada
              </Button>
            </DialogTrigger>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => setMovementType('saida')}>
                <ArrowDown className="mr-2 h-4 w-4" />
                Saída
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {movementType === 'entrada' ? 'Entrada de Estoque' : 'Saída de Estoque'}
                </DialogTitle>
                <DialogDescription>
                  Registre uma {movementType} de matéria-prima
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="product">Matéria-Prima</Label>
                  <select
                    id="product"
                    value={formData.productId}
                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">Selecione uma matéria-prima</option>
                    {rawMaterials.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.code}) - Disponível: {(product.currentStock - product.reservedStock).toFixed(2)} {product.unit}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantidade</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.01"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    required
                    min="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Fornecedor, lote, etc."
                  />
                </div>
                {formData.productId && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    {(() => {
                      const product = rawMaterials.find(p => p.id === formData.productId);
                      if (!product) return null;
                      const available = product.currentStock - product.reservedStock;
                      return (
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Estoque atual:</span>
                            <span>{product.currentStock.toFixed(2)} {product.unit}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Reservado:</span>
                            <span>{product.reservedStock.toFixed(2)} {product.unit}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Disponível:</span>
                            <span className={available <= 0 ? 'text-red-600' : 'text-green-600'}>
                              {available.toFixed(2)} {product.unit}
                            </span>
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
                    Registrar {movementType === 'entrada' ? 'Entrada' : 'Saída'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total de Itens</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{rawMaterials.length}</div>
            <p className="text-xs text-muted-foreground">Tipos de matéria-prima</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-red-600">{lowStockCount}</div>
            <p className="text-xs text-muted-foreground">Itens abaixo do mínimo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Estoque Reservado</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{totalReserved.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">Unidades reservadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Estoque</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{totalValue.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">Unidades em estoque</p>
          </CardContent>
        </Card>
      </div>

      {/* Raw Materials Table */}
      <Card>
        <CardHeader>
          <CardTitle>Estoque de Matérias-Primas</CardTitle>
          <CardDescription>
            Controle detalhado do estoque de matérias-primas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Estoque Atual</TableHead>
                <TableHead>Reservado</TableHead>
                <TableHead>Disponível</TableHead>
                <TableHead>Mínimo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Últimas Movimentações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rawMaterials.map((product) => {
                const available = product.currentStock - product.reservedStock;
                const status = getStockStatus(product);
                const recentMovements = getRecentMovements(product.id);
                
                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-mono">{product.code}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.unit}</TableCell>
                    <TableCell>{product.currentStock.toLocaleString('pt-BR')}</TableCell>
                    <TableCell className="text-yellow-600">
                      {product.reservedStock.toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell className={available <= 0 ? 'text-red-600' : 'text-green-600'}>
                      {available.toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell>{product.minStock.toLocaleString('pt-BR')}</TableCell>
                    <TableCell>
                      <Badge variant={status.variant} className="flex items-center space-x-1">
                        <status.icon className="h-3 w-3" />
                        <span>{status.label}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {recentMovements.length === 0 ? (
                          <span className="text-xs text-gray-500">Nenhuma movimentação</span>
                        ) : (
                          recentMovements.map((movement) => (
                            <div key={movement.id} className="text-xs flex items-center space-x-1">
                              {movement.type === 'entrada' ? (
                                <ArrowUp className="h-3 w-3 text-green-600" />
                              ) : (
                                <ArrowDown className="h-3 w-3 text-red-600" />
                              )}
                              <span>
                                {movement.quantity.toFixed(2)} em {movement.date.toLocaleDateString('pt-BR')}
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