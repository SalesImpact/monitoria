'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Building2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Organization } from '@/lib/types';

export default function OrganizationSelector() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selecting, setSelecting] = useState<string | null>(null);
  const router = useRouter();
  const { data: session, update } = useSession();

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const response = await fetch('/api/auth/organizations');
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data);
      } else {
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar as organizações',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao buscar organizações',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = async (organizationId: string) => {
    setSelecting(organizationId);

    try {
      const response = await fetch('/api/auth/select-organization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ organizationId }),
      });

      if (response.ok) {
        await update({
          selectedOrganizationId: organizationId,
        });

        toast({
          title: 'Sucesso',
          description: 'Organização selecionada com sucesso',
        });

        router.push('/dashboard');
      } else {
        const error = await response.json();
        toast({
          title: 'Erro',
          description: error.error || 'Erro ao selecionar organização',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error selecting organization:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao selecionar organização',
        variant: 'destructive',
      });
    } finally {
      setSelecting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-green" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-dark mb-2">
            Selecionar Organização
          </h1>
          <p className="text-gray-600">
            Escolha a organização que deseja acessar
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {organizations.map((org) => (
            <Card
              key={org.id}
              className="border-0 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer"
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Building2 className="h-6 w-6 text-brand-green" />
                  <CardTitle className="text-xl">{org.name}</CardTitle>
                </div>
                <CardDescription className="text-sm">
                  {org.slug}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleSelect(org.id)}
                  disabled={selecting === org.id}
                  className="w-full bg-brand-green hover:bg-brand-green/90 text-brand-dark font-semibold"
                >
                  {selecting === org.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Selecionando...
                    </>
                  ) : (
                    'Selecionar'
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

