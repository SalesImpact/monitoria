
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Phone, CheckCircle2, Users, TrendingUp } from 'lucide-react';

interface Call {
  id: string;
  sdrName: string;
  client: string;
  prospectName: string;
  date: Date;
  duration: string;
  callType: string;
  result: string;
  averageScore?: number | null;
}

interface DashboardStatsProps {
  calls: Call[];
}

export default function DashboardStats({ calls }: DashboardStatsProps) {
  // Handle empty or undefined calls
  const safeCalls = calls || [];
  
  // Calculate various statistics
  const totalCalls = safeCalls.length;
  const averageScoreRaw = totalCalls > 0 
    ? safeCalls.reduce((sum, call) => sum + (call.averageScore || 0), 0) / totalCalls
    : 0;
  // Convert from 0-5 scale to 0-100 scale
  const averageScore = averageScoreRaw * 20;
  
  const isSuccessfulCall = (result: string | null | undefined): boolean => {
    if (!result) return false;
    const normalized = result.toLowerCase().trim().replace(/_/g, ' ');
    return normalized === 'agendado' || normalized === 'qualificação sucesso';
  };
  
  const successfulCalls = safeCalls.filter(call => 
    isSuccessfulCall(call.result)
  ).length;
  const successRate = totalCalls > 0 ? (successfulCalls / totalCalls) * 100 : 0;
  
  const uniqueSDRs = new Set(safeCalls.map(call => call.sdrName)).size;

  const stats = [
    {
      title: 'Total de Ligações',
      value: totalCalls,
      subtitle: 'Últimos 30 dias',
      icon: Phone,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Pontuação Média',
      value: `${Math.round(averageScore)}/100`,
      subtitle: 'Geral',
      icon: TrendingUp,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      title: 'Taxa de Sucesso',
      value: `${Math.round(successRate)}%`,
      subtitle: 'Média geral',
      icon: CheckCircle2,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      title: 'SDRs Ativos',
      value: uniqueSDRs,
      subtitle: 'Em treinamento',
      icon: Users,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="card-hover border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {stat.title}
                </p>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </h3>
                <p className="text-xs text-gray-500">
                  {stat.subtitle}
                </p>
              </div>
              <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${stat.iconBg} flex-shrink-0`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
