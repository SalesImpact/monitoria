import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import OrganizationSelector from '@/components/organization-selector';

export default async function SelectOrganizationPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/');
  }

  // Admins sempre podem ver a página de seleção
  if (session.user.selectedOrganizationId && session.user.role !== 'admin') {
    redirect('/dashboard');
  }

  return <OrganizationSelector />;
}

