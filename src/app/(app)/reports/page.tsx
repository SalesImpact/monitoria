
import { prisma } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  Calendar,
  Filter
} from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getReportsData() {
  try {
    const callsResult = await prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        c.id::text as id,
        mcs.average_score,
        mcs.resultado
      FROM calls c
      LEFT JOIN monitoria_call_scores mcs ON mcs.call_id = c.id::text
      ORDER BY c.date DESC
    `);

    const sdrs = await prisma.meetime_users.findMany({
      select: {
        name: true,
        email: true,
      },
      where: {
        active: true,
        deleted_at: null,
      },
    });

    // Estatísticas gerais
    const totalCalls = callsResult.length;
    const callsWithScore = callsResult.filter((c: any) => c.average_score !== null);
    const avgScore = callsWithScore.length > 0 
      ? callsWithScore.reduce((acc: number, call: any) => acc + Number(call.average_score || 0), 0) / callsWithScore.length
      : 0;
    const isSuccessfulCall = (result: string | null | undefined): boolean => {
      if (!result) return false;
      const normalized = result.toLowerCase().trim().replace(/_/g, ' ');
      return normalized === 'agendado' || normalized === 'qualificação sucesso';
    };
    
    const successfulCalls = callsResult.filter((c: any) => isSuccessfulCall(c.resultado)).length;
    const successRate = totalCalls > 0 ? (successfulCalls / totalCalls) * 100 : 0;

    return {
      calls: callsResult,
      sdrs: sdrs.map(sdr => ({ name: sdr.name || 'Desconhecido', email: sdr.email || '' })),
      stats: {
        totalCalls,
        avgScore,
        successRate,
      },
    };
  } catch (error) {
    console.error('Erro ao buscar dados de relatórios:', error);
    return {
      calls: [],
      sdrs: [],
      stats: {
        totalCalls: 0,
        avgScore: 0,
        successRate: 0,
      },
    };
  }
}

export default async function ReportsPage() {
  const data = await getReportsData();

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Relatórios</h1>
        <p className="text-muted-foreground mt-2">
          Exporte e analise dados de performance do time
        </p>
      </div>

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
  );
}
