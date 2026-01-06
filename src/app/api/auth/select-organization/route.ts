import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const { organizationId } = await request.json();

    if (!organizationId) {
      return NextResponse.json(
        { error: 'organizationId é obrigatório' },
        { status: 400 }
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

    // Admins podem selecionar qualquer organização
    if (user.role !== 'admin') {
      if (user.organizationId !== organizationId) {
        return NextResponse.json(
          { error: 'Usuário não pertence a esta organização' },
          { status: 403 }
        );
      }
    } else {
      // Verificar se a organização existe
      const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
      });

      if (!organization) {
        return NextResponse.json(
          { error: 'Organização não encontrada' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      organizationId,
      message: 'Organização selecionada com sucesso',
    });
  } catch (error) {
    console.error('Error selecting organization:', error);
    return NextResponse.json(
      { error: 'Erro ao selecionar organização' },
      { status: 500 }
    );
  }
}

