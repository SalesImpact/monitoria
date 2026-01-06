
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const sdrs = await prisma.sDR.findMany({
      include: {
        calls: {
          include: {
            scores: true,
            keywords: true,
          },
          orderBy: {
            date: 'desc',
          },
        },
      },
    });

    return NextResponse.json({ sdrs });
  } catch (error) {
    console.error('Erro ao buscar dados de SDRs:', error);
    return NextResponse.json({ sdrs: [] }, { status: 200 });
  }
}
