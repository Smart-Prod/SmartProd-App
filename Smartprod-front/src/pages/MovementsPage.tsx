import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUp, ArrowDown, Factory, Truck, Filter, Download, Calendar } from 'lucide-react';

export const MovementsPage: React.FC = () => {
  const { stockMovements, products } = useApp();
  const [filters, setFilters] = useState({
    productId: '',
    type: '',
    startDate: '',
    endDate: '',
  });

  const filteredMovements = stockMovements.filter(movement => {
    if (filters.productId && movement.productId !== filters.productId) return false;
    if (filters.type && movement.type !== filters.type) return false;
    if (filters.startDate && movement.date < new Date(filters.startDate)) return false;
    if (filters.endDate && movement.date > new Date(filters.endDate)) return false;
    return true;
  });

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'entrada': return <ArrowUp className="h-4 w-4 text-green-600" />;
      case 'saida': return <ArrowDown className="h-4 w-4 text-red-600" />;
      case 'producao': return <Factory className="h-4 w-4 text-blue-600" />;
      case 'consumo': return <Truck className="h-4 w-4 text-orange-600" />;
      default: return <ArrowUp className="h-4 w-4" />;
    }
  };

  const getMovementTypeLabel = (type: string) => {
    switch (type) {
      case 'entrada': return 'Entrada';
      case 'saida': return 'Saída';
      case 'producao': return 'Produção';
      case 'consumo': return 'Consumo';
      default: return type;
    }
  };

  const getMovementTypeColor = (type: string) => {
    switch (type) {
      case 'entrada': return 'default';
      case 'saida': return 'destructive';
      case 'producao': return 'default';
      case 'consumo': return 'secondary';
      default: return 'secondary';
    }
  };

  const clearFilters = () => {
    setFilters({
      productId: '',
      type: '',
      startDate: '',
      endDate: '',
    });
  };

  const exportData = () => {
    const csvData = filteredMovements.map(movement => {
      const product = products.find(p => p.id === movement.productId);
      return {
        Data: movement.date.toLocaleDateString('pt-BR'),
        Produto: product?.name || '',
        Código: product?.code || '',
        Tipo: getMovementTypeLabel(movement.type),
        Quantidade: movement.quantity,
        Unidade: product?.unit || '',
        Observações: movement.notes || '',
      };
    });

    const csv = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `movimentacoes_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Statistics
  const totalEntradas = filteredMovements
    .filter(m => m.type === 'entrada')
    .reduce((sum, m) => sum + m.quantity, 0);
  
  const totalSaidas = filteredMovements
    .filter(m => m.type === 'saida')
    .reduce((sum, m) => sum + m.quantity, 0);
  
  const totalProducao = filteredMovements
    .filter(m => m.type === 'producao')
    .reduce((sum, m) => sum + m.quantity, 0);
  
  const totalConsumo = filteredMovements
    .filter(m => m.type === 'consumo')
    .reduce((sum, m) => sum + m.quantity, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl">Movimentações de Estoque</h1>
          <p className="text-gray-600">Histórico completo de todas as movimentações do sistema</p>
        </div>
        <Button onClick={exportData} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product-filter">Produto</Label>
              <Select value={filters.productId || undefined} onValueChange={(value) => setFilters({ ...filters, productId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os produtos" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} ({product.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type-filter">Tipo</Label>
              <Select value={filters.type || undefined} onValueChange={(value) => setFilters({ ...filters, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="saida">Saída</SelectItem>
                  <SelectItem value="producao">Produção</SelectItem>
                  <SelectItem value="consumo">Consumo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-date">Data Inicial</Label>
              <Input
                id="start-date"
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date">Data Final</Label>
              <Input
                id="end-date"
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters} className="w-full">
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Entradas</CardTitle>
            <ArrowUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">{totalEntradas.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">
              {filteredMovements.filter(m => m.type === 'entrada').length} movimentações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Saídas</CardTitle>
            <ArrowDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-red-600">{totalSaidas.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">
              {filteredMovements.filter(m => m.type === 'saida').length} movimentações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Produção</CardTitle>
            <Factory className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-blue-600">{totalProducao.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">
              {filteredMovements.filter(m => m.type === 'producao').length} movimentações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Consumo</CardTitle>
            <Truck className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-orange-600">{totalConsumo.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">
              {filteredMovements.filter(m => m.type === 'consumo').length} movimentações
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Results Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Mostrando {filteredMovements.length} de {stockMovements.length} movimentações
            </p>
            <p className="text-sm text-gray-600">
              Saldo líquido: <span className={totalEntradas + totalProducao > totalSaidas + totalConsumo ? 'text-green-600' : 'text-red-600'}>
                {((totalEntradas + totalProducao) - (totalSaidas + totalConsumo)).toFixed(0)} unidades
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Movements Table */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Movimentações</CardTitle>
          <CardDescription>
            Lista detalhada de todas as movimentações de estoque
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Ordem</TableHead>
                <TableHead>Observações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMovements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    Nenhuma movimentação encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredMovements
                  .sort((a, b) => b.date.getTime() - a.date.getTime())
                  .map((movement) => {
                    const product = products.find(p => p.id === movement.productId);
                    return (
                      <TableRow key={movement.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">{movement.date.toLocaleDateString('pt-BR')}</div>
                            <div className="text-xs text-gray-500">
                              {movement.date.toLocaleTimeString('pt-BR')}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">{product?.name}</div>
                            <div className="text-xs text-gray-500 font-mono">{product?.code}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getMovementTypeColor(movement.type) as any} className="flex items-center space-x-1 w-fit">
                            {getMovementIcon(movement.type)}
                            <span>{getMovementTypeLabel(movement.type)}</span>
                          </Badge>
                        </TableCell>
                        <TableCell className={movement.type === 'entrada' || movement.type === 'producao' ? 'text-green-600' : 'text-red-600'}>
                          {movement.type === 'entrada' || movement.type === 'producao' ? '+' : '-'}
                          {movement.quantity.toLocaleString('pt-BR')}
                        </TableCell>
                        <TableCell>{product?.unit}</TableCell>
                        <TableCell>
                          {movement.orderId ? (
                            <Badge variant="outline" className="font-mono">
                              OP-{movement.orderId}
                            </Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate text-sm" title={movement.notes}>
                            {movement.notes || '-'}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};