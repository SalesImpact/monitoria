import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Buscar todos os IDs Meetime associados a usuários cadastrados
    const allAssociatedAccounts = await prisma.userMeetimeAccount.findMany({
      select: { meetimeUserId: true },
      distinct: ['meetimeUserId']
    });

    const associatedMeetimeUserIds = allAssociatedAccounts.map(a => a.meetimeUserId);

    if (associatedMeetimeUserIds.length === 0) {
      return NextResponse.json({
        sdrs: [],
        results: [],
        sentiments: [],
        types: []
      });
    }

    const userIds = associatedMeetimeUserIds.map(id => id.toString()).join(',');

    // Buscar valores únicos de cada filtro
    const [sdrsResult, resultsResult, sentimentsResult, typesResult] = await Promise.all([
      // SDRs únicos
      prisma.$queryRawUnsafe<any[]>(`
        SELECT DISTINCT 
          COALESCE(mu.name, c.user_name) as sdr_name
        FROM calls c
        LEFT JOIN meetime_users mu ON mu.id = c.user_id
        WHERE c.user_id IN (${userIds})
          AND (mu.name IS NOT NULL OR c.user_name IS NOT NULL)
        ORDER BY sdr_name
      `),
      
      // Resultados únicos
      prisma.$queryRawUnsafe<any[]>(`
        SELECT DISTINCT mcs.resultado
        FROM calls c
        LEFT JOIN monitoria_call_scores mcs ON mcs.call_id = c.id::text
        WHERE c.user_id IN (${userIds})
          AND mcs.resultado IS NOT NULL
          AND mcs.resultado != ''
        ORDER BY mcs.resultado
      `),
      
      // Sentimentos únicos
      prisma.$queryRawUnsafe<any[]>(`
        SELECT DISTINCT mcs.sentimento_geral
        FROM calls c
        LEFT JOIN monitoria_call_scores mcs ON mcs.call_id = c.id::text
        WHERE c.user_id IN (${userIds})
          AND mcs.sentimento_geral IS NOT NULL
          AND mcs.sentimento_geral != ''
        ORDER BY mcs.sentimento_geral
      `),
      
      // Tipos únicos
      prisma.$queryRawUnsafe<any[]>(`
        SELECT DISTINCT c.call_type
        FROM calls c
        WHERE c.user_id IN (${userIds})
          AND c.call_type IS NOT NULL
          AND c.call_type != ''
        ORDER BY c.call_type
      `)
    ]);

    return NextResponse.json({
      sdrs: sdrsResult.map((r: any) => r.sdr_name).filter(Boolean),
      results: resultsResult.map((r: any) => r.resultado).filter(Boolean),
      sentiments: sentimentsResult.map((r: any) => r.sentimento_geral).filter(Boolean),
      types: typesResult.map((r: any) => r.call_type).filter(Boolean)
    });
  } catch (error) {
    console.error('Error fetching filters:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar filtros' },
      { status: 500 }
    );
  }
}

