
import { prisma } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  Users, 
  Target,
  BookOpen,
  ChevronRight,
  Lightbulb
} from 'lucide-react';
import { OBJECTION_LIBRARY, DetectedObjection } from '@/lib/types';
import { objectionTypeLabels, objectionTypeColors } from '@/lib/objections-constants';

export const dynamic = 'force-dynamic';

type SdrObjectionStats = {
  name: string;
  total: number;
  overcome: number;
  byType: Record<string, number>;
};

async function getObjectionsData() {
  try {
    const callsResult = await prisma.call.findMany({
      select: {
        id: true,
        sdrName: true,
        detectedObjections: true,
        result: true,
      },
    });

    type CallType = typeof callsResult[0];

    const objectionsByType: Record<string, number> = {};
    const objectionsBySdr: Record<string, SdrObjectionStats> = {};
    const objectionOvercomeRate: Record<string, { total: number; overcome: number }> = {};
    let totalObjections = 0;
    let totalOvercome = 0;

    callsResult.forEach((call: CallType) => {
      const objections = (call.detectedObjections as DetectedObjection[]) || [];
      if (!objections || !Array.isArray(objections)) return;

      objections.forEach((obj: DetectedObjection) => {
        const type = obj.type || 'outros';
        
        // Conta por tipo
        objectionsByType[type] = (objectionsByType[type] || 0) + 1;
        totalObjections++;

        // Conta superadas
        if (obj.wasOvercome) {
          totalOvercome++;
        }

        // Taxa de superação por tipo
        if (!objectionOvercomeRate[type]) {
          objectionOvercomeRate[type] = { total: 0, overcome: 0 };
        }
        objectionOvercomeRate[type].total++;
        if (obj.wasOvercome) {
          objectionOvercomeRate[type].overcome++;
        }

        // Conta por SDR
        if (!objectionsBySdr[call.sdrName]) {
          objectionsBySdr[call.sdrName] = {
            name: call.sdrName,
            total: 0,
            overcome: 0,
            byType: {} as Record<string, number>,
          };
        }
        objectionsBySdr[call.sdrName].total++;
        if (obj.wasOvercome) {
          objectionsBySdr[call.sdrName].overcome++;
        }
        objectionsBySdr[call.sdrName].byType[type] = 
          (objectionsBySdr[call.sdrName].byType[type] || 0) + 1;
      });
    });

    const overcomeRate = totalObjections > 0 ? (totalOvercome / totalObjections) * 100 : 0;

    // Ordena SDRs por taxa de superação
    const sdrList = Object.values(objectionsBySdr).map(sdr => ({
      ...sdr,
      overcomeRate: sdr.total > 0 ? (sdr.overcome / sdr.total) * 100 : 0,
    })).sort((a, b) => b.overcomeRate - a.overcomeRate);

    return {
      totalObjections,
      totalOvercome,
      overcomeRate,
      objectionsByType,
      objectionOvercomeRate,
      sdrList,
    };
  } catch (error) {
    console.error('Erro ao buscar dados de objeções:', error);
    return {
      totalObjections: 0,
      totalOvercome: 0,
      overcomeRate: 0,
      objectionsByType: {},
      objectionOvercomeRate: {},
      sdrList: [],
    };
  }
}

export default async function ObjectionsPage() {
  const data = await getObjectionsData();

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Análise de Objeções</h1>
        <p className="text-muted-foreground mt-2">
          Acompanhe, analise e aprenda a superar objeções de forma eficaz
        </p>
      </div>

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
              {Object.entries(data.objectionsByType).length > 0
                ? objectionTypeLabels[
                    Object.entries(data.objectionsByType).sort(
                      (a, b) => b[1] - a[1]
                    )[0][0]
                  ]
                : 'N/A'}
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
                                (count / data.totalObjections) * 100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
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
              <div className="space-y-4">
                {data.sdrList.map((sdr, index) => (
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
                        {sdr.overcomeRate.toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        taxa de sucesso
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
