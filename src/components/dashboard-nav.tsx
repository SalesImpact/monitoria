
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  Phone,
  Menu,
  X,
  BarChart2,
  Users,
  Target,
  TrendingUp,
  BookOpen,
  Award,
  Lightbulb,
  AlertCircle,
  FileText,
  MessageSquare,
  GraduationCap,
  LogOut,
  UserCircle,
  Building2,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboards', href: '/dashboard', icon: BarChart3, adminOnly: false },
  { name: 'Monitoria de Ligações', href: '/monitoring', icon: Phone, adminOnly: false },
  { name: 'Análise por SDR', href: '/sdr-analysis', icon: Users, adminOnly: false },
  { name: 'Coaching com IA', href: '/coaching', icon: Lightbulb, adminOnly: false },
  { name: 'Roleplay', href: '/simulator', icon: MessageSquare, adminOnly: false },
  { name: 'Melhores Práticas', href: '/best-practices', icon: Award, adminOnly: false },
  { name: 'Tendências', href: '/trends', icon: TrendingUp, adminOnly: false },
  { name: 'Guia/Manual', href: '/manual', icon: BookOpen, adminOnly: false },
  { name: 'Empresas', href: '/organizations', icon: Building2, adminOnly: true },
  { name: 'Perfil', href: '/profile', icon: UserCircle, adminOnly: false },
];

export default function DashboardNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'admin';
  
  const filteredNavigation = navigation.filter(item => !item.adminOnly || isAdmin);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut({ redirect: false });
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 bg-brand-dark">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b border-slate-700">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-500 rounded-lg mr-3">
              <BarChart2 className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white">SDR Analytics</span>
              <span className="text-xs text-gray-400">Sales Impact</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                      : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-700 space-y-3">
            <div className="text-xs text-gray-400">
              <p className="font-medium">Dashboard DEMO</p>
              <p className="mt-1">Sistema de análise de treinamento para SDRs</p>
            </div>
            <Button
              onClick={handleLogout}
              disabled={isLoggingOut}
              variant="ghost"
              className="w-full justify-start text-gray-300 hover:text-white hover:bg-slate-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {isLoggingOut ? 'Saindo...' : 'Sair'}
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden bg-brand-dark border-b border-slate-700 sticky top-0 z-50">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-lg mr-2">
              <BarChart2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">SDR Analytics</span>
          </Link>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gray-300 hover:text-white hover:bg-slate-700"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="px-2 pb-3 space-y-1 bg-brand-dark border-t border-slate-700">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
            <Button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              disabled={isLoggingOut}
              variant="ghost"
              className="w-full justify-start text-gray-300 hover:text-white hover:bg-slate-700"
            >
              <LogOut className="w-5 h-5 mr-3" />
              {isLoggingOut ? 'Saindo...' : 'Sair'}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
