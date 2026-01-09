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

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter'); // 'my-calls' | 'all'
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;
    
    // Filtros adicionais
    const sdrFilter = searchParams.get('sdr');
    const resultFilter = searchParams.get('result');
    const sentimentFilter = searchParams.get('sentiment');
    const typeFilter = searchParams.get('type');

    // Sempre buscar apenas calls de usuários Meetime associados a usuários cadastrados
    // Buscar todos os IDs Meetime que estão associados a usuários do sistema
    const allAssociatedAccounts = await prisma.userMeetimeAccount.findMany({
      select: { meetimeUserId: true },
      distinct: ['meetimeUserId']
    });

    const associatedMeetimeUserIds = allAssociatedAccounts.map(a => a.meetimeUserId);

    // Se não houver nenhuma associação no sistema, retornar vazio
    if (associatedMeetimeUserIds.length === 0) {
      return NextResponse.json({
        calls: [],
        total: 0,
        hasAccounts: false,
        filter: filter || 'all',
        limit,
        offset
      });
    }

    let whereClause: any = {
      userId: { in: associatedMeetimeUserIds }
    };

    let hasAccounts = true;
    
    if (filter === 'my-calls') {
      // Buscar IDs Meetime do usuário logado
      const userAccounts = await prisma.userMeetimeAccount.findMany({
        where: { userId: session.user.id },
        select: { meetimeUserId: true }
      });

      if (userAccounts.length === 0) {
        // Usuário não tem contas Meetime associadas
        return NextResponse.json({
          calls: [],
          total: 0,
          hasAccounts: false,
          filter: 'my-calls',
          limit,
          offset
        });
      }

      // Filtrar calls apenas pelos user_id do Meetime do usuário logado
      whereClause = {
        userId: { in: userAccounts.map(a => a.meetimeUserId) }
      };
    }
    // Se filter === 'all', já está filtrado por associatedMeetimeUserIds acima

    // Construir condição WHERE para a query SQL
    let whereConditions: string[] = [];
    
    // Filtro de usuários
    if (whereClause.userId && whereClause.userId.in) {
      const userIds = whereClause.userId.in.map((id: number) => id.toString()).join(',');
      whereConditions.push(`c.user_id IN (${userIds})`);
    }
    
    // Filtro de SDR (nome do usuário)
    if (sdrFilter && sdrFilter !== 'all') {
      const escapedSdr = sdrFilter.replace(/'/g, "''");
      whereConditions.push(`(mu.name = '${escapedSdr}' OR c.user_name = '${escapedSdr}')`);
    }
    
    // Filtro de Resultado
    if (resultFilter && resultFilter !== 'all') {
      const escapedResult = resultFilter.replace(/'/g, "''");
      whereConditions.push(`mcs.resultado = '${escapedResult}'`);
    }
    
    // Filtro de Sentimento
    if (sentimentFilter && sentimentFilter !== 'all') {
      const escapedSentiment = sentimentFilter.replace(/'/g, "''");
      whereConditions.push(`mcs.sentimento_geral = '${escapedSentiment}'`);
    }
    
    // Filtro de Tipo
    if (typeFilter && typeFilter !== 'all') {
      const escapedType = typeFilter.replace(/'/g, "''");
      whereConditions.push(`c.call_type = '${escapedType}'`);
    }
    
    const whereCondition = whereConditions.length > 0 ? whereConditions.join(' AND ') : 'TRUE';

    // Buscar calls com paginação e projeto (cliente) via cadência
    // Join: calls -> activities -> leads -> prospections -> cadences -> projects
    // Join: calls -> monitoria_call_scores (para scores, sentimento e resultado)
    const callsWithProject = await prisma.$queryRawUnsafe<any[]>(`
      SELECT DISTINCT ON (c.id)
        c.id,
        c.date,
        c.user_id,
        c.user_name,
        c.receiver_phone,
        c.connected_duration_seconds,
        c.status,
        c.call_type,
        c.call_link,
        c.stored_audio_url,
        c.stored_audio_filename,
        c.audio_duration_seconds,
        c.created_at,
        mu.id as meetime_user_id,
        mu.name as meetime_user_name,
        mu.email as meetime_user_email,
        p.name as project_name,
        mcs.average_score,
        mcs.sentimento_geral,
        mcs.resultado,
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
        mcs.nivel_engajamento_cliente,
        mcs.confianca_sdr,
        mcs.ai_feedback,
        mcs.sentimento_cliente,
        mcs.sentimento_sdr
      FROM calls c
      LEFT JOIN meetime_users mu ON mu.id = c.user_id
      LEFT JOIN activities a ON a.call_id = c.id
      LEFT JOIN leads l ON l.id = a.lead_id
      LEFT JOIN prospections pr ON (pr.id = l.current_prospection_id OR pr.lead_id = l.id)
      LEFT JOIN cadences cad ON cad.id = pr.cadence_id
      LEFT JOIN projects p ON p.id = cad.project_id
      LEFT JOIN monitoria_call_scores mcs ON mcs.call_id = c.id::text
      WHERE ${whereCondition}
      ORDER BY c.id, c.date DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `);

    // Contar total de calls (aplicando os mesmos filtros)
    const totalResult = await prisma.$queryRawUnsafe<[{ count: bigint }]>(`
      SELECT COUNT(DISTINCT c.id) as count
      FROM calls c
      LEFT JOIN meetime_users mu ON mu.id = c.user_id
      LEFT JOIN monitoria_call_scores mcs ON mcs.call_id = c.id::text
      WHERE ${whereCondition}
    `);
    const total = Number(totalResult[0]?.count || 0);

    // Converter BigInt para Number para serialização JSON
    const serializedCalls = callsWithProject.map((call: any) => {
      // Verificar se há scores disponíveis
      const hasScores = call.average_score !== null && call.average_score !== undefined;
      
      return {
        id: Number(call.id),
        date: call.date,
        userId: call.user_id ? Number(call.user_id) : null,
        userName: call.user_name,
        receiverPhone: call.receiver_phone,
        connectedDurationSeconds: call.connected_duration_seconds,
        status: call.status,
        callType: call.call_type,
        callLink: call.call_link,
        storedAudioUrl: call.stored_audio_url,
        storedAudioFilename: call.stored_audio_filename,
        audioDurationSeconds: call.audio_duration_seconds,
        createdAt: call.created_at,
        averageScore: call.average_score ? Number(call.average_score) : null,
        sentimentoGeral: call.sentimento_geral || null,
        sentimentoCliente: call.sentimento_cliente || null,
        sentimentoSdr: call.sentimento_sdr || null,
        resultado: call.resultado || null,
        meetimeUser: call.meetime_user_id ? {
          id: Number(call.meetime_user_id),
          name: call.meetime_user_name,
          email: call.meetime_user_email
        } : null,
        projectName: call.project_name || null,
        // Incluir scores completos se disponíveis
        scores: hasScores ? {
          saudacaoApresentacao: call.saudacao_apresentacao ? Number(call.saudacao_apresentacao) : 0,
          apresentacaoEmpresa: call.apresentacao_empresa ? Number(call.apresentacao_empresa) : 0,
          solicitacaoConfirmacaoNome: call.solicitacao_confirmacao_nome ? Number(call.solicitacao_confirmacao_nome) : 0,
          tomVoz: call.tom_voz ? Number(call.tom_voz) : 0,
          rapport: call.rapport ? Number(call.rapport) : 0,
          perguntasValidacao: call.perguntas_validacao ? Number(call.perguntas_validacao) : 0,
          escutaAtiva: call.escuta_ativa ? Number(call.escuta_ativa) : 0,
          pitchSolucao: call.pitch_solucao ? Number(call.pitch_solucao) : 0,
          historiaCliente: call.historia_cliente ? Number(call.historia_cliente) : 0,
          perguntasSituacao: call.perguntas_situacao ? Number(call.perguntas_situacao) : 0,
          perguntasProblema: call.perguntas_problema ? Number(call.perguntas_problema) : 0,
          perguntasImplicacao: call.perguntas_implicacao ? Number(call.perguntas_implicacao) : 0,
          perguntasNecessidadeSolucao: call.perguntas_necessidade_solucao ? Number(call.perguntas_necessidade_solucao) : 0,
          confirmouEntendimento: call.confirmou_entendimento ? Number(call.confirmou_entendimento) : 0,
          vendeuProximoPasso: call.vendeu_proximo_passo ? Number(call.vendeu_proximo_passo) : 0,
          agendouConcluiu: call.agendou_concluiu ? Number(call.agendou_concluiu) : 0,
          nivelEngajamentoCliente: call.nivel_engajamento_cliente ? Number(call.nivel_engajamento_cliente) : null,
          confiancaSdr: call.confianca_sdr ? Number(call.confianca_sdr) : null,
          aiFeedback: call.ai_feedback || null
        } : null
      };
    });

    return NextResponse.json({
      calls: serializedCalls,
      total,
      hasAccounts,
      filter: filter || 'all',
      limit,
      offset
    });
  } catch (error) {
    console.error('Error fetching calls:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar ligações' },
      { status: 500 }
    );
  }
}

