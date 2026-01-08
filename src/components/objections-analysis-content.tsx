
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  Target,
  BookOpen,
  ChevronRight,
  Lightbulb
} from 'lucide-react';
import { OBJECTION_LIBRARY } from '@/lib/types';
import { objectionTypeLabels, objectionTypeColors } from '@/lib/objections-constants';

interface ObjectionsAnalysisContentProps {
  data: {
    totalObjections: number;
    totalOvercome: number;
    overcomeRate: number;
    mostCommon: string;
    objectionsByType: Record<string, number>;
    objectionOvercomeRate: Record<string, { total: number; overcome: number }>;
    objectionsBySdr: any[];
  };
}

export default function ObjectionsAnalysisContent({ data }: ObjectionsAnalysisContentProps) {
  const hasData = data.totalObjections > 0;

  if (!hasData) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhuma objeção identificada
              </h3>
              <p className="text-sm text-muted-foreground">
                Não há objeções registradas nas chamadas analisadas ainda.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Objeções
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalObjections}</div>
            <p className="text-xs text-muted-foreground">
              Identificadas em todas as chamadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Objeções Superadas
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {data.totalOvercome}
            </div>
            <p className="text-xs text-muted-foreground">
              Com sucesso pelo time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Superação
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {data.overcomeRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Média do time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tipo Mais Comum
            </CardTitle>
            <Target className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {objectionTypeLabels[data.mostCommon] || data.mostCommon}
            </div>
            <p className="text-xs text-muted-foreground">
              Requer mais atenção
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="library">Biblioteca de Respostas</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          {/* Objeções por Tipo */}
          <Card>
            <CardHeader>
              <CardTitle>Objeções por Tipo</CardTitle>
              <CardDescription>
                Distribuição e taxa de superação de cada tipo de objeção
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(data.objectionsByType).length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Nenhuma objeção encontrada por tipo
                </p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(data.objectionsByType)
                    .sort((a, b) => b[1] - a[1])
                    .map(([type, count]) => {
                      const typeData = data.objectionOvercomeRate[type];
                      const rate = typeData
                        ? (typeData.overcome / typeData.total) * 100
                        : 0;

                      return (
                        <div key={type} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  objectionTypeColors[type] || 'bg-gray-500'
                                }`}
                              />
                              <span className="font-medium">
                                {objectionTypeLabels[type] || type}
                              </span>
                              <Badge variant="outline">{count}</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {rate.toFixed(0)}% superadas
                            </div>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                objectionTypeColors[type] || 'bg-gray-500'
                              }`}
                              style={{
                                width: `${
                                  data.totalObjections > 0
                                    ? (count / data.totalObjections) * 100
                                    : 0
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance por SDR */}
          <Card>
            <CardHeader>
              <CardTitle>Performance por SDR</CardTitle>
              <CardDescription>
                Ranking de SDRs na superação de objeções
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!data.objectionsBySdr || data.objectionsBySdr.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Nenhum SDR encontrado com objeções
                </p>
              ) : (
                <div className="space-y-4">
                  {data.objectionsBySdr.map((sdr, index) => {
                    const overcomeRate = sdr.total > 0 ? (sdr.overcome / sdr.total) * 100 : 0;
                    return (
                      <div
                        key={sdr.name}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                            #{index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{sdr.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {sdr.overcome}/{sdr.total} superadas
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">
                            {overcomeRate.toFixed(1)}%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            taxa de sucesso
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="library" className="space-y-4">
          {/* Biblioteca de Respostas */}
          {Object.entries(OBJECTION_LIBRARY).map(([type, response]) => (
            <Card key={type}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Objeção: {objectionTypeLabels[type] || type}
                  </CardTitle>
                  <Badge
                    className={`${
                      objectionTypeColors[type] || 'bg-gray-500'
                    } text-white`}
                  >
                    {data.objectionsByType[type] || 0} identificadas
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Melhores Práticas */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Melhores Práticas
                  </h4>
                  <ul className="space-y-1 ml-6">
                    {response.bestPractices.map((practice, idx) => (
                      <li key={idx} className="text-sm list-disc">
                        {practice}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Exemplos de Respostas */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-600" />
                    Exemplos de Respostas
                  </h4>
                  <div className="space-y-2">
                    {response.examples.map((example, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-muted/50 rounded-lg text-sm italic"
                      >
                        {example}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Script Sugerido */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-blue-600" />
                    Script Sugerido
                  </h4>
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-sm">
                    {response.scriptSuggestion}
                  </div>
                </div>

                {/* O que Evitar */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    O que Evitar
                  </h4>
                  <ul className="space-y-1 ml-6">
                    {response.tipsToAvoid.map((tip, idx) => (
                      <li key={idx} className="text-sm list-disc text-red-600">
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
