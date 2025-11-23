import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Plus, Users, Settings, Database, Shield, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    role: 'operador' as 'admin' | 'gestor' | 'operador',
    active: true,
  });

  const [systemConfig, setSystemConfig] = useState({
    autoBackup: true,
    alertLowStock: true,
    emailNotifications: true,
    conveyorTimeout: 30,
    maxProductionOrders: 100,
    sessionTimeout: 480, // minutes
  });

  // Mock users data
  const [users, setUsers] = useState([
    { id: '1', name: 'Admin User', email: 'admin@sistema.com', role: 'admin' as const, active: true, lastLogin: new Date('2025-10-03T08:00:00') },
    { id: '2', name: 'Gestor Silva', email: 'gestor@sistema.com', role: 'gestor' as const, active: true, lastLogin: new Date('2025-10-03T09:30:00') },
    { id: '3', name: 'Operador João', email: 'operador@sistema.com', role: 'operador' as const, active: true, lastLogin: new Date('2025-10-03T10:15:00') },
    { id: '4', name: 'Maria Santos', email: 'maria@sistema.com', role: 'operador' as const, active: false, lastLogin: new Date('2025-10-01T16:00:00') },
  ]);

  // Mock suppliers and customers
  const [suppliers] = useState([
    { id: '1', name: 'Aços Industriais Ltda', cnpj: '12.345.678/0001-90', contact: 'vendas@acos.com.br' },
    { id: '2', name: 'Parafusos & Fixadores SA', cnpj: '98.765.432/0001-10', contact: 'comercial@parafusos.com.br' },
  ]);

  const [customers] = useState([
    { id: '1', name: 'Indústria Metalúrgica XYZ', cnpj: '11.222.333/0001-44', contact: 'compras@xyz.com.br' },
    { id: '2', name: 'Construtora ABC Ltda', cnpj: '44.555.666/0001-77', contact: 'suprimentos@abc.com.br' },
  ]);

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
      setUsers(prev => prev.map(u => u.id === editingUser 
        ? { ...u, ...userFormData }
        : u
      ));
      toast.success('Usuário atualizado com sucesso!');
    } else {
      const newUser = {
        id: Date.now().toString(),
        ...userFormData,
        lastLogin: new Date(),
      };
      setUsers(prev => [...prev, newUser]);
      toast.success('Usuário criado com sucesso!');
    }
    
    setIsUserDialogOpen(false);
    setEditingUser(null);
    setUserFormData({ name: '', email: '', role: 'operador', active: true });
  };

  const handleEditUser = (userId: string) => {
    const userToEdit = users.find(u => u.id === userId);
    if (userToEdit) {
      setUserFormData({
        name: userToEdit.name,
        email: userToEdit.email,
        role: userToEdit.role,
        active: userToEdit.active,
      });
      setEditingUser(userId);
      setIsUserDialogOpen(true);
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === user?.id) {
      toast.error('Você não pode deletar sua própria conta!');
      return;
    }
    setUsers(prev => prev.filter(u => u.id !== userId));
    toast.success('Usuário removido com sucesso!');
  };

  const handleConfigChange = (key: string, value: any) => {
    setSystemConfig(prev => ({ ...prev, [key]: value }));
    toast.success('Configuração atualizada!');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'gestor': return 'default';
      case 'operador': return 'secondary';
      default: return 'secondary';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'gestor': return 'Gestor';
      case 'operador': return 'Operador';
      default: return role;
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl text-gray-600">Acesso Restrito</h2>
          <p className="text-gray-500">Apenas administradores podem acessar esta área.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Administração</h1>
        <p className="text-gray-600">Configurações do sistema e gerenciamento de usuários</p>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
          <TabsTrigger value="suppliers">Fornecedores</TabsTrigger>
          <TabsTrigger value="customers">Clientes</TabsTrigger>
        </TabsList>

        {/* Users Management */}
        <TabsContent value="users" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl">Gerenciamento de Usuários</h2>
            <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingUser(null);
                  setUserFormData({ name: '', email: '', role: 'operador', active: true });
                }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Usuário
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
                  <DialogDescription>
                    {editingUser ? 'Edite as informações do usuário' : 'Adicione um novo usuário ao sistema'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUserSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      value={userFormData.name}
                      onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                      placeholder="Nome completo"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userFormData.email}
                      onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                      placeholder="email@empresa.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Função</Label>
                    <Select value={userFormData.role} onValueChange={(value: 'admin' | 'gestor' | 'operador') => setUserFormData({ ...userFormData, role: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="operador">Operador</SelectItem>
                        <SelectItem value="gestor">Gestor</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={userFormData.active}
                      onCheckedChange={(checked) => setUserFormData({ ...userFormData, active: checked })}
                    />
                    <Label>Usuário ativo</Label>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsUserDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {editingUser ? 'Atualizar' : 'Criar'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Usuários do Sistema</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Último Acesso</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((userItem) => (
                    <TableRow key={userItem.id}>
                      <TableCell>{userItem.name}</TableCell>
                      <TableCell>{userItem.email}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleColor(userItem.role) as any}>
                          {getRoleLabel(userItem.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={userItem.active ? 'default' : 'secondary'}>
                          {userItem.active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {userItem.lastLogin.toLocaleDateString('pt-BR')} {userItem.lastLogin.toLocaleTimeString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditUser(userItem.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteUser(userItem.id)}
                            disabled={userItem.id === user?.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Configuration */}
        <TabsContent value="system" className="space-y-6">
          <h2 className="text-xl">Configurações do Sistema</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Configurações Gerais</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Backup Automático</Label>
                    <p className="text-sm text-gray-500">Realizar backup diário dos dados</p>
                  </div>
                  <Switch
                    checked={systemConfig.autoBackup}
                    onCheckedChange={(checked) => handleConfigChange('autoBackup', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Alertas de Estoque Baixo</Label>
                    <p className="text-sm text-gray-500">Notificar quando estoque atingir nível mínimo</p>
                  </div>
                  <Switch
                    checked={systemConfig.alertLowStock}
                    onCheckedChange={(checked) => handleConfigChange('alertLowStock', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificações por Email</Label>
                    <p className="text-sm text-gray-500">Enviar notificações importantes por email</p>
                  </div>
                  <Switch
                    checked={systemConfig.emailNotifications}
                    onCheckedChange={(checked) => handleConfigChange('emailNotifications', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Configurações Avançadas</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="conveyor-timeout">Timeout da Esteira (segundos)</Label>
                  <Input
                    id="conveyor-timeout"
                    type="number"
                    value={systemConfig.conveyorTimeout}
                    onChange={(e) => handleConfigChange('conveyorTimeout', parseInt(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="max-orders">Máx. Ordens de Produção Simultâneas</Label>
                  <Input
                    id="max-orders"
                    type="number"
                    value={systemConfig.maxProductionOrders}
                    onChange={(e) => handleConfigChange('maxProductionOrders', parseInt(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Timeout da Sessão (minutos)</Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    value={systemConfig.sessionTimeout}
                    onChange={(e) => handleConfigChange('sessionTimeout', parseInt(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Suppliers */}
        <TabsContent value="suppliers" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl">Fornecedores</h2>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Fornecedor
            </Button>
          </div>
          
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>CNPJ</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell>{supplier.name}</TableCell>
                      <TableCell className="font-mono">{supplier.cnpj}</TableCell>
                      <TableCell>{supplier.contact}</TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customers */}
        <TabsContent value="customers" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl">Clientes</h2>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Cliente
            </Button>
          </div>
          
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>CNPJ</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>{customer.name}</TableCell>
                      <TableCell className="font-mono">{customer.cnpj}</TableCell>
                      <TableCell>{customer.contact}</TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};