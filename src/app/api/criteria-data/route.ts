
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const [calls, sdrs] = await Promise.all([
      prisma.call.findMany({
        where: {
          scores: {
            isNot: null,
          },
        },
        include: {
          scores: true,
          sdr: true,
        },
      }),
      prisma.sDR.findMany({
        select: {
          id: true,
          name: true,
        },
      }),
    ]);

    return NextResponse.json({ calls, sdrs });
  } catch (error) {
    console.error('Erro ao buscar dados de critérios:', error);
    return NextResponse.json({ calls: [], sdrs: [] }, { status: 200 });
  }
}
