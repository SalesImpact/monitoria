'use client';

import { useState, useEffect } from 'react';
import DashboardStats from '@/components/dashboard-stats';
import SDRRanking from '@/components/sdr-ranking';
import CallsChart from '@/components/calls-chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, FileText, Download, Calendar, Filter } from 'lucide-react';

interface DashboardData {
  calls: any[];
  sdrs: any[];
  callsWithScores: any[];
  stats: {
    totalCalls: number;
    avgScore: number;
    successRate: number;
  };
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'geral' | 'relatorios'>('geral');

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/dashboard-data');
        const result = await response.json();
        // Ensure data structure is valid even if API returns error
        if (result && !result.error) {
          setData({
            calls: result.calls || [],
            sdrs: result.sdrs || [],
            callsWithScores: result.callsWithScores || [],
            stats: result.stats || {
              totalCalls: 0,
              avgScore: 0,
              successRate: 0,
            },
          });
        } else {
          // Set empty data structure on error
          setData({
            calls: [],
            sdrs: [],
            callsWithScores: [],
            stats: {
              totalCalls: 0,
              avgScore: 0,
              successRate: 0,
            },
          });
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        // Set empty data structure on error
        setData({
          calls: [],
          sdrs: [],
          callsWithScores: [],
          stats: {
            totalCalls: 0,
            avgScore: 0,
            successRate: 0,
          },
        });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-gray-500">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center mb-2">
          <BarChart3 className="w-8 h-8 text-gray-400 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Dashboards</h1>
        </div>
        <p className="text-gray-600">
          Visualize métricas gerais e gere relatórios personalizados
        </p>
      </div>

      {/* Tabs */}
      <div className="space-y-6">
        <div className="flex border-b border-gray-200">
          <Button
            variant="ghost"
            className={`rounded-none border-b-2 ${
              activeTab === 'geral'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('geral')}
          >
            Dashboard Geral
          </Button>
          <Button
            variant="ghost"
            className={`rounded-none border-b-2 ${
              activeTab === 'relatorios'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('relatorios')}
          >
            Relatórios
          </Button>
        </div>

        {/* Tab: Dashboard Geral */}
        {activeTab === 'geral' && (
          <div className="space-y-6">
          {/* Statistics Component */}
          <DashboardStats calls={data?.calls || []} />

          {/* Performance Chart - Full Width Above Rankings */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="text-brand-dark">Performance por SDR</CardTitle>
              <CardDescription>
                Pontuação média por representante
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CallsChart calls={data?.callsWithScores || []} />
            </CardContent>
          </Card>

          {/* SDR Rankings - Full Width Below Chart */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="text-brand-dark">Rankings</CardTitle>
              <CardDescription>
                Top 5 e Bottom 5 SDRs por performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SDRRanking sdrs={data?.sdrs || []} />
            </CardContent>
          </Card>
          </div>
        )}

        {/* Tab: Relatórios */}
        {activeTab === 'relatorios' && (
          <div className="space-y-6">
          {data && data.stats ? (
            <>
              {/* Estatísticas Rápidas */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total de Chamadas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.stats.totalCalls}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Score Médio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.stats.avgScore.toFixed(2)}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {data.stats.successRate.toFixed(1)}%
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <div>Carregando estatísticas...</div>
          )}

          {/* Templates de Relatórios */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Relatório Executivo */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Relatório Executivo</CardTitle>
                    <CardDescription>
                      Visão geral de performance e KPIs principais
                    </CardDescription>
                  </div>
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  Ideal para: Diretores e C-Level
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge>KPIs Gerais</Badge>
                  <Badge>Ranking SDRs</Badge>
                  <Badge>Tendências</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Relatório de Coaching */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Relatório de Coaching</CardTitle>
                    <CardDescription>
                      Análise detalhada por SDR com pontos de melhoria
                    </CardDescription>
                  </div>
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  Ideal para: Gestores de Vendas
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge>Performance Individual</Badge>
                  <Badge>Áreas de Melhoria</Badge>
                  <Badge>Sugestões</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Relatório de Objeções */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Relatório de Objeções</CardTitle>
                    <CardDescription>
                      Análise completa de objeções e taxa de superação
                    </CardDescription>
                  </div>
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  Ideal para: Gestores e SDRs
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge>Tipos de Objeção</Badge>
                  <Badge>Taxa de Superação</Badge>
                  <Badge>Scripts</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Relatório de Sentimento */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Relatório de Sentimento</CardTitle>
                    <CardDescription>
                      Análise emocional de chamadas e engajamento
                    </CardDescription>
                  </div>
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  Ideal para: Análise de Qualidade
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge>Sentimento Cliente</Badge>
                  <Badge>Confiança SDR</Badge>
                  <Badge>Jornada Emocional</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Nota sobre relatórios */}
          <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
            <CardContent className="pt-6">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Nota:</strong> Esta página apresenta os templates de relatórios disponíveis. 
                A funcionalidade de exportação em PDF e Excel pode ser implementada conforme necessidade.
                Os dados podem ser visualizados em tempo real nas outras páginas do sistema.
              </p>
            </CardContent>
          </Card>
          </div>
        )}
      </div>
    </div>
  );
}
