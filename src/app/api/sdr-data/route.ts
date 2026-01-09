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
      return NextResponse.json({ sdrs: [] }, { status: 200 });
    }

    const meetimeUserIds = userMeetimeAccounts.map(
      (account) => account.meetimeUserId
    );

    const callScores = await prisma.monitoriaCallScore.findMany({
      where: {
        user_id: {
          in: meetimeUserIds,
        },
      },
    });

    const scoresByMeetimeUserId = new Map<
      bigint,
      typeof callScores
    >();
    for (const score of callScores) {
      if (score.user_id) {
        const existing = scoresByMeetimeUserId.get(score.user_id) || [];
        existing.push(score);
        scoresByMeetimeUserId.set(score.user_id, existing);
      }
    }

    const userScoresMap = new Map<
      string,
      {
        user: { id: string; name: string | null; email: string };
        meetimeAccounts: Array<{
          meetimeUserId: bigint;
          meetimeUserName: string | null;
          callScores: typeof callScores;
        }>;
      }
    >();

    for (const account of userMeetimeAccounts) {
      const userId = account.user.id;
      const scores =
        scoresByMeetimeUserId.get(account.meetimeUserId) || [];

      if (!userScoresMap.has(userId)) {
        userScoresMap.set(userId, {
          user: {
            id: account.user.id,
            name: account.user.name || '',
            email: account.user.email,
          },
          meetimeAccounts: [],
        });
      }

      const userData = userScoresMap.get(userId)!;
      userData.meetimeAccounts.push({
        meetimeUserId: account.meetimeUserId,
        meetimeUserName: account.meetime_users.name || null,
        callScores: scores,
      });
    }

    const sdrs = Array.from(userScoresMap.values()).map((userData) => {
      const allScores = userData.meetimeAccounts.flatMap(
        (acc) => acc.callScores
      );

      return {
        id: userData.user.id,
        name: userData.user.name,
        email: userData.user.email,
        callScores: allScores.map((score) => ({
          id: score.id,
          callId: score.callId,
          userId: score.user_id ? Number(score.user_id) : null,
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
          nivelEngajamentoCliente: score.nivelEngajamentoCliente,
          confiancaSdr: score.confiancaSdr,
          averageScore: score.averageScore,
          weightedScore: score.weightedScore,
          aiFeedback: score.aiFeedback,
          resultado: score.resultado,
          sentimentoGeral: score.sentimento_geral,
          sentimentoCliente: score.sentimento_cliente,
          sentimentoSdr: score.sentimento_sdr,
          objeções: score.obje__es,
          objeçõesSuperadas: score.obje__es_superadas,
          palavrasChavePositivas: score.palavras_chave_positivas,
          palavrasChaveNegativas: score.palavras_chave_negativas,
          palavrasChaveNeutras: score.palavras_chave_neutras,
          createdAt: score.createdAt,
          updatedAt: score.updatedAt,
        })),
      };
    });

    return NextResponse.json({ sdrs }, { status: 200 });
  } catch (error) {
    console.error('Error fetching SDR data:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dados de SDRs' },
      { status: 500 }
    );
  }
}
