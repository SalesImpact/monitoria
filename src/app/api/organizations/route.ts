import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generateSlug } from '@/lib/utils';
import { randomBytes } from 'crypto';

export const dynamic = 'force-dynamic';

async function ensureUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.organization.findUnique({
      where: { slug },
    });

    if (!existing || existing.id === excludeId) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

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
    });

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem visualizar organizações.' },
        { status: 403 }
      );
    }

    const organizations = await prisma.organization.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    return NextResponse.json(organizations);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar organizações' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    });

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem criar organizações.' },
        { status: 403 }
      );
    }

    const { name } = await request.json();

    if (!name || typeof name !== 'string' || name.trim().length < 3) {
      return NextResponse.json(
        { error: 'Nome é obrigatório e deve ter no mínimo 3 caracteres' },
        { status: 400 }
      );
    }

    const baseSlug = generateSlug(name.trim());
    if (!baseSlug) {
      return NextResponse.json(
        { error: 'Nome inválido. Não foi possível gerar um slug válido.' },
        { status: 400 }
      );
    }

    const slug = await ensureUniqueSlug(baseSlug);
    const id = `cl${randomBytes(16).toString('hex')}`;

    const organization = await prisma.organization.create({
      data: {
        id,
        name: name.trim(),
        slug,
      },
    });

    return NextResponse.json(organization, { status: 201 });
  } catch (error: any) {
    console.error('Error creating organization:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Já existe uma organização com este slug' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao criar organização' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
    });

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem editar organizações.' },
        { status: 403 }
      );
    }

    const { id, name } = await request.json();

    if (!id || !name || typeof name !== 'string' || name.trim().length < 3) {
      return NextResponse.json(
        { error: 'ID e nome são obrigatórios. Nome deve ter no mínimo 3 caracteres' },
        { status: 400 }
      );
    }

    const existingOrg = await prisma.organization.findUnique({
      where: { id },
    });

    if (!existingOrg) {
      return NextResponse.json(
        { error: 'Organização não encontrada' },
        { status: 404 }
      );
    }

    const trimmedName = name.trim();
    let slug = existingOrg.slug;

    if (trimmedName !== existingOrg.name) {
      const baseSlug = generateSlug(trimmedName);
      if (!baseSlug) {
        return NextResponse.json(
          { error: 'Nome inválido. Não foi possível gerar um slug válido.' },
          { status: 400 }
        );
      }
      slug = await ensureUniqueSlug(baseSlug, id);
    }

    const organization = await prisma.organization.update({
      where: { id },
      data: {
        name: trimmedName,
        slug,
      },
    });

    return NextResponse.json(organization);
  } catch (error: any) {
    console.error('Error updating organization:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Organização não encontrada' },
        { status: 404 }
      );
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Já existe uma organização com este slug' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao atualizar organização' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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
    });

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem deletar organizações.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID é obrigatório' },
        { status: 400 }
      );
    }

    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: 'Organização não encontrada' },
        { status: 404 }
      );
    }

    if (organization._count.users > 0) {
      return NextResponse.json(
        { 
          error: `Não é possível deletar a organização. Existem ${organization._count.users} usuário(s) associado(s).` 
        },
        { status: 400 }
      );
    }

    await prisma.organization.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting organization:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Organização não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao deletar organização' },
      { status: 500 }
    );
  }
}

