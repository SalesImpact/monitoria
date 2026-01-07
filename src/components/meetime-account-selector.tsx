'use client';

import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface MeetimeUser {
  id: number;
  name: string | null;
  email: string | null;
  role: string | null;
  module: string | null;
}

interface MeetimeAccountSelectorProps {
  selectedAccounts: number[];
  onAccountsChange: (accountIds: number[]) => void;
  disabled?: boolean;
}

export default function MeetimeAccountSelector({
  selectedAccounts = [],
  onAccountsChange,
  disabled = false
}: MeetimeAccountSelectorProps) {
  const [open, setOpen] = useState(false);
  const [meetimeUsers, setMeetimeUsers] = useState<MeetimeUser[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Garantir que selectedAccounts é sempre um array válido
  const safeSelectedAccounts = Array.isArray(selectedAccounts) ? selectedAccounts : [];

  useEffect(() => {
    fetchMeetimeUsers();
  }, []);

  const fetchMeetimeUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/meetime-users');
      
      if (!response.ok) {
        throw new Error('Erro ao buscar usuários Meetime');
      }

      const data = await response.json();
      // Garantir que é um array válido
      setMeetimeUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching Meetime users:', error);
      setMeetimeUsers([]); // Garantir array vazio em caso de erro
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os usuários do Meetime',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAccount = (accountId: number) => {
    if (safeSelectedAccounts.includes(accountId)) {
      onAccountsChange(safeSelectedAccounts.filter(id => id !== accountId));
    } else {
      onAccountsChange([...safeSelectedAccounts, accountId]);
    }
  };

  const removeAccount = (accountId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onAccountsChange(safeSelectedAccounts.filter(id => id !== accountId));
  };

  const getSelectedUsers = () => {
    return meetimeUsers.filter(user => safeSelectedAccounts.includes(user.id));
  };

  const getDisplayName = (user: MeetimeUser) => {
    return user.name || user.email || `ID: ${user.id}`;
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled || loading}
          >
            {loading ? (
              <span className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Carregando...
              </span>
            ) : safeSelectedAccounts.length === 0 ? (
              'Selecione contas do Meetime...'
            ) : (
              `${safeSelectedAccounts.length} conta(s) selecionada(s)`
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          {loading ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Carregando usuários...
            </div>
          ) : meetimeUsers.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Nenhum usuário Meetime disponível
            </div>
          ) : (
            <Command shouldFilter={true} className="rounded-lg border shadow-md">
              <CommandInput placeholder="Buscar usuário..." />
              <CommandList>
                <CommandEmpty>Nenhum usuário encontrado.</CommandEmpty>
                <CommandGroup heading="Usuários Meetime">
                  {meetimeUsers.map((user) => {
                    // Garantir que o value sempre seja uma string válida e não vazia
                    const searchValue = [
                      user.name || '',
                      user.email || '',
                      String(user.id)
                    ].filter(Boolean).join(' ') || String(user.id);

                    return (
                      <CommandItem
                        key={user.id}
                        value={searchValue}
                        onSelect={() => toggleAccount(user.id)}
                        className="cursor-pointer"
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4 shrink-0',
                            safeSelectedAccounts.includes(user.id) ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="font-medium truncate">{getDisplayName(user)}</span>
                          {user.email && user.name && (
                            <span className="text-xs text-gray-500 truncate">{user.email}</span>
                          )}
                          {user.role && (
                            <span className="text-xs text-gray-400">
                              {user.role} {user.module && `• ${user.module}`}
                            </span>
                          )}
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          )}
        </PopoverContent>
      </Popover>

      {/* Exibir contas selecionadas */}
      {safeSelectedAccounts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {getSelectedUsers().map((user) => (
            <Badge
              key={user.id}
              variant="secondary"
              className="pl-2 pr-1 py-1"
            >
              <span className="mr-1">{getDisplayName(user)}</span>
              <button
                onClick={(e) => removeAccount(user.id, e)}
                disabled={disabled}
                className="ml-1 rounded-full hover:bg-gray-300 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

