import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

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
        calls: [],
        sdrs: [],
        callsWithScores: [],
        stats: {
          totalCalls: 0,
          avgScore: 0,
          successRate: 0,
        },
      }, { status: 200 });
    }

    const meetimeUserIds = userMeetimeAccounts.map(
      (account) => account.meetimeUserId
    );

    if (meetimeUserIds.length === 0) {
      return NextResponse.json({
        calls: [],
        sdrs: [],
        callsWithScores: [],
        stats: {
          totalCalls: 0,
          avgScore: 0,
          successRate: 0,
        },
      }, { status: 200 });
    }

    const callScores = await prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        id,
        call_id as "callId",
        average_score as "averageScore",
        resultado,
        user_id
      FROM monitoria_call_scores
      WHERE user_id = ANY(ARRAY[${meetimeUserIds.join(',')}]::bigint[])
    `);

    if (callScores.length === 0) {
      const sdrs = userMeetimeAccounts.map((account) => ({
        id: account.user.id,
        name: account.user.name || account.meetime_users.name || 'N/A',
        email: account.user.email || account.meetime_users.email || '',
        status: 'active',
        calls: [],
      }));

      return NextResponse.json({
        calls: [],
        sdrs,
        callsWithScores: [],
        stats: {
          totalCalls: 0,
          avgScore: 0,
          successRate: 0,
        },
      }, { status: 200 });
    }

    const callIds = callScores
      .map((score) => {
        try {
          return BigInt(score.callId);
        } catch {
          return null;
        }
      })
      .filter((id): id is bigint => id !== null);

    if (callIds.length === 0) {
      return NextResponse.json({
        calls: [],
        sdrs: [],
        callsWithScores: [],
        stats: {
          totalCalls: 0,
          avgScore: 0,
          successRate: 0,
        },
      }, { status: 200 });
    }

    const calls = await prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        id,
        date,
        receiver_phone,
        user_name,
        user_id
      FROM calls
      WHERE id = ANY(ARRAY[${callIds.join(',')}]::bigint[])
    `);

    const callsMap = new Map<string, any>();
    for (const call of calls) {
      callsMap.set(call.id.toString(), call);
    }

    const userMeetimeAccountMap = new Map<bigint, typeof userMeetimeAccounts[0]>();
    for (const account of userMeetimeAccounts) {
      userMeetimeAccountMap.set(account.meetimeUserId, account);
    }

    const callsData: any[] = [];
    const sdrsMap = new Map<
      string,
      {
        id: string;
        name: string;
        email: string;
        status: string;
        calls: Array<{ id: string; averageScore: number; result: string }>;
      }
    >();

    for (const score of callScores) {
      const call = callsMap.get(score.callId);
      if (!call) continue;

      const account = score.user_id
        ? userMeetimeAccountMap.get(score.user_id)
        : null;

      const sdrName =
        account?.user.name ||
        account?.meetime_users.name ||
        call.user_name ||
        'N/A';

      const userId = account?.user.id || 'unknown';
      const userEmail = account?.user.email || account?.meetime_users.email || '';

      if (!sdrsMap.has(userId)) {
        sdrsMap.set(userId, {
          id: userId,
          name: account?.user.name || account?.meetime_users.name || sdrName,
          email: userEmail,
          status: 'active',
          calls: [],
        });
      }

      const sdrData = sdrsMap.get(userId)!;
      const callData = {
        id: score.callId,
        sdrName: sdrName,
        client: call.receiver_phone || 'N/A',
        date: call.date,
        duration: '',
        callType: '',
        averageScore: score.averageScore || 0,
        result: score.resultado || 'indefinido',
      };

      callsData.push(callData);

      sdrData.calls.push({
        id: score.callId,
        averageScore: score.averageScore || 0,
        result: score.resultado || 'indefinido',
      });
    }

    const sdrs = Array.from(sdrsMap.values());

    const callsWithScores = callsData.map((call) => ({
      id: call.id,
      sdrName: call.sdrName,
      averageScore: call.averageScore,
      result: call.result,
    }));

    const totalCalls = callsData.length;
    const avgScore =
      totalCalls > 0
        ? callsData.reduce((sum, call) => sum + call.averageScore, 0) / totalCalls
        : 0;
    
    const isSuccessfulCall = (result: string | null | undefined): boolean => {
      if (!result) return false;
      const normalized = result.toLowerCase().trim().replace(/_/g, ' ');
      return normalized === 'agendado' || normalized === 'qualificação sucesso';
    };
    
    const successfulCalls = callsData.filter(
      (call) => isSuccessfulCall(call.result)
    ).length;
    const successRate = totalCalls > 0 ? (successfulCalls / totalCalls) * 100 : 0;

    callsData.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });

    return NextResponse.json(
      {
        calls: callsData,
        sdrs,
        callsWithScores,
        stats: {
          totalCalls,
          avgScore: Number(avgScore.toFixed(2)),
          successRate: Number(successRate.toFixed(2)),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dados do dashboard' },
      { status: 500 }
    );
  }
}
