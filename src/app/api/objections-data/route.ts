import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { DetectedObjection } from '@/lib/types';
import { objectionTypeLabels } from '@/lib/objections-constants';

export const dynamic = 'force-dynamic';

type SdrObjectionStats = {
  name: string;
  total: number;
  overcome: number;
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const organizationId =
      session.user.selectedOrganizationId || session.user.organizationId;

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organização não selecionada' },
        { status: 400 }
      );
    }

    const userMeetimeAccounts = await prisma.userMeetimeAccount.findMany({
      where: {
        user: {
          organizationId: organizationId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        meetime_users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (userMeetimeAccounts.length === 0) {
      return NextResponse.json({
        totalObjections: 0,
        totalOvercome: 0,
        overcomeRate: 0,
        mostCommon: 'N/A',
        objectionsByType: {},
        objectionOvercomeRate: {},
        objectionsBySdr: [],
      }, { status: 200 });
    }

    const meetimeUserIds = userMeetimeAccounts.map(
      (account: typeof userMeetimeAccounts[0]) => account.meetimeUserId
    );

    const callScoresResult = await prisma.monitoriaCallScore.findMany({
      where: {
        user_id: {
          in: meetimeUserIds,
        },
      },
    });

    type CallScoreType = typeof callScoresResult[0];

    const userMeetimeAccountMap = new Map<
      bigint,
      typeof userMeetimeAccounts[0]
    >();
    for (const account of userMeetimeAccounts) {
      userMeetimeAccountMap.set(account.meetimeUserId, account);
    }

    const objectionsByType: Record<string, number> = {};
    const objectionsBySdr: Record<string, SdrObjectionStats> = {};
    const objectionOvercomeRate: Record<string, { total: number; overcome: number }> = {};
    let totalObjections = 0;
    let totalOvercome = 0;
    let callScoresWithObjections = 0;

    const normalizeObjectionType = (type: string): string => {
      const typeMap: Record<string, string> = {
        'Preço': 'preço',
        'preço': 'preço',
        'preco': 'preço',
        'Timing': 'timing',
        'timing': 'timing',
        'Concorrência': 'concorrência',
        'concorrência': 'concorrência',
        'concorrencia': 'concorrência',
        'Funcionalidades': 'funcionalidades',
        'funcionalidades': 'funcionalidades',
        'Autoridade': 'autoridade',
        'autoridade': 'autoridade',
        'Necessidade': 'necessidade',
        'necessidade': 'necessidade',
        'Confiança': 'confiança',
        'confiança': 'confiança',
        'confianca': 'confiança',
        'Outros': 'outros',
        'outros': 'outros',
      };
      const normalized = type.trim();
      return typeMap[normalized] || typeMap[normalized.toLowerCase()] || 'outros';
    };

    callScoresResult.forEach((callScore: CallScoreType) => {
      const objectionsRaw = (callScore as any).obje__es;
      const objectionsOvercomeRaw = (callScore as any).obje__es_superadas || {};
      
      if (!objectionsRaw || objectionsRaw === null || typeof objectionsRaw !== 'object') {
        return;
      }
      
      if (Array.isArray(objectionsRaw)) {
        const account = callScore.user_id ? userMeetimeAccountMap.get(callScore.user_id) : null;
        const sdrName =
          account?.user.name ||
          account?.meetime_users.name ||
          'N/A';

        objectionsRaw.forEach((obj: DetectedObjection) => {
          const type = normalizeObjectionType(obj.type || 'outros');
          const wasOvercome = obj.wasOvercome || false;

          objectionsByType[type] = (objectionsByType[type] || 0) + 1;
          totalObjections++;

          if (wasOvercome) {
            totalOvercome++;
          }

          if (!objectionOvercomeRate[type]) {
            objectionOvercomeRate[type] = { total: 0, overcome: 0 };
          }
          objectionOvercomeRate[type].total++;
          if (wasOvercome) {
            objectionOvercomeRate[type].overcome++;
          }

          if (!objectionsBySdr[sdrName]) {
            objectionsBySdr[sdrName] = {
              name: sdrName,
              total: 0,
              overcome: 0,
            };
          }
          objectionsBySdr[sdrName].total++;
          if (wasOvercome) {
            objectionsBySdr[sdrName].overcome++;
          }
        });
        if (objectionsRaw.length > 0) {
          callScoresWithObjections++;
        }
      } else {
        const account = callScore.user_id ? userMeetimeAccountMap.get(callScore.user_id) : null;
        const sdrName =
          account?.user.name ||
          account?.meetime_users.name ||
          'N/A';

        const objectionsObj = objectionsRaw as Record<string, boolean>;
        const objectionsOvercomeObj = (typeof objectionsOvercomeRaw === 'object' && !Array.isArray(objectionsOvercomeRaw))
          ? (objectionsOvercomeRaw as Record<string, boolean>)
          : {};

        Object.entries(objectionsObj).forEach(([typeKey, isPresent]) => {
          if (!isPresent) {
            return;
          }

          const type = normalizeObjectionType(typeKey);
          const wasOvercome = objectionsOvercomeObj[typeKey] === true || objectionsOvercomeObj[type] === true;

          objectionsByType[type] = (objectionsByType[type] || 0) + 1;
          totalObjections++;

          if (wasOvercome) {
            totalOvercome++;
          }

          if (!objectionOvercomeRate[type]) {
            objectionOvercomeRate[type] = { total: 0, overcome: 0 };
          }
          objectionOvercomeRate[type].total++;
          if (wasOvercome) {
            objectionOvercomeRate[type].overcome++;
          }

          if (!objectionsBySdr[sdrName]) {
            objectionsBySdr[sdrName] = {
              name: sdrName,
              total: 0,
              overcome: 0,
            };
          }
          objectionsBySdr[sdrName].total++;
          if (wasOvercome) {
            objectionsBySdr[sdrName].overcome++;
          }
        });

        const hasObjections = Object.values(objectionsObj).some(v => v === true);
        if (hasObjections) {
          callScoresWithObjections++;
        }
      }
    });

    const overcomeRate = totalObjections > 0 ? (totalOvercome / totalObjections) * 100 : 0;

    const sdrList = Object.values(objectionsBySdr)
      .map((sdr) => ({
        name: sdr.name,
        total: sdr.total,
        overcome: sdr.overcome,
      }))
      .sort((a, b) => {
        const rateA = a.total > 0 ? (a.overcome / a.total) * 100 : 0;
        const rateB = b.total > 0 ? (b.overcome / b.total) * 100 : 0;
        return rateB - rateA;
      });

    const mostCommon =
      Object.entries(objectionsByType).length > 0
        ? Object.entries(objectionsByType).sort((a, b) => b[1] - a[1])[0][0]
        : 'N/A';

    return NextResponse.json({
      totalObjections,
      totalOvercome,
      overcomeRate,
      mostCommon,
      objectionsByType,
      objectionOvercomeRate,
      objectionsBySdr: sdrList,
    }, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar dados de objeções:', error);
    return NextResponse.json(
      {
        totalObjections: 0,
        totalOvercome: 0,
        overcomeRate: 0,
        mostCommon: 'N/A',
        objectionsByType: {},
        objectionOvercomeRate: {},
        objectionsBySdr: [],
      },
      { status: 500 }
    );
  }
}
