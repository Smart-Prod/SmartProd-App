import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, Check, X, AlertCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';
import { InvoiceType } from '../models';

export const InvoicesPage: React.FC = () => {
  const { invoices, products, addInvoice, addStockMovement, updateProduct } = useApp();
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [invoiceType, setInvoiceType] = useState<InvoiceType>('ENTRADA');
  const [formData, setFormData] = useState({
    number: '',
    supplier: '',
    customer: '',
    items: [{ productId: 0, quantity: 0, value: 0 }],
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.xml')) {
      // Simulate XML parsing
      setTimeout(() => {
        const mockInvoice = {
          usuarioId: parseInt(user?.id || '1'),
          usuario: user as any,
          type: invoiceType,
          number: `NF-${Date.now()}`,
          supplier: invoiceType === 'ENTRADA' ? 'Fornecedor Simulado' : undefined,
          customer: invoiceType === 'SAIDA' ? 'Cliente Simulado' : undefined,
          items: [
            { productId: products[0]?.id || 0, quantity: 10, value: 100.00 },
            { productId: products[1]?.id || 0, quantity: 5, value: 50.00 },
          ] as any,
          status: 'PROCESSADA' as const,
        };
        
        addInvoice(mockInvoice);
        
        // Process stock movements
        mockInvoice.items.forEach((item: { productId: number; quantity: number; value: number }) => {
          const product = products.find(p => p.id === item.productId);
          if (product) {
            if (invoiceType === 'ENTRADA') {
              updateProduct(item.productId, {
                currentStock: product.currentStock + item.quantity
              });
            } else {
              updateProduct(item.productId, {
                currentStock: product.currentStock - item.quantity
              });
            }
            
            addStockMovement({
              productId: item.productId,
              type: invoiceType,
              quantity: item.quantity,
              product: product
            });
          }
        });
        
        toast.success('Nota fiscal processada com sucesso!');
      }, 2000);
    } else {
      toast.error('Por favor, selecione um arquivo XML válido');
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const invoice = {
      usuarioId: parseInt(user?.id || '1'),
      usuario: user as any,
      type: invoiceType,
      number: formData.number,
      supplier: invoiceType === 'ENTRADA' ? formData.supplier : undefined,
      customer: invoiceType === 'SAIDA' ? formData.customer : undefined,
      items: formData.items.filter(item => item.productId && item.quantity > 0) as any,
      status: 'PROCESSADA' as const,
    };
    
    if (invoice.items.length === 0) {
      toast.error('Adicione pelo menos um item à nota fiscal');
      return;
    }
    
    addInvoice(invoice);
    
    // Process stock movements
    invoice.items.forEach((item: { productId: number; quantity: number; value: number }) => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        if (invoiceType === 'ENTRADA') {
          updateProduct(item.productId, {
            currentStock: product.currentStock + item.quantity
          });
        } else {
          updateProduct(item.productId, {
            currentStock: product.currentStock - item.quantity
          });
        }
        
        addStockMovement({
          productId: item.productId,
          type: invoiceType,
          quantity: item.quantity,
          product: product
        });
      }
    });
    
    toast.success('Nota fiscal criada com sucesso!');
    setIsDialogOpen(false);
    setFormData({
      number: '',
      supplier: '',
      customer: '',
      items: [{ productId: 0, quantity: 0, value: 0 }],
    });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: 0, quantity: 0, value: 0 }]
    });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const entryInvoices = invoices.filter(inv => inv.type === 'ENTRADA');
  const exitInvoices = invoices.filter(inv => inv.type === 'SAIDA');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PROCESSADA': return <Check className="h-4 w-4 text-green-600" />;
      case 'PENDENTE': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'ERRO': return <X className="h-4 w-4 text-red-600" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const totalEntryValue = entryInvoices.reduce((sum, inv) => 
    sum + inv.items.reduce((itemSum, item) => itemSum + (item.quantity * item.value), 0), 0
  );
  
  const totalExitValue = exitInvoices.reduce((sum, inv) => 
    sum + inv.items.reduce((itemSum, item) => itemSum + (item.quantity * item.value), 0), 0
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl">Notas Fiscais</h1>
          <p className="text-gray-600">Importação e processamento de notas fiscais XML</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <FileText className="mr-2 h-4 w-4" />
              Nova Nota
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Nova Nota Fiscal</DialogTitle>
              <DialogDescription>
                Crie uma nota fiscal manualmente ou importe um arquivo XML
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="xml" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="xml">Importar XML</TabsTrigger>
                <TabsTrigger value="manual">Criar Manual</TabsTrigger>
              </TabsList>
              
              <TabsContent value="xml" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tipo de Nota</Label>
                    <div className="flex space-x-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          value="ENTRADA"
                          checked={invoiceType === 'ENTRADA'}
                          onChange={(e) => setInvoiceType(e.target.value as InvoiceType)}
                        />
                        <span>Nota de Entrada</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          value="SAIDA"
                          checked={invoiceType === 'SAIDA'}
                          onChange={(e) => setInvoiceType(e.target.value as InvoiceType)}
                        />
                        <span>Nota de Saída</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <div className="space-y-2">
                      <p>Arraste o arquivo XML aqui ou clique para selecionar</p>
                      <Input
                        type="file"
                        accept=".xml"
                        onChange={handleFileUpload}
                        className="max-w-xs mx-auto"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="manual" className="space-y-4">
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tipo de Nota</Label>
                      <select
                        value={invoiceType}
                        onChange={(e) => setInvoiceType(e.target.value as InvoiceType)}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="ENTRADA">Nota de Entrada</option>
                        <option value="SAIDA">Nota de Saída</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="number">Número da Nota</Label>
                      <Input
                        id="number"
                        value={formData.number}
                        onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                        placeholder="123456"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company">
                      {invoiceType === 'ENTRADA' ? 'Fornecedor' : 'Cliente'}
                    </Label>
                    <Input
                      id="company"
                      value={invoiceType === 'ENTRADA' ? formData.supplier : formData.customer}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        [invoiceType === 'ENTRADA' ? 'supplier' : 'customer']: e.target.value 
                      })}
                      placeholder={`Nome do ${invoiceType === 'ENTRADA' ? 'fornecedor' : 'cliente'}`}
                      required
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label>Itens da Nota</Label>
                      <Button type="button" onClick={addItem} variant="outline" size="sm">
                        Adicionar Item
                      </Button>
                    </div>
                    
                    {formData.items.map((item, index) => (
                      <div key={index} className="grid grid-cols-4 gap-2 items-end">
                        <div className="space-y-1">
                          <Label className="text-xs">Produto</Label>
                          <select
                            value={item.productId || ''}
                            onChange={(e) => updateItem(index, 'productId', parseInt(e.target.value) || 0)}
                            className="w-full p-2 border rounded-md text-sm"
                            required
                          >
                            <option value="">Selecione</option>
                            {products.map((product) => (
                              <option key={product.id} value={product.id}>
                                {product.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Quantidade</Label>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            className="text-sm"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Valor Unit.</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.value}
                            onChange={(e) => updateItem(index, 'value', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            className="text-sm"
                            required
                          />
                        </div>
                        <Button 
                          type="button" 
                          onClick={() => removeItem(index)}
                          variant="outline" 
                          size="sm"
                          disabled={formData.items.length === 1}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      Criar Nota
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Notas de Entrada</CardTitle>
            <ArrowUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{entryInvoices.length}</div>
            <p className="text-xs text-muted-foreground">
              R$ {totalEntryValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Notas de Saída</CardTitle>
            <ArrowDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{exitInvoices.length}</div>
            <p className="text-xs text-muted-foreground">
              R$ {totalExitValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Processadas</CardTitle>
            <Check className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {invoices.filter(inv => inv.status === 'PROCESSADA').length}
            </div>
            <p className="text-xs text-muted-foreground">Notas processadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Pendentes</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {invoices.filter(inv => inv.status === 'PENDENTE').length}
            </div>
            <p className="text-xs text-muted-foreground">Aguardando processamento</p>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Notas Fiscais</CardTitle>
          <CardDescription>
            Todas as notas fiscais importadas e criadas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Itens</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => {
                const totalValue = invoice.items.reduce((sum, item) => sum + (item.quantity * item.value), 0);
                return (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-mono">{invoice.number}</TableCell>
                    <TableCell>
                      <Badge variant={invoice.type === 'ENTRADA' ? 'default' : 'secondary'}>
                        {invoice.type === 'ENTRADA' ? (
                          <><ArrowUp className="h-3 w-3 mr-1" />Entrada</>
                        ) : (
                          <><ArrowDown className="h-3 w-3 mr-1" />Saída</>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(invoice.date).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{invoice.supplier || invoice.customer}</TableCell>
                    <TableCell>{invoice.items.length} itens</TableCell>
                    <TableCell>
                      R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(invoice.status)}
                        <span className="capitalize">{invoice.status}</span>
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