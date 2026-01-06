
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
} from 'lucide-react';

const navigation = [
  { name: 'Dashboards', href: '/dashboard', icon: BarChart3 },
  { name: 'Monitoria de Ligações', href: '/dashboard/monitoring', icon: Phone },
  { name: 'Análise por SDR', href: '/dashboard/sdr-analysis', icon: Users },
  { name: 'Coaching com IA', href: '/dashboard/coaching', icon: Lightbulb },
  { name: 'Roleplay', href: '/dashboard/simulator', icon: MessageSquare },
  { name: 'Melhores Práticas', href: '/dashboard/best-practices', icon: Award },
  { name: 'Tendências', href: '/dashboard/trends', icon: TrendingUp },
  { name: 'Guia/Manual', href: '/dashboard/manual', icon: BookOpen },
];

export default function DashboardNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

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
            {navigation.map((item) => {
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
          <div className="p-4 border-t border-slate-700">
            <div className="text-xs text-gray-400">
              <p className="font-medium">Dashboard DEMO</p>
              <p className="mt-1">Sistema de análise de treinamento para SDRs</p>
            </div>
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
            {navigation.map((item) => {
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
          </div>
        )}
      </div>
    </>
  );
}
