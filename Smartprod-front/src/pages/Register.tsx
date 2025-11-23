import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [senhaConfirm, setSenhaConfirm] = useState('');
  const [error, setError] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const { register, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!name.trim()) {
      setError('Informe seu nome.');
      return;
    }

    if (senha !== senhaConfirm) {
      setError('As senhas não coincidem.');
      return;
    }

    try {
      // Assumimos que register devolve Promise<boolean>
      const ok = await register(name, email, senha);

      if (ok) {
        setSuccessMsg('Cadastro realizado com sucesso. Você já pode entrar.');
        setName('');
        setEmail('');
        setSenha('');
        setSenhaConfirm('');
      } else {
        // register devolve false em caso de falha — exiba mensagem genérica
        setError('Não foi possível completar o cadastro.');
      }
    } catch (err: any) {
      // Se register lançar um erro com informação da API, mostre-a
      const apiMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Erro ao registrar. Tente novamente.';
      setError(String(apiMsg));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-brand-light p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <UserPlus className="h-12 w-12 text-brand-orange" />
          </div>
          <CardTitle>Crie sua conta</CardTitle>
          <CardDescription>
            Preencha os dados para criar uma nova conta no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Sua senha"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passwordConfirm">Confirme a senha</Label>
              <Input
                id="passwordConfirm"
                type="password"
                value={senhaConfirm}
                onChange={(e) => setSenhaConfirm(e.target.value)}
                placeholder="Repita a senha"
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {successMsg && (
              <Alert variant="default">
                <AlertDescription>{successMsg}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                'Registrar'
              )}
            </Button>

            <div className="text-sm text-center">
              Já possui conta?{' '}
              <Link to="/login" className="text-brand-orange font-medium">
                Entrar
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;