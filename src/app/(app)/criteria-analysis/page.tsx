import { prisma } from '@/lib/db';
import CriteriaAnalysisContent from '@/components/criteria-analysis-content';

export const dynamic = 'force-dynamic';

async function getCriteriaData() {
  try {
    const [callsWithScores, sdrs] = await Promise.all([
      prisma.$queryRawUnsafe<any[]>(`
        SELECT 
          c.id::text as id,
          c.date,
          c.user_id,
          c.user_name,
          mu.name as sdr_name,
          mcs.id as score_id,
          mcs.saudacao_apresentacao,
          mcs.apresentacao_empresa,
          mcs.solicitacao_confirmacao_nome,
          mcs.tom_voz,
          mcs.rapport,
          mcs.perguntas_validacao,
          mcs.escuta_ativa,
          mcs.pitch_solucao,
          mcs.historia_cliente,
          mcs.perguntas_situacao,
          mcs.perguntas_problema,
          mcs.perguntas_implicacao,
          mcs.perguntas_necessidade_solucao,
          mcs.confirmou_entendimento,
          mcs.vendeu_proximo_passo,
          mcs.agendou_concluiu,
          mcs.average_score,
          mcs.sentimento_geral,
          mcs.resultado
        FROM calls c
        INNER JOIN monitoria_call_scores mcs ON mcs.call_id = c.id::text
        LEFT JOIN meetime_users mu ON mu.id = c.user_id
        ORDER BY c.date DESC
      `),
      prisma.meetime_users.findMany({
        select: {
          id: true,
          name: true,
        },
        where: {
          active: true,
          deleted_at: null,
        },
      }),
    ]);

    const calls = callsWithScores.map((row: any) => ({
      id: row.id,
      sdrName: row.sdr_name || row.user_name || 'Desconhecido',
      client: '',
      date: row.date,
      averageScore: row.average_score,
      scores: row.score_id ? {
        saudacaoApresentacao: row.saudacao_apresentacao,
        apresentacaoEmpresa: row.apresentacao_empresa,
        solicitacaoConfirmacaoNome: row.solicitacao_confirmacao_nome,
        tomVoz: row.tom_voz,
        rapport: row.rapport,
        perguntasValidacao: row.perguntas_validacao,
        escutaAtiva: row.escuta_ativa,
        pitchSolucao: row.pitch_solucao,
        historiaCliente: row.historia_cliente,
        perguntasSituacao: row.perguntas_situacao,
        perguntasProblema: row.perguntas_problema,
        perguntasImplicacao: row.perguntas_implicacao,
        perguntasNecessidadeSolucao: row.perguntas_necessidade_solucao,
        confirmouEntendimento: row.confirmou_entendimento,
        vendeuProximoPasso: row.vendeu_proximo_passo,
        agendouConcluiu: row.agendou_concluiu,
      } : null,
      sdr: {
        name: row.sdr_name || row.user_name || 'Desconhecido',
      },
    }));

    const formattedSdrs = sdrs.map(sdr => ({
      id: sdr.id.toString(),
      name: sdr.name || 'Desconhecido',
    }));

    return { calls, sdrs: formattedSdrs };
  } catch (error) {
    console.error('Erro ao buscar dados de critérios:', error);
    return { calls: [], sdrs: [] };
  }
}

export default async function CriteriaAnalysisPage() {
  const { calls, sdrs } = await getCriteriaData();

  return <CriteriaAnalysisContent calls={calls} sdrs={sdrs} />;
}
