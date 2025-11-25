import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { toast } from 'sonner';
import { ClipboardList, AlertCircle, Plus, Trash2, Package } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { Product } from '../models';

interface BOMItem {
  materialId: number;
  quantity: number;
}

interface BOM {
  id: number;
  productId: number;
  materials: BOMItem[];
}

export const BOMRegister: React.FC = () => {
  const { products, boms, addBOM } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedProductId, setSelectedProductId] = useState(0);
  const [materials, setMaterials] = useState<BOMItem[]>([
    { materialId: 0, quantity: 0 }
  ]);

  // Filtra produtos acabados e matérias-primas
  const finishedProducts = products.filter((p: Product) => p.type === 'PA');
  const rawMaterials = products.filter((p: Product) => p.type === 'MP');

  const handleAddMaterial = () => {
    setMaterials([...materials, { materialId: 0, quantity: 0 }]);
  };

  const handleRemoveMaterial = (index: number) => {
    if (materials.length > 1) {
      setMaterials(materials.filter((_, i) => i !== index));
    }
  };

  const handleMaterialChange = (index: number, field: 'materialId' | 'quantity', value: string | number) => {
    const updated = [...materials];
    updated[index] = { ...updated[index], [field]: field === 'materialId' ? parseInt(value as string) : value };
    setMaterials(updated);
    setError(null);
  };

  const validateForm = (): string | null => {
    if (!selectedProductId) return 'Selecione um produto acabado';
    
    // Verifica se já existe BOM para este produto
    const bomExists = boms.some((b: any) => b.productId === selectedProductId);
    if (bomExists) return 'Já existe uma receita cadastrada para este produto';
    
    // Valida materiais
    if (materials.length === 0) return 'Adicione pelo menos um material';
    
    for (let i = 0; i < materials.length; i++) {
      const mat = materials[i];
      if (!mat.materialId) return `Material ${i + 1}: Selecione uma matéria-prima`;
      if (mat.quantity <= 0) return `Material ${i + 1}: Quantidade deve ser maior que zero`;
    }
    
    // Verifica materiais duplicados
    const materialIds = materials.map(m => m.materialId);
    const hasDuplicates = materialIds.some((id, index) => materialIds.indexOf(id) !== index);
    if (hasDuplicates) return 'Não é possível adicionar o mesmo material mais de uma vez';
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      // Simula delay de API
      await new Promise(resolve => setTimeout(resolve, 500));

      const newBOM = {
        productId: selectedProductId,
        materials: materials.map(m => ({
          materialId: m.materialId,
          quantity: Number(m.quantity)
        }))
      };

      await addBOM(newBOM as any);

      const product = products.find((p: Product) => p.id === selectedProductId);
      toast.success('Receita cadastrada com sucesso!', {
        description: `BOM para ${product?.name}`,
      });

      // Limpa o formulário
      setSelectedProductId(0);
      setMaterials([{ materialId: 0, quantity: 0 }]);
    } catch (err) {
      setError('Erro ao cadastrar receita. Tente novamente.');
      toast.error('Erro ao cadastrar receita');
    } finally {
      setLoading(false);
    }
  };

  const getProductName = (productId: number) => {
    return products.find((p: Product) => p.id === productId)?.name || 'Produto não encontrado';
  };

  const getProductUnit = (productId: number) => {
    return products.find((p: Product) => p.id === productId)?.unit || '';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {finishedProducts.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Cadastre pelo menos um Produto Acabado antes de criar uma receita.
          </AlertDescription>
        </Alert>
      )}

      {rawMaterials.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Cadastre pelo menos uma Matéria-Prima antes de criar uma receita.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="product">Produto Acabado *</Label>
        <Select
          value={selectedProductId.toString()}
          onValueChange={(value) => setSelectedProductId(parseInt(value))}
          disabled={loading || finishedProducts.length === 0}
        >
          <SelectTrigger id="product">
            <SelectValue placeholder="Selecione o produto a ser produzido" />
          </SelectTrigger>
          <SelectContent>
            {finishedProducts.map((product: Product) => (
              <SelectItem key={product.id} value={product.id.toString()}>
                {product.code} - {product.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          Produto que será fabricado com esta receita
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Matérias-Primas Necessárias *</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddMaterial}
            disabled={loading || rawMaterials.length === 0}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Material
          </Button>
        </div>

        <div className="space-y-3">
          {materials.map((material, index) => (
            <Card key={index} className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_auto] gap-4 items-end">
                <div className="space-y-2">
                  <Label htmlFor={`material-${index}`}>
                    Material {index + 1}
                  </Label>
                  <Select
                    value={material.materialId.toString()}
                    onValueChange={(value) => handleMaterialChange(index, 'materialId', value)}
                    disabled={loading}
                  >
                    <SelectTrigger id={`material-${index}`}>
                      <SelectValue placeholder="Selecione uma matéria-prima" />
                    </SelectTrigger>
                    <SelectContent>
                      {rawMaterials.map((rm: Product) => (
                        <SelectItem key={rm.id} value={rm.id.toString()}>
                          {rm.code} - {rm.name} ({rm.unit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`quantity-${index}`}>
                    Quantidade {material.materialId && `(${getProductUnit(material.materialId)})`}
                  </Label>
                  <Input
                    id={`quantity-${index}`}
                    type="number"
                    value={material.quantity || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleMaterialChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.001"
                    placeholder="0.00"
                    disabled={loading}
                  />
                </div>

                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => handleRemoveMaterial(index)}
                  disabled={loading || materials.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <p className="text-sm text-muted-foreground">
          Informe a quantidade de cada material necessária para produzir 1 unidade do produto acabado
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ClipboardList className="h-4 w-4" />
          <span>{boms.length} receitas cadastradas</span>
        </div>
        
        <Button 
          type="submit" 
          disabled={loading || finishedProducts.length === 0 || rawMaterials.length === 0}
          className="min-w-32"
        >
          {loading ? (
            <LoadingSpinner size="sm" />
          ) : (
            'Cadastrar Receita'
          )}
        </Button>
      </div>
    </form>
  );
};
