import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, usePagination } from '../components/common/Pagination';
import { LoadingOverlay, TableSkeleton, useLoading } from '../components/common/LoadingSpinner';
import { ErrorMessage, useErrorHandler } from '../utils/ErrorBoundary';
import { Plus, Edit, Package, AlertTriangle, Search, X, Filter } from 'lucide-react';
import { toast } from 'sonner';

export const ProductsPage: React.FC = () => {
  const { products, addProduct, updateProduct } = useApp();
  const { error, handleError, clearError } = useErrorHandler();
  const { isLoading, withLoading } = useLoading();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'MP' as 'MP' | 'PA',
    unit: '',
    currentStock: 0,
    reservedStock: 0,
    minStock: 0,
  });

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: '', // all, low, adequate
  });

  // Filtered products
  const filteredProducts = useMemo(() => {
    try {
      return products.filter(product => {
        // Search filter
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          if (!product.name.toLowerCase().includes(searchLower) && 
              !product.code.toLowerCase().includes(searchLower)) {
            return false;
          }
        }
        
        // Type filter
        if (filters.type && product.type !== filters.type) {
          return false;
        }
        
        // Status filter
        if (filters.status) {
          const isLowStock = product.currentStock <= product.minStock;
          if (filters.status === 'low' && !isLowStock) return false;
          if (filters.status === 'adequate' && isLowStock) return false;
        }
        
        return true;
      });
    } catch (err) {
      handleError(err instanceof Error ? err : 'Erro ao filtrar produtos');
      return [];
    }
  }, [products, filters, handleError]);

  // Pagination
  const {
    paginatedData,
    paginationInfo,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
  } = usePagination(filteredProducts, 25);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await withLoading(async () => {
        // Validate required fields
        if (!formData.code || !formData.name || !formData.unit) {
          throw new Error('Preencha todos os campos obrigatórios');
        }

        // Check for duplicate code
        const existingProduct = products.find(p => 
          p.code === formData.code && p.id !== editingProduct
        );
        if (existingProduct) {
          throw new Error('Já existe um produto com este código');
        }

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (editingProduct) {
          updateProduct(editingProduct, formData);
          toast.success('Produto atualizado com sucesso!');
        } else {
          addProduct(formData);
          toast.success('Produto criado com sucesso!');
        }
        
        setIsDialogOpen(false);
        setEditingProduct(null);
        setFormData({
          code: '',
          name: '',
          type: 'MP',
          unit: '',
          currentStock: 0,
          reservedStock: 0,
          minStock: 0,
        });
      });
    } catch (err) {
      handleError(err instanceof Error ? err : 'Erro ao salvar produto');
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product.id);
    setFormData({
      code: product.code,
      name: product.name,
      type: product.type,
      unit: product.unit,
      currentStock: product.currentStock,
      reservedStock: product.reservedStock,
      minStock: product.minStock,
    });
    setIsDialogOpen(true);
  };

  const handleNewProduct = () => {
    setEditingProduct(null);
    setFormData({
      code: '',
      name: '',
      type: 'MP',
      unit: '',
      currentStock: 0,
      reservedStock: 0,
      minStock: 0,
    });
    setIsDialogOpen(true);
  };

  const getStockStatus = (product: any) => {
    if (product.currentStock <= product.minStock) {
      return { label: 'Baixo', variant: 'destructive' as const };
    }
    if (product.currentStock <= product.minStock * 1.5) {
      return { label: 'Atenção', variant: 'secondary' as const };
    }
    return { label: 'Adequado', variant: 'default' as const };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl">Gestão de Produtos</h1>
          <p className="text-gray-600">Cadastro e controle de matérias-primas e produtos acabados</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewProduct}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
              <DialogDescription>
                {editingProduct ? 'Edite as informações do produto' : 'Adicione um novo produto ao sistema'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Código</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="MP001"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select value={formData.type} onValueChange={(value: 'MP' | 'PA') => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MP">Matéria-Prima</SelectItem>
                      <SelectItem value="PA">Produto Acabado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome do produto"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unidade de Medida</Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="kg, un, m²"
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentStock">Estoque Atual</Label>
                  <Input
                    id="currentStock"
                    type="number"
                    value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reservedStock">Reservado</Label>
                  <Input
                    id="reservedStock"
                    type="number"
                    value={formData.reservedStock}
                    onChange={(e) => setFormData({ ...formData, reservedStock: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minStock">Estoque Mínimo</Label>
                  <Input
                    id="minStock"
                    type="number"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isLoading}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Salvando...' : (editingProduct ? 'Atualizar' : 'Criar')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Error Display */}
      <ErrorMessage error={error} onClear={clearError} />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Nome ou código..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-8"
                />
                {filters.search && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-6 w-6 p-0"
                    onClick={() => setFilters({ ...filters, search: '' })}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={filters.type || undefined} onValueChange={(value) => setFilters({ ...filters, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MP">Matéria-Prima</SelectItem>
                  <SelectItem value="PA">Produto Acabado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status do Estoque</Label>
              <Select value={filters.status || undefined} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Estoque Baixo</SelectItem>
                  <SelectItem value="adequate">Estoque Adequado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => setFilters({ search: '', type: '', status: '' })} 
                className="w-full"
              >
                <X className="mr-2 h-4 w-4" />
                Limpar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{filteredProducts.length}</div>
            <p className="text-xs text-muted-foreground">
              {filteredProducts.filter(p => p.type === 'MP').length} MP, {filteredProducts.filter(p => p.type === 'PA').length} PA
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-red-600">
              {filteredProducts.filter(p => p.currentStock <= p.minStock).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Produtos abaixo do estoque mínimo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Valor Total Estoque</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {filteredProducts.reduce((sum, p) => sum + p.currentStock, 0).toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">
              Unidades em estoque
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos</CardTitle>
          <CardDescription>
            Gerencie todos os produtos cadastrados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoadingOverlay isLoading={isLoading} text="Carregando produtos...">
            {isLoading ? (
              <TableSkeleton rows={itemsPerPage} columns={10} />
            ) : (
              <>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    Mostrando {paginationInfo.startIndex} a {paginationInfo.endIndex} de{' '}
                    {paginationInfo.totalItems} produtos
                    {filteredProducts.length !== products.length && (
                      <span className="text-blue-600"> (filtrados de {products.length} total)</span>
                    )}
                  </p>
                </div>
                <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Estoque Atual</TableHead>
                <TableHead>Reservado</TableHead>
                <TableHead>Disponível</TableHead>
                <TableHead>Mínimo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                    {filteredProducts.length === 0 && products.length > 0 
                      ? 'Nenhum produto encontrado com os filtros aplicados' 
                      : 'Nenhum produto cadastrado'}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((product) => {
                const available = product.currentStock - product.reservedStock;
                const status = getStockStatus(product);
                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-mono">{product.code}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>
                      <Badge variant={product.type === 'MP' ? 'secondary' : 'default'}>
                        {product.type === 'MP' ? 'Matéria-Prima' : 'Produto Acabado'}
                      </Badge>
                    </TableCell>
                    <TableCell>{product.unit}</TableCell>
                    <TableCell>{product.currentStock.toLocaleString('pt-BR')}</TableCell>
                    <TableCell>{product.reservedStock.toLocaleString('pt-BR')}</TableCell>
                    <TableCell>{available.toLocaleString('pt-BR')}</TableCell>
                    <TableCell>{product.minStock.toLocaleString('pt-BR')}</TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
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
                totalItems={filteredProducts.length}
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