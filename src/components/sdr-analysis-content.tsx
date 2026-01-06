
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Phone,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  AlertCircle,
} from 'lucide-react';
import type { SDR, Call, CallScore, Keyword } from '@prisma/client';

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

interface SDRWithCalls extends SDR {
  calls: (Call & {
    scores: CallScore | null;
    keywords: Keyword[];
  })[];
}

interface SDRAnalysisContentProps {
  sdrs: SDRWithCalls[];
}

export default function SDRAnalysisContent({ sdrs }: SDRAnalysisContentProps) {
  const [selectedSDRId, setSelectedSDRId] = useState<string>(
    sdrs[0]?.id || ''
  );

  const selectedSDR = useMemo(
    () => sdrs.find((s) => s.id === selectedSDRId),
    [sdrs, selectedSDRId]
  );

  const sdrMetrics = useMemo(() => {
    if (!selectedSDR) return null;

    const { calls } = selectedSDR;
    const callsWithScores = calls.filter((c) => c.averageScore !== null);

    const totalCalls = calls.length;
    const averageScore =
      callsWithScores.length > 0
        ? callsWithScores.reduce((sum, c) => sum + (c.averageScore || 0), 0) /
          callsWithScores.length
        : 0;

    const successfulCalls = calls.filter(
      (c) => c.result === 'agendado' || c.result === 'qualificação_sucesso'
    ).length;
    const conversionRate =
      totalCalls > 0 ? (successfulCalls / totalCalls) * 100 : 0;

    // Calcular média por critério
    const criteriaScores: Record<string, number[]> = {};
    
    calls.forEach((call) => {
      if (call.scores) {
        Object.entries(CRITERIA_MAP).forEach(([displayName, fieldName]) => {
          const score = (call.scores as any)?.[fieldName];
          if (typeof score === 'number') {
            if (!criteriaScores[displayName]) {
              criteriaScores[displayName] = [];
            }
            criteriaScores[displayName].push(score);
          }
        });
      }
    });

    const criteriaAverages = Object.entries(criteriaScores).map(
      ([criterion, scores]) => ({
        criterion,
        average: scores.reduce((sum, s) => sum + s, 0) / scores.length,
        count: scores.length,
      })
    );

    // Pontos fortes e fracos
    const strengths = criteriaAverages.filter((c) => c.average >= 4).slice(0, 3);
    const weaknesses = criteriaAverages.filter((c) => c.average < 3).slice(0, 3);

    return {
      totalCalls,
      averageScore,
      conversionRate,
      criteriaAverages,
      strengths,
      weaknesses,
    };
  }, [selectedSDR]);

  if (!selectedSDR || !sdrMetrics) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-gray-500">
            Nenhum SDR selecionado ou sem dados disponíveis
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* SDR Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Selecionar SDR</CardTitle>
          <CardDescription>
            Escolha um representante para visualizar sua análise detalhada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedSDRId} onValueChange={setSelectedSDRId}>
            <SelectTrigger className="w-full md:w-[400px]">
              <SelectValue placeholder="Selecione um SDR" />
            </SelectTrigger>
            <SelectContent>
              {sdrs.map((sdr) => (
                <SelectItem key={sdr.id} value={sdr.id}>
                  {sdr.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* SDR Profile Card */}
      <Card className="card-hover">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-brand-green text-brand-dark text-xl">
                {selectedSDR.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-brand-dark">
                {selectedSDR.name}
              </h2>
              <p className="text-gray-600">{selectedSDR.email}</p>
            </div>
            <Badge
              variant={
                sdrMetrics.averageScore >= 4
                  ? 'default'
                  : sdrMetrics.averageScore >= 3
                  ? 'secondary'
                  : 'destructive'
              }
              className="text-lg px-4 py-2"
            >
              {sdrMetrics.averageScore.toFixed(1)}/5.0
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Ligações
            </CardTitle>
            <Phone className="h-4 w-4 text-brand-green" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-brand-dark">
              {sdrMetrics.totalCalls}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Chamadas realizadas
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Conversão
            </CardTitle>
            <Target className="h-4 w-4 text-brand-green" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-brand-dark">
              {sdrMetrics.conversionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Agendamentos + Qualificações
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pontuação Média
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-brand-green" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-brand-dark">
              {sdrMetrics.averageScore.toFixed(1)}/5.0
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Avaliação Call Check
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Strengths and Weaknesses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strengths */}
        <Card className="card-hover border-green-200">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-green-600" />
              <CardTitle className="text-brand-dark">Pontos Fortes</CardTitle>
            </div>
            <CardDescription>
              Critérios com melhor desempenho
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sdrMetrics.strengths.length > 0 ? (
              <div className="space-y-4">
                {sdrMetrics.strengths.map((item) => (
                  <div
                    key={item.criterion}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-brand-dark">
                        {item.criterion}
                      </p>
                      <p className="text-sm text-gray-500">
                        {item.count} avaliações
                      </p>
                    </div>
                    <Badge variant="default" className="bg-green-600">
                      {item.average.toFixed(1)}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                Nenhum ponto forte identificado ainda
              </p>
            )}
          </CardContent>
        </Card>

        {/* Weaknesses */}
        <Card className="card-hover border-orange-200">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <CardTitle className="text-brand-dark">
                Oportunidades de Melhoria
              </CardTitle>
            </div>
            <CardDescription>
              Critérios que precisam de atenção
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sdrMetrics.weaknesses.length > 0 ? (
              <div className="space-y-4">
                {sdrMetrics.weaknesses.map((item) => (
                  <div
                    key={item.criterion}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-brand-dark">
                        {item.criterion}
                      </p>
                      <p className="text-sm text-gray-500">
                        {item.count} avaliações
                      </p>
                    </div>
                    <Badge variant="destructive">
                      {item.average.toFixed(1)}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                Nenhuma oportunidade de melhoria crítica
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Criteria Breakdown */}
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="text-brand-dark">
            Detalhamento por Critério
          </CardTitle>
          <CardDescription>
            Performance em cada aspecto do Call Check
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sdrMetrics.criteriaAverages
              .sort((a, b) => b.average - a.average)
              .map((item) => (
                <div key={item.criterion} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-brand-dark">
                      {item.criterion}
                    </span>
                    <span className="text-sm text-gray-600">
                      {item.average.toFixed(1)}/5.0
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        item.average >= 4
                          ? 'bg-green-500'
                          : item.average >= 3
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${(item.average / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
