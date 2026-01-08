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
        meetimeUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (userMeetimeAccounts.length === 0) {
      return NextResponse.json({ calls: [], sdrs: [] }, { status: 200 });
    }

    const meetimeUserIds = userMeetimeAccounts.map(
      (account) => account.meetimeUserId
    );

    const callScores = await prisma.callScore.findMany({
      where: {
        userId: {
          in: meetimeUserIds,
        },
      },
    });

    if (callScores.length === 0) {
      const sdrs = userMeetimeAccounts.map((account) => ({
        id: account.user.id,
        name: account.user.name || '',
      }));
      return NextResponse.json({ calls: [], sdrs }, { status: 200 });
    }

    const callIds = callScores.map((score) => score.callId);

    const calls = await prisma.call.findMany({
      where: {
        id: {
          in: callIds.map((id) => BigInt(id)),
        },
      },
      select: {
        id: true,
        date: true,
        receiverPhone: true,
        userName: true,
        userId: true,
      },
    });

    const callsMap = new Map<string, typeof calls[0]>();
    for (const call of calls) {
      callsMap.set(call.id.toString(), call);
    }

    const userMeetimeAccountMap = new Map<bigint, typeof userMeetimeAccounts[0]>();
    for (const account of userMeetimeAccounts) {
      userMeetimeAccountMap.set(account.meetimeUserId, account);
    }

    const callsData: any[] = [];
    const sdrsMap = new Map<string, { id: string; name: string }>();

    for (const score of callScores) {
      const call = callsMap.get(score.callId);
      if (!call) continue;

      const account = score.userId
        ? userMeetimeAccountMap.get(score.userId)
        : null;

      const sdrName =
        account?.user.name ||
        account?.meetimeUser.name ||
        call.userName ||
        'N/A';

      const userId = account?.user.id;
      if (userId && account?.user.name) {
        if (!sdrsMap.has(userId)) {
          sdrsMap.set(userId, {
            id: userId,
            name: account.user.name,
          });
        }
      }

      callsData.push({
        id: score.callId,
        sdrName: sdrName,
        client: call.receiverPhone || 'N/A',
        date: call.date,
        averageScore: score.averageScore,
        scores: {
          saudacaoApresentacao: score.saudacaoApresentacao,
          apresentacaoEmpresa: score.apresentacaoEmpresa,
          solicitacaoConfirmacaoNome: score.solicitacaoConfirmacaoNome,
          tomVoz: score.tomVoz,
          rapport: score.rapport,
          perguntasValidacao: score.perguntasValidacao,
          escutaAtiva: score.escutaAtiva,
          pitchSolucao: score.pitchSolucao,
          historiaCliente: score.historiaCliente,
          perguntasSituacao: score.perguntasSituacao,
          perguntasProblema: score.perguntasProblema,
          perguntasImplicacao: score.perguntasImplicacao,
          perguntasNecessidadeSolucao: score.perguntasNecessidadeSolucao,
          confirmouEntendimento: score.confirmouEntendimento,
          vendeuProximoPasso: score.vendeuProximoPasso,
          agendouConcluiu: score.agendouConcluiu,
        },
        sdr: {
          name: sdrName,
        },
      });
    }

    const sdrs = Array.from(sdrsMap.values());

    callsData.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });

    return NextResponse.json({ calls: callsData, sdrs }, { status: 200 });
  } catch (error) {
    console.error('Error fetching criteria data:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dados de critérios' },
      { status: 500 }
    );
  }
}
