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
    let whereCondition = 'TRUE';
    if (whereClause.userId && whereClause.userId.in) {
      const userIds = whereClause.userId.in.map(id => id.toString()).join(',');
      whereCondition = `c.user_id IN (${userIds})`;
    }

    // Buscar calls com paginação e projeto (cliente) via cadência
    // Join: calls -> activities -> leads -> prospections -> cadences -> projects
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
        p.name as project_name
      FROM calls c
      LEFT JOIN meetime_users mu ON mu.id = c.user_id
      LEFT JOIN activities a ON a.call_id = c.id
      LEFT JOIN leads l ON l.id = a.lead_id
      LEFT JOIN prospections pr ON (pr.id = l.current_prospection_id OR pr.lead_id = l.id)
      LEFT JOIN cadences cad ON cad.id = pr.cadence_id
      LEFT JOIN projects p ON p.id = cad.project_id
      WHERE ${whereCondition}
      ORDER BY c.id, c.date DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `);

    // Contar total de calls
    const totalResult = await prisma.$queryRawUnsafe<[{ count: bigint }]>(`
      SELECT COUNT(DISTINCT c.id) as count
      FROM calls c
      WHERE ${whereCondition}
    `);
    const total = Number(totalResult[0]?.count || 0);

    // Converter BigInt para Number para serialização JSON
    const serializedCalls = callsWithProject.map((call: any) => ({
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
      meetimeUser: call.meetime_user_id ? {
        id: Number(call.meetime_user_id),
        name: call.meetime_user_name,
        email: call.meetime_user_email
      } : null,
      projectName: call.project_name || null
    }));

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

