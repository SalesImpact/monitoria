import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organization: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Admins veem todas as organizações
    if (user.role === 'admin') {
      const allOrganizations = await prisma.organization.findMany({
        orderBy: { name: 'asc' },
      });
      return NextResponse.json(allOrganizations);
    }

    // Usuários não-admin veem apenas sua organização
    return NextResponse.json([user.organization]);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar organizações' },
      { status: 500 }
    );
  }
}

