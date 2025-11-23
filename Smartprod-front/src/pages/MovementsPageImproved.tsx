import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, usePagination } from '../components/common/Pagination';
import { DateRangeValidator, useDateRangeValidation } from '../utils/DateRangeValidator';
import { LoadingSpinner, LoadingOverlay, TableSkeleton, useLoading } from '../components/common/LoadingSpinner';
import { ErrorMessage, useErrorHandler } from '../utils/ErrorBoundary';
import { ArrowUp, ArrowDown, Factory, Truck, Filter, Download, Calendar, RefreshCw, Search, X } from 'lucide-react';
import { toast } from 'sonner';

export const MovementsPageImproved: React.FC = () => {
  const { stockMovements, products } = useApp();
  const { error, handleError, clearError } = useErrorHandler();
  const { isLoading, withLoading } = useLoading();

  // Filters state
  const [filters, setFilters] = useState({
    productId: '',
    type: '',
    searchTerm: '',
  });

  // Date range validation
  const {
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    isValid: isDateRangeValid,
    errors: dateErrors,
    resetToDefaults
  } = useDateRangeValidation(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    new Date().toISOString().split('T')[0],
    {
      required: false,
      maxRangeDays: 365,
      maxDate: new Date().toISOString().split('T')[0]
    }
  );

  // Filtered data with error handling
  const filteredMovements = useMemo(() => {
    try {
      if (!stockMovements || stockMovements.length === 0) {
        return [];
      }

      return stockMovements.filter(movement => {
        // Product filter
        if (filters.productId && movement.productId !== filters.productId) return false;
        
        // Type filter
        if (filters.type && movement.type !== filters.type) return false;
        
        // Date range filter (only if dates are valid)
        if (isDateRangeValid && startDate && endDate) {
          const movementDate = new Date(movement.date);
          const start = new Date(startDate);
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999); // Include the entire end date
          
          if (movementDate < start || movementDate > end) return false;
        }
        
        // Search term filter
        if (filters.searchTerm) {
          const product = products.find(p => p.id === movement.productId);
          const searchLower = filters.searchTerm.toLowerCase();
          const productName = product?.name?.toLowerCase() || '';
          const productCode = product?.code?.toLowerCase() || '';
          const notes = movement.notes?.toLowerCase() || '';
          const orderId = movement.orderId || '';
          
          if (!productName.includes(searchLower) && 
              !productCode.includes(searchLower) && 
              !notes.includes(searchLower) && 
              !orderId.includes(searchLower)) {
            return false;
          }
        }
        
        return true;
      });
    } catch (err) {
      handleError(err instanceof Error ? err : 'Erro ao filtrar movimentações');
      return [];
    }
  }, [stockMovements, products, filters, startDate, endDate, isDateRangeValid, handleError]);

  // Pagination
  const {
    paginatedData,
    paginationInfo,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
  } = usePagination(filteredMovements, 25);

  // Handlers
  const clearFilters = async () => {
    await withLoading(async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setFilters({
        productId: '',
        type: '',
        searchTerm: '',
      });
      resetToDefaults();
      toast.success('Filtros limpos com sucesso!');
    });
  };

  const refreshData = async () => {
    await withLoading(async () => {
      // Simulate API refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Dados atualizados!');
    });
  };

  const exportData = async () => {
    try {
      await withLoading(async () => {
        if (filteredMovements.length === 0) {
          throw new Error('Nenhum dado para exportar');
        }

        // Simulate export delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        const csvData = filteredMovements.map(movement => {
          const product = products.find(p => p.id === movement.productId);
          return {
            Data: movement.date.toLocaleDateString('pt-BR'),
            Hora: movement.date.toLocaleTimeString('pt-BR'),
            Produto: product?.name || '',
            Código: product?.code || '',
            Tipo: getMovementTypeLabel(movement.type),
            Quantidade: movement.quantity,
            Unidade: product?.unit || '',
            Ordem: movement.orderId || '',
            Observações: movement.notes || '',
          };
        });

        const csv = [
          Object.keys(csvData[0] || {}).join(','),
          ...csvData.map(row => Object.values(row).map(value => 
            typeof value === 'string' && value.includes(',') ? `"${value}"` : value
          ).join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `movimentacoes_${startDate}_${endDate}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        toast.success('Dados exportados com sucesso!');
      });
    } catch (err) {
      handleError(err instanceof Error ? err : 'Erro ao exportar dados');
    }
  };

  // Helper functions
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

  // Statistics
  const statistics = useMemo(() => {
    try {
      return {
        totalEntradas: filteredMovements
          .filter(m => m.type === 'entrada')
          .reduce((sum, m) => sum + m.quantity, 0),
        totalSaidas: filteredMovements
          .filter(m => m.type === 'saida')
          .reduce((sum, m) => sum + m.quantity, 0),
        totalProducao: filteredMovements
          .filter(m => m.type === 'producao')
          .reduce((sum, m) => sum + m.quantity, 0),
        totalConsumo: filteredMovements
          .filter(m => m.type === 'consumo')
          .reduce((sum, m) => sum + m.quantity, 0),
      };
    } catch (err) {
      handleError('Erro ao calcular estatísticas');
      return { totalEntradas: 0, totalSaidas: 0, totalProducao: 0, totalConsumo: 0 };
    }
  }, [filteredMovements, handleError]);

  const hasActiveFilters = filters.productId || filters.type || filters.searchTerm || startDate || endDate;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl">Movimentações de Estoque</h1>
          <p className="text-gray-600">Histórico completo de todas as movimentações do sistema</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={refreshData} variant="outline" disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button 
            onClick={exportData} 
            variant="outline" 
            disabled={isLoading || filteredMovements.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Error Display */}
      <ErrorMessage error={error} onClear={clearError} />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros</span>
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {[filters.productId, filters.type, filters.searchTerm, startDate, endDate]
                  .filter(Boolean).length} ativo(s)
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search and basic filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Produto, código, observações..."
                    value={filters.searchTerm}
                    onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                    className="pl-8"
                  />
                  {filters.searchTerm && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-6 w-6 p-0"
                      onClick={() => setFilters({ ...filters, searchTerm: '' })}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

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

              <div className="flex items-end">
                <Button variant="outline" onClick={clearFilters} className="w-full" disabled={isLoading}>
                  <X className="mr-2 h-4 w-4" />
                  Limpar Filtros
                </Button>
              </div>
            </div>

            {/* Date range filter */}
            <DateRangeValidator
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              startLabel="Data Inicial"
              endLabel="Data Final"
              maxDate={new Date().toISOString().split('T')[0]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <LoadingOverlay isLoading={isLoading} text="Carregando estatísticas...">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Entradas</CardTitle>
              <ArrowUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-green-600">{statistics.totalEntradas.toFixed(0)}</div>
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
              <div className="text-2xl text-red-600">{statistics.totalSaidas.toFixed(0)}</div>
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
              <div className="text-2xl text-blue-600">{statistics.totalProducao.toFixed(0)}</div>
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
              <div className="text-2xl text-orange-600">{statistics.totalConsumo.toFixed(0)}</div>
              <p className="text-xs text-muted-foreground">
                {filteredMovements.filter(m => m.type === 'consumo').length} movimentações
              </p>
            </CardContent>
          </Card>
        </div>
      </LoadingOverlay>

      {/* Results Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Mostrando {paginationInfo.startIndex} a {paginationInfo.endIndex} de{' '}
              {paginationInfo.totalItems} movimentações
              {hasActiveFilters && (
                <span className="text-blue-600"> (filtradas de {stockMovements.length} total)</span>
              )}
            </p>
            <p className="text-sm text-gray-600">
              Saldo líquido:{' '}
              <span className={
                statistics.totalEntradas + statistics.totalProducao > statistics.totalSaidas + statistics.totalConsumo 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }>
                {((statistics.totalEntradas + statistics.totalProducao) - 
                  (statistics.totalSaidas + statistics.totalConsumo)).toFixed(0)} unidades
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
          <LoadingOverlay isLoading={isLoading} text="Carregando movimentações...">
            {isLoading ? (
              <TableSkeleton rows={itemsPerPage} columns={7} />
            ) : (
              <>
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
                    {paginatedData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          {filteredMovements.length === 0 && stockMovements.length > 0 
                            ? 'Nenhuma movimentação encontrada com os filtros aplicados' 
                            : 'Nenhuma movimentação registrada'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedData.map((movement) => {
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
                                <div className="text-sm">{product?.name || 'Produto não encontrado'}</div>
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
                            <TableCell>{product?.unit || '-'}</TableCell>
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
                
                {paginatedData.length > 0 && (
                  <div className="mt-4">
                    <Pagination
                      currentPage={currentPage}
                      totalItems={filteredMovements.length}
                      itemsPerPage={itemsPerPage}
                      onPageChange={setCurrentPage}
                      onItemsPerPageChange={setItemsPerPage}
                      pageSizeOptions={[10, 25, 50, 100]}
                    />
                  </div>
                )}
              </>
            )}
          </LoadingOverlay>
        </CardContent>
      </Card>
    </div>
  );
};