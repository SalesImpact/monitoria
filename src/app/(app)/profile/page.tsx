'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trash2, Plus, User, Mail, Briefcase } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import MeetimeAccountSelector from '@/components/meetime-account-selector';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface MeetimeAccount {
  id: string;
  meetimeUserId: number;
  createdAt: string;
  meetimeUser: {
    id: number;
    name: string | null;
    email: string | null;
    role: string | null;
    module: string | null;
    active: boolean;
  };
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [accounts, setAccounts] = useState<MeetimeAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [selectedAccounts, setSelectedAccounts] = useState<number[]>([]);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/meetime-accounts');
      
      if (!response.ok) {
        throw new Error('Erro ao buscar contas');
      }

      const data = await response.json();
      setAccounts(data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar suas contas Meetime',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccounts = async () => {
    if (selectedAccounts.length === 0) {
      toast({
        title: 'Atenção',
        description: 'Selecione pelo menos uma conta Meetime',
        variant: 'destructive',
      });
      return;
    }

    try {
      setAdding(true);

      // Adicionar cada conta selecionada
      const promises = selectedAccounts.map(meetimeUserId =>
        fetch('/api/user/meetime-accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ meetimeUserId })
        })
      );

      const results = await Promise.all(promises);
      const successCount = results.filter(r => r.ok).length;

      if (successCount > 0) {
        toast({
          title: 'Sucesso',
          description: `${successCount} conta(s) associada(s) com sucesso`,
        });
        setSelectedAccounts([]);
        await fetchAccounts();
      }

      const failedCount = results.length - successCount;
      if (failedCount > 0) {
        toast({
          title: 'Atenção',
          description: `${failedCount} conta(s) já estava(m) associada(s) ou houve erro`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error adding accounts:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao associar contas',
        variant: 'destructive',
      });
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!accountToDelete) return;

    try {
      setDeleting(true);
      const response = await fetch(`/api/user/meetime-accounts?id=${accountToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao remover conta');
      }

      toast({
        title: 'Sucesso',
        description: 'Conta Meetime removida com sucesso',
      });

      await fetchAccounts();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover a conta',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
      setAccountToDelete(null);
    }
  };

  const getDisplayName = (account: MeetimeAccount) => {
    return account.meetimeUser.name || account.meetimeUser.email || `ID: ${account.meetimeUser.id}`;
  };

  // Filtrar contas já associadas do seletor
  const alreadyAssociatedIds = accounts.map(a => Number(a.meetimeUserId));

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-brand-dark">Perfil</h1>
        <p className="text-gray-600 mt-1">
          Gerencie suas informações e contas Meetime associadas
        </p>
      </div>

      {/* Informações do Usuário */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Usuário</CardTitle>
          <CardDescription>Suas informações de perfil</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3">
            <User className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Nome</p>
              <p className="font-medium">{session?.user?.name || 'Não informado'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Mail className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{session?.user?.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Briefcase className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Função</p>
              <p className="font-medium capitalize">{session?.user?.role || 'sdr'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contas Meetime */}
      <Card>
        <CardHeader>
          <CardTitle>Contas Meetime</CardTitle>
          <CardDescription>
            Associe suas contas do Meetime para visualizar suas ligações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Adicionar novas contas */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Adicionar Contas</h3>
            <MeetimeAccountSelector
              selectedAccounts={selectedAccounts.filter(id => !alreadyAssociatedIds.includes(id))}
              onAccountsChange={setSelectedAccounts}
              disabled={adding}
            />
            {selectedAccounts.length > 0 && (
              <Button
                onClick={handleAddAccounts}
                disabled={adding}
                className="w-full"
              >
                {adding ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Associando...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Associar {selectedAccounts.length} conta(s)
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Lista de contas associadas */}
          <div className="space-y-3 mt-6">
            <h3 className="text-sm font-medium">Contas Associadas</h3>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : accounts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhuma conta Meetime associada</p>
                <p className="text-sm mt-1">
                  Associe contas para visualizar suas ligações
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{getDisplayName(account)}</p>
                      {account.meetimeUser.email && account.meetimeUser.name && (
                        <p className="text-sm text-gray-500">{account.meetimeUser.email}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        {account.meetimeUser.role && (
                          <Badge variant="outline" className="text-xs">
                            {account.meetimeUser.role}
                          </Badge>
                        )}
                        {account.meetimeUser.module && (
                          <Badge variant="outline" className="text-xs">
                            {account.meetimeUser.module}
                          </Badge>
                        )}
                        <span className="text-xs text-gray-400">
                          Associado em {new Date(account.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setAccountToDelete(account.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={!!accountToDelete} onOpenChange={() => setAccountToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Conta Meetime?</AlertDialogTitle>
            <AlertDialogDescription>
              Ao remover esta associação, você não verá mais as ligações desta conta em "Minhas Ligações".
              Esta ação pode ser revertida associando a conta novamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removendo...
                </>
              ) : (
                'Remover'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

