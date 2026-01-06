
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, TrendingUp, AlertTriangle, Filter, Phone, Calendar, User, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Call {
  id: string;
  sdrName: string;
  client: string;
  date: Date;
  averageScore?: number | null;
  scores?: {
    saudacaoApresentacao: number;
    apresentacaoEmpresa: number;
    solicitacaoConfirmacaoNome: number;
    tomVoz: number;
    rapport: number;
    perguntasValidacao: number;
    escutaAtiva: number;
    pitchSolucao: number;
    historiaCliente: number;
    perguntasSituacao: number;
    perguntasProblema: number;
    perguntasImplicacao: number;
    perguntasNecessidadeSolucao: number;
    confirmouEntendimento: number;
    vendeuProximoPasso: number;
    agendouConcluiu: number;
  } | null;
  sdr: {
    name: string;
  };
}

interface SDR {
  id: string;
  name: string;
}

interface CriteriaAnalysisContentProps {
  calls: Call[];
  sdrs: SDR[];
}

const CRITERIA_MAP = {
  'Saudação e Apresentação': 'saudacaoApresentacao',
  'Apresentação da Empresa': 'apresentacaoEmpresa',
  'Confirmação do Nome': 'solicitacaoConfirmacaoNome',
  'Tom de Voz': 'tomVoz',
  'Rapport': 'rapport',
  'Perguntas de Validação': 'perguntasValidacao',
  'Escuta Ativa': 'escutaAtiva',
  'Pitch da Solução': 'pitchSolucao',
  'História do Cliente': 'historiaCliente',
  'Perguntas de Situação': 'perguntasSituacao',
  'Perguntas de Problema': 'perguntasProblema',
  'Perguntas de Implicação': 'perguntasImplicacao',
  'Perguntas de Necessidade': 'perguntasNecessidadeSolucao',
  'Confirmou Entendimento': 'confirmouEntendimento',
  'Vendeu Próximo Passo': 'vendeuProximoPasso',
  'Agendou/Concluiu': 'agendouConcluiu',
};

export default function CriteriaAnalysisContent({ calls, sdrs }: CriteriaAnalysisContentProps) {
  const [selectedSDRs, setSelectedSDRs] = useState<string>('all');
  const [selectedScoreRange, setSelectedScoreRange] = useState<{
    criterion: string;
    fieldName: string;
    range: 'excellent' | 'good' | 'average' | 'poor';
    rangeLabel: string;
    calls: Call[];
  } | null>(null);

  // Filter calls based on selected SDRs
  const filteredCalls = useMemo(() => {
    if (selectedSDRs === 'all') return calls;
    return calls.filter(call => call.sdrName === selectedSDRs);
  }, [calls, selectedSDRs]);

  // Calculate criteria statistics
  const criteriaStats = useMemo(() => {
    const stats = Object.entries(CRITERIA_MAP).map(([displayName, fieldName]) => {
      const scores: number[] = [];
      const callsWithScores: Call[] = [];
      
      filteredCalls.forEach((call) => {
        if (call.scores) {
          const score = (call.scores as any)[fieldName];
          if (typeof score === 'number') {
            scores.push(score);
            callsWithScores.push(call);
          }
        }
      });

      if (scores.length === 0) {
        return null;
      }

      const average = scores.reduce((sum, s) => sum + s, 0) / scores.length;
      const count = scores.length;
      
      const excellentCalls = callsWithScores.filter(call => {
        const score = (call.scores as any)?.[fieldName];
        return score >= 4.5;
      });
      const goodCalls = callsWithScores.filter(call => {
        const score = (call.scores as any)?.[fieldName];
        return score >= 3.5 && score < 4.5;
      });
      const averageCalls = callsWithScores.filter(call => {
        const score = (call.scores as any)?.[fieldName];
        return score >= 2.5 && score < 3.5;
      });
      const poorCalls = callsWithScores.filter(call => {
        const score = (call.scores as any)?.[fieldName];
        return score < 2.5;
      });

      return {
        criterion: displayName,
        fieldName,
        average,
        count,
        excellent: excellentCalls.length,
        good: goodCalls.length,
        average_count: averageCalls.length,
        poor: poorCalls.length,
        excellentCalls,
        goodCalls,
        averageCalls,
        poorCalls,
        distribution: {
          excellent: (excellentCalls.length / count) * 100,
          good: (goodCalls.length / count) * 100,
          average: (averageCalls.length / count) * 100,
          poor: (poorCalls.length / count) * 100,
        },
      };
    }).filter(Boolean).sort((a, b) => (b?.average || 0) - (a?.average || 0));

    return stats;
  }, [filteredCalls]);

  const overallAverage = criteriaStats.length > 0
    ? criteriaStats.reduce((sum, c) => sum + (c?.average || 0), 0) / criteriaStats.length
    : 0;

  const bestCriteria = criteriaStats[0];
  const worstCriteria = criteriaStats[criteriaStats.length - 1];

  const handleScoreRangeClick = (
    criterion: string,
    fieldName: string,
    range: 'excellent' | 'good' | 'average' | 'poor',
    rangeLabel: string,
    calls: Call[]
  ) => {
    if (calls.length > 0) {
      setSelectedScoreRange({ criterion, fieldName, range, rangeLabel, calls });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark">
            Análise por Critérios
          </h1>
          <p className="text-gray-600 mt-1">
            Detalhamento de performance em cada aspecto do Call Check
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-brand-dark flex items-center">
            <Filter className="w-5 h-5 mr-2 text-brand-green" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">SDR ou Grupo</label>
              <Select value={selectedSDRs} onValueChange={setSelectedSDRs}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os SDRs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os SDRs</SelectItem>
                  {sdrs.map(sdr => (
                    <SelectItem key={sdr.id} value={sdr.name}>{sdr.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Ligações Analisadas</label>
              <div className="text-3xl font-bold text-brand-dark">
                {filteredCalls.length}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Média Geral</label>
              <div className="text-3xl font-bold text-brand-dark">
                {overallAverage.toFixed(1)}/5.0
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Média Geral
            </CardTitle>
            <Target className="h-4 w-4 text-brand-green" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-brand-dark">
              {overallAverage.toFixed(1)}/5.0
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Todos os critérios
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Melhor Critério
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-brand-dark">
              {bestCriteria?.criterion || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {bestCriteria?.average.toFixed(1)}/5.0 média
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Maior Oportunidade
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-brand-dark">
              {worstCriteria?.criterion || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {worstCriteria?.average.toFixed(1)}/5.0 média
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Criteria Cards */}
      <div className="grid grid-cols-1 gap-6">
        {criteriaStats.map((stat) => stat && (
          <Card key={stat.criterion} className="card-hover">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-brand-dark">
                    {stat.criterion}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {stat.count} avaliações realizadas
                  </CardDescription>
                </div>
                <Badge
                  variant={
                    stat.average >= 4
                      ? 'default'
                      : stat.average >= 3
                      ? 'secondary'
                      : 'destructive'
                  }
                  className="text-lg px-4 py-2"
                >
                  {stat.average.toFixed(1)}/5.0
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Performance</span>
                  <span className="text-gray-900 font-medium">
                    {((stat.average / 5) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      stat.average >= 4
                        ? 'bg-green-500'
                        : stat.average >= 3
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${(stat.average / 5) * 100}%` }}
                  />
                </div>
              </div>

              {/* Distribution */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Distribuição de Pontuações (clique para ver detalhes)
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button
                    onClick={() => handleScoreRangeClick(
                      stat.criterion,
                      stat.fieldName,
                      'excellent',
                      'Excelente (4.5-5.0)',
                      stat.excellentCalls
                    )}
                    disabled={stat.excellent === 0}
                    className={`text-center p-3 bg-green-50 rounded-lg transition-all ${
                      stat.excellent > 0 ? 'hover:bg-green-100 cursor-pointer' : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <p className="text-2xl font-bold text-green-700">
                      {stat.excellent}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Excelente (4.5-5.0)
                    </p>
                    <p className="text-xs text-green-600 font-medium">
                      {stat.distribution.excellent.toFixed(0)}%
                    </p>
                  </button>
                  <button
                    onClick={() => handleScoreRangeClick(
                      stat.criterion,
                      stat.fieldName,
                      'good',
                      'Bom (3.5-4.4)',
                      stat.goodCalls
                    )}
                    disabled={stat.good === 0}
                    className={`text-center p-3 bg-blue-50 rounded-lg transition-all ${
                      stat.good > 0 ? 'hover:bg-blue-100 cursor-pointer' : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <p className="text-2xl font-bold text-blue-700">
                      {stat.good}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Bom (3.5-4.4)
                    </p>
                    <p className="text-xs text-blue-600 font-medium">
                      {stat.distribution.good.toFixed(0)}%
                    </p>
                  </button>
                  <button
                    onClick={() => handleScoreRangeClick(
                      stat.criterion,
                      stat.fieldName,
                      'average',
                      'Médio (2.5-3.4)',
                      stat.averageCalls
                    )}
                    disabled={stat.average_count === 0}
                    className={`text-center p-3 bg-yellow-50 rounded-lg transition-all ${
                      stat.average_count > 0 ? 'hover:bg-yellow-100 cursor-pointer' : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <p className="text-2xl font-bold text-yellow-700">
                      {stat.average_count}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Médio (2.5-3.4)
                    </p>
                    <p className="text-xs text-yellow-600 font-medium">
                      {stat.distribution.average.toFixed(0)}%
                    </p>
                  </button>
                  <button
                    onClick={() => handleScoreRangeClick(
                      stat.criterion,
                      stat.fieldName,
                      'poor',
                      'Abaixo (0-2.4)',
                      stat.poorCalls
                    )}
                    disabled={stat.poor === 0}
                    className={`text-center p-3 bg-red-50 rounded-lg transition-all ${
                      stat.poor > 0 ? 'hover:bg-red-100 cursor-pointer' : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <p className="text-2xl font-bold text-red-700">
                      {stat.poor}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Abaixo (0-2.4)
                    </p>
                    <p className="text-xs text-red-600 font-medium">
                      {stat.distribution.poor.toFixed(0)}%
                    </p>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal for Score Range Details */}
      <Dialog open={!!selectedScoreRange} onOpenChange={() => setSelectedScoreRange(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-brand-dark flex items-center justify-between">
              <span>
                {selectedScoreRange?.criterion} - {selectedScoreRange?.rangeLabel}
              </span>
              <button
                onClick={() => setSelectedScoreRange(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </DialogTitle>
            <DialogDescription>
              {selectedScoreRange?.calls.length} ligações nesta faixa de pontuação
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {selectedScoreRange?.calls.map((call) => {
              const score = selectedScoreRange?.fieldName 
                ? (call.scores as any)?.[selectedScoreRange.fieldName]
                : null;
              
              return (
                <div
                  key={call.id}
                  className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border hover:border-brand-green transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-brand-green" />
                        <span className="font-semibold text-brand-dark">{call.sdrName}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{call.client}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(call.date).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge
                        variant={
                          score >= 4.5
                            ? 'default'
                            : score >= 3.5
                            ? 'secondary'
                            : 'destructive'
                        }
                        className="text-base px-3 py-1"
                      >
                        {score?.toFixed(1) || 'N/A'}/5.0
                      </Badge>
                      <span className="text-xs text-gray-500">
                        Média geral: {call.averageScore?.toFixed(1) || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
