import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import {
  calculateCategoryAverage,
  getCategoryDisplayName,
  getCategoryForCriteria,
  type CategoryKey,
  type CriteriaKey,
} from '@/lib/criteria-categories';
import { CRITERIA_MAP } from '@/lib/criteria-map';
import { CRITERIA_WEIGHTS } from '@/lib/types';

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

    const categories: CategoryKey[] = [
      'abertura',
      'validacao_objetivo',
      'spin_selling',
      'proximos_passos',
    ];

    const sdrs = Array.from(userScoresMap.values()).map((userData) => {
      const allScores = userData.meetimeAccounts.flatMap(
        (acc) => acc.callScores
      );

      const callScoresData = allScores.map((score) => ({
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
        averageScore: score.averageScore,
        weightedScore: score.weightedScore,
      }));

      const categoryAverages: Record<CategoryKey, number> = {
        abertura: calculateCategoryAverage(callScoresData, 'abertura'),
        validacao_objetivo: calculateCategoryAverage(
          callScoresData,
          'validacao_objetivo'
        ),
        spin_selling: calculateCategoryAverage(callScoresData, 'spin_selling'),
        proximos_passos: calculateCategoryAverage(
          callScoresData,
          'proximos_passos'
        ),
      };

      const criteriaFields: CriteriaKey[] = [
        'saudacaoApresentacao',
        'apresentacaoEmpresa',
        'solicitacaoConfirmacaoNome',
        'tomVoz',
        'rapport',
        'perguntasValidacao',
        'escutaAtiva',
        'pitchSolucao',
        'historiaCliente',
        'perguntasSituacao',
        'perguntasProblema',
        'perguntasImplicacao',
        'perguntasNecessidadeSolucao',
        'confirmouEntendimento',
        'vendeuProximoPasso',
        'agendouConcluiu',
      ];

      const criteriaScores: Array<{
        criterio: CriteriaKey;
        score_atual: number;
        categoria: CategoryKey;
        peso: number;
        gap: number;
        priorityScore: number;
      }> = [];

      criteriaFields.forEach((criterio) => {
        const scores = callScoresData
          .map((score) => score[criterio])
          .filter((val): val is number => typeof val === 'number' && !isNaN(val));

        if (scores.length === 0) return;

        const scoreAtual = scores.reduce((sum, val) => sum + val, 0) / scores.length;
        const gap = 5.0 - scoreAtual;
        const categoria = getCategoryForCriteria(criterio);
        
        const categoryKey = categoria as keyof typeof CRITERIA_WEIGHTS;
        
        const criteriaToSnakeCase: Record<CriteriaKey, string> = {
          saudacaoApresentacao: 'saudacao_apresentacao',
          apresentacaoEmpresa: 'apresentacao_empresa',
          solicitacaoConfirmacaoNome: 'solicitacao_confirmacao_nome',
          tomVoz: 'tom_voz',
          rapport: 'rapport',
          perguntasValidacao: 'perguntas_validacao',
          escutaAtiva: 'escuta_ativa',
          pitchSolucao: 'pitch_solucao',
          historiaCliente: 'historia_cliente',
          perguntasSituacao: 'perguntas_situacao',
          perguntasProblema: 'perguntas_problema',
          perguntasImplicacao: 'perguntas_implicacao',
          perguntasNecessidadeSolucao: 'perguntas_necessidade_solucao',
          confirmouEntendimento: 'confirmou_entendimento',
          vendeuProximoPasso: 'vendeu_proximo_passo',
          agendouConcluiu: 'agendou_concluiu',
        };
        
        const criteriaKeySnake = (criteriaToSnakeCase[criterio] || criterio) as keyof typeof CRITERIA_WEIGHTS[typeof categoryKey];
        
        const weight = (CRITERIA_WEIGHTS[categoryKey]?.[criteriaKeySnake] as number) || 1.0;

        criteriaScores.push({
          criterio,
          score_atual: scoreAtual,
          categoria,
          peso: weight,
          gap,
          priorityScore: gap * weight,
        });
      });

      const improvements = criteriaScores
        .sort((a, b) => b.priorityScore - a.priorityScore)
        .slice(0, 3)
        .map((item) => {
          const { priorityScore, criterio, categoria, score_atual, gap, peso } = item;
          const displayName = Object.entries(CRITERIA_MAP).find(
            ([, key]) => key === criterio
          )?.[0] || criterio;

          return {
            criterio: displayName,
            categoria: getCategoryDisplayName(categoria),
            score_atual,
            score_ideal: 5.0,
            gap,
            prioridade: gap > 2.0 ? 'alta' : gap > 1.0 ? 'média' : 'baixa',
            peso,
          };
        });

      const averageScore =
        callScoresData.length > 0
          ? callScoresData.reduce(
              (sum, score) => sum + (score.averageScore || 0),
              0
            ) / callScoresData.length
          : 0;

      return {
        id: userData.user.id,
        name: userData.user.name,
        email: userData.user.email,
        callScores: callScoresData,
        categoryAverages,
        topImprovements: improvements,
        averageScore,
        totalCalls: callScoresData.length,
      };
    });

    return NextResponse.json({ sdrs }, { status: 200 });
  } catch (error) {
    console.error('Error fetching coaching data:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dados de coaching' },
      { status: 500 }
    );
  }
}
