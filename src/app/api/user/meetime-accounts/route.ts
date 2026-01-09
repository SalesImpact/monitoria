import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET - Listar associações do usuário logado
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const accounts = await prisma.userMeetimeAccount.findMany({
      where: { userId: session.user.id },
      include: {
        meetime_users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            module: true,
            active: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Converter BigInt para Number para serialização JSON
    const serializedAccounts = accounts.map(account => ({
      id: account.id,
      userId: account.userId,
      meetimeUserId: Number(account.meetimeUserId),
      createdAt: account.createdAt,
      meetimeUser: {
        id: Number(account.meetime_users.id),
        name: account.meetime_users.name,
        email: account.meetime_users.email,
        role: account.meetime_users.role,
        module: account.meetime_users.module,
        active: account.meetime_users.active
      }
    }));

    return NextResponse.json(serializedAccounts);
  } catch (error) {
    console.error('Error fetching Meetime accounts:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar contas Meetime' },
      { status: 500 }
    );
  }
}

// POST - Adicionar nova associação
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const { meetimeUserId } = await request.json();

    if (!meetimeUserId) {
      return NextResponse.json(
        { error: 'meetimeUserId é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o usuário Meetime existe e está ativo
    const meetimeUser = await prisma.meetime_users.findUnique({
      where: { id: BigInt(meetimeUserId) }
    });

    if (!meetimeUser) {
      return NextResponse.json(
        { error: 'Usuário Meetime não encontrado' },
        { status: 404 }
      );
    }

    if (!meetimeUser.active || meetimeUser.deleted_at) {
      return NextResponse.json(
        { error: 'Usuário Meetime inativo ou deletado' },
        { status: 400 }
      );
    }

    // Verificar se já existe associação
    const existingAccount = await prisma.userMeetimeAccount.findUnique({
      where: {
        userId_meetimeUserId: {
          userId: session.user.id,
          meetimeUserId: BigInt(meetimeUserId)
        }
      }
    });

    if (existingAccount) {
      return NextResponse.json(
        { error: 'Esta conta Meetime já está associada' },
        { status: 400 }
      );
    }

    // Criar associação
    const account = await prisma.userMeetimeAccount.create({
      data: {
        userId: session.user.id,
        meetimeUserId: BigInt(meetimeUserId)
      },
      include: {
        meetime_users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            module: true
          }
        }
      }
    });

    // Converter BigInt para Number para serialização JSON
    const serializedAccount = {
      id: account.id,
      userId: account.userId,
      meetimeUserId: Number(account.meetimeUserId),
      createdAt: account.createdAt,
      meetimeUser: {
        id: Number(account.meetime_users.id),
        name: account.meetime_users.name,
        email: account.meetime_users.email,
        role: account.meetime_users.role,
        module: account.meetime_users.module
      }
    };

    return NextResponse.json(serializedAccount, { status: 201 });
  } catch (error) {
    console.error('Error creating Meetime account association:', error);
    return NextResponse.json(
      { error: 'Erro ao associar conta Meetime' },
      { status: 500 }
    );
  }
}

// DELETE - Remover associação
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('id');

    if (!accountId) {
      return NextResponse.json(
        { error: 'ID da associação é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se a associação pertence ao usuário
    const account = await prisma.userMeetimeAccount.findUnique({
      where: { id: accountId }
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Associação não encontrada' },
        { status: 404 }
      );
    }

    if (account.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Sem permissão para remover esta associação' },
        { status: 403 }
      );
    }

    // Remover associação
    await prisma.userMeetimeAccount.delete({
      where: { id: accountId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting Meetime account association:', error);
    return NextResponse.json(
      { error: 'Erro ao remover associação' },
      { status: 500 }
    );
  }
}

