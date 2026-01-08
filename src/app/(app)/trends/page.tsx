
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Calendar, BarChart3 } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getTrendsData() {
  return {
    weeklyStats: [
      {
        week: '12/10',
        fullDate: new Date('2024-10-12'),
        totalCalls: 4,
        averageScore: 2.7,
        conversionRate: 50.0,
      },
      {
        week: '19/10',
        fullDate: new Date('2024-10-19'),
        totalCalls: 1,
        averageScore: 3.7,
        conversionRate: 100.0,
      },
    ],
    scoreTrend: 3.18,
    callsTrend: 0.5,
    recentAvgScore: 3.2,
    recentAvgCalls: 3,
    totalCalls: 5,
  };
}

export default async function TrendsPage() {
  const {
    weeklyStats,
    scoreTrend,
    callsTrend,
    recentAvgScore,
    recentAvgCalls,
    totalCalls,
  } = await getTrendsData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark">
            Tendências e Evolução
          </h1>
          <p className="text-gray-600 mt-1">
            Análise temporal da performance da equipe (últimos 3 meses)
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Ligações
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-brand-green" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-brand-dark">
              {totalCalls}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Últimos 3 meses
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Média Semanal
            </CardTitle>
            <Calendar className="h-4 w-4 text-brand-green" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-brand-dark">
              {recentAvgCalls}
            </div>
            <div className="flex items-center mt-1">
              {callsTrend >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
              )}
              <p className={`text-xs font-medium ${
                callsTrend >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {Math.abs(callsTrend).toFixed(1)} vs. mês anterior
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pontuação Atual
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-brand-green" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-brand-dark">
              {recentAvgScore.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Média das últimas 4 semanas
            </p>
          </CardContent>
        </Card>

        <Card className={`card-hover ${
          scoreTrend >= 0 ? 'border-green-200' : 'border-orange-200'
        }`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tendência
            </CardTitle>
            {scoreTrend >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-orange-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${
              scoreTrend >= 0 ? 'text-green-600' : 'text-orange-600'
            }`}>
              {scoreTrend >= 0 ? '+' : ''}{scoreTrend.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Variação vs. período anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Performance Table */}
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="text-brand-dark">
            Performance Semanal
          </CardTitle>
          <CardDescription>
            Evolução detalhada por semana
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                    Semana
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">
                    Ligações
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">
                    Pontuação Média
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">
                    Taxa de Conversão
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {weeklyStats.map((week, index) => {
                  const prevWeek = weeklyStats[index - 1];
                  const scoreDiff = prevWeek 
                    ? week.averageScore - prevWeek.averageScore 
                    : 0;

                  return (
                    <tr
                      key={week.week}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {week.week}
                      </td>
                      <td className="py-3 px-4 text-sm text-center text-gray-900">
                        {week.totalCalls}
                      </td>
                      <td className="py-3 px-4 text-sm text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <span className="font-medium text-gray-900">
                            {week.averageScore.toFixed(1)}
                          </span>
                          {index > 0 && scoreDiff !== 0 && (
                            <span className={`text-xs ${
                              scoreDiff >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              ({scoreDiff >= 0 ? '+' : ''}{scoreDiff.toFixed(1)})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-center text-gray-900">
                        {week.conversionRate.toFixed(1)}%
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          variant={
                            week.averageScore >= 4
                              ? 'default'
                              : week.averageScore >= 3
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {week.averageScore >= 4
                            ? 'Excelente'
                            : week.averageScore >= 3
                            ? 'Bom'
                            : 'Precisa Melhorar'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className="card-hover bg-gradient-to-r from-brand-green/10 to-brand-dark/5">
        <CardHeader>
          <CardTitle className="text-brand-dark">
            Insights e Recomendações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3">
            <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-brand-dark">
                Tendência Positiva Forte
              </p>
              <p className="text-sm text-gray-600 mt-1">
                A equipe está melhorando consistentemente. Continue com as práticas atuais e compartilhe as melhores técnicas entre os SDRs.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
