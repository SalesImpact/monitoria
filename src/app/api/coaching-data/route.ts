import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sdrs = await prisma.sDR.findMany({
      include: {
        calls: {
          include: {
            scores: true,
          },
          orderBy: {
            date: 'desc',
          },
        },
      },
    });

    return NextResponse.json(sdrs);
  } catch (error) {
    console.error('Error fetching coaching data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coaching data' },
      { status: 500 }
    );
  }
}
