
'use client';

import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Award, TrendingDown } from 'lucide-react';

interface SDR {
  id: string;
  name: string;
  email: string;
  status: string;
  calls: Array<{
    id: string;
    averageScore?: number | null;
    result: string;
    scores?: {
      aiFeedback?: string | null;
    } | null;
  }>;
}

interface SDRRankingProps {
  sdrs: SDR[];
}

export default function SDRRanking({ sdrs }: SDRRankingProps) {
  // Handle empty or undefined sdrs
  if (!sdrs || !Array.isArray(sdrs) || sdrs.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500">
        <div className="text-center">
          <p className="text-sm">Nenhum dado de SDR disponível</p>
          <p className="text-xs mt-1">Aguardando dados de performance</p>
        </div>
      </div>
    );
  }

  // Calculate rankings
  const sdrStats = sdrs.map(sdr => {
    const callsWithScores = sdr.calls.filter(call => call.averageScore !== null);
    const averageScore = callsWithScores.length > 0
      ? callsWithScores.reduce((sum, call) => sum + (call.averageScore || 0), 0) / callsWithScores.length
      : 0;
    
    const isSuccessfulCall = (result: string | null | undefined): boolean => {
      if (!result) return false;
      const normalized = result.toLowerCase().trim().replace(/_/g, ' ');
      return normalized === 'agendado' || normalized === 'qualificação sucesso';
    };
    
    const totalCalls = sdr.calls.length;
    const successfulCalls = sdr.calls.filter(call => 
      isSuccessfulCall(call.result)
    ).length;
    const conversionRate = totalCalls > 0 ? (successfulCalls / totalCalls) * 100 : 0;

    return {
      ...sdr,
      averageScore,
      totalCalls,
      successfulCalls,
      conversionRate,
      // Combined performance score (average of score and conversion rate normalized)
      performanceScore: (averageScore / 5) * 50 + (conversionRate / 100) * 50
    };
  });

  // Sort by performance score
  const sortedSDRs = sdrStats.sort((a, b) => b.performanceScore - a.performanceScore);
  
  // Get top 5 and bottom 5
  const topPerformers = sortedSDRs.slice(0, 5);
  const bottomPerformers = sortedSDRs.slice(-5).reverse(); // Reverse to show worst first

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (index === 1) return <Award className="w-5 h-5 text-gray-400" />;
    if (index === 2) return <Award className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 h-5 flex items-center justify-center text-xs font-bold text-gray-500">{index + 1}</span>;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const renderSDRCard = (sdr: typeof sdrStats[0], index: number, isTop: boolean) => (
    <div 
      key={sdr.id} 
      className={`flex flex-col items-center p-4 rounded-lg transition-all ${
        isTop 
          ? 'bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-md border border-green-100' 
          : 'bg-gradient-to-br from-red-50 to-orange-50 hover:shadow-md border border-red-100'
      }`}
    >
      <div className="flex items-center justify-center mb-2">
        {isTop ? getRankIcon(index) : <TrendingDown className="w-5 h-5 text-red-500" />}
      </div>
      
      <Avatar className={`h-12 w-12 mb-2 ring-2 ${isTop ? 'ring-green-200' : 'ring-red-200'}`}>
        <AvatarFallback className={`text-sm font-semibold ${isTop ? 'bg-brand-green text-brand-dark' : 'bg-red-100 text-red-700'}`}>
          {getInitials(sdr.name)}
        </AvatarFallback>
      </Avatar>
      
      <p className="text-sm font-semibold text-brand-dark text-center truncate w-full px-2">
        {sdr.name.split(' ')[0]}
      </p>
      
      <div className="text-center mt-2">
        <p className={`text-2xl font-bold ${isTop ? 'text-green-700' : 'text-red-700'}`}>
          {sdr.averageScore.toFixed(1)}
        </p>
        <p className="text-xs text-gray-500">pontos</p>
      </div>
      
      <div className="flex items-center space-x-2 mt-2">
        <Badge variant="outline" className="text-xs">
          {sdr.totalCalls} calls
        </Badge>
      </div>
      
      <p className="text-xs text-gray-500 mt-1">
        {sdr.conversionRate.toFixed(0)}% conversão
      </p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Top Performers - Horizontal Grid */}
      <div>
        <div className="flex items-center mb-4">
          <Trophy className="w-5 h-5 text-brand-green mr-2" />
          <h3 className="font-semibold text-brand-dark text-lg">Top 5 Performance</h3>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {topPerformers.map((sdr, index) => renderSDRCard(sdr, index, true))}
        </div>
      </div>

      {/* Bottom Performers - Horizontal Grid */}
      <div>
        <div className="flex items-center mb-4">
          <TrendingDown className="w-5 h-5 text-red-500 mr-2" />
          <h3 className="font-semibold text-brand-dark text-lg">Oportunidades de Melhoria</h3>
        </div>
        {bottomPerformers.length > 0 ? (
          <div className="grid grid-cols-5 gap-3">
            {bottomPerformers.map((sdr, index) => renderSDRCard(sdr, index, false))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-6 bg-gray-50 rounded-lg">
            <p className="text-sm">Todos os SDRs estão performando bem!</p>
          </div>
        )}
      </div>
    </div>
  );
}
