
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LoginForm from '@/components/login-form';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session) {
    if (session.user.selectedOrganizationId) {
      redirect('/dashboard');
    } else {
      redirect('/select-organization');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-dark mb-2">
            Sales Impact
          </h1>
          <p className="text-gray-600">Sistema de Monitoramento de SDRs</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
