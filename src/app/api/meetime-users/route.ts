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

    const meetimeUsers = await prisma.meetime_users.findMany({
      where: { 
        active: true, 
        deleted_at: null 
      },
      orderBy: { name: 'asc' },
      select: { 
        id: true, 
        name: true, 
        email: true,
        role: true,
        module: true
      }
    });

    // Converter BigInt para Number para serialização JSON
    const serializedUsers = meetimeUsers.map(user => ({
      ...user,
      id: Number(user.id)
    }));

    return NextResponse.json(serializedUsers);
  } catch (error) {
    console.error('Error fetching Meetime users:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar usuários do Meetime' },
      { status: 500 }
    );
  }
}

