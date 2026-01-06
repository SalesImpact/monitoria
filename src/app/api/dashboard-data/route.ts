
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const [calls, sdrs, callsWithScores] = await Promise.all([
      prisma.call.findMany({
        include: {
          scores: true,
          sdr: true,
        },
        orderBy: {
          date: 'desc',
        },
      }),
      prisma.sDR.findMany({
        include: {
          calls: {
            include: {
              scores: true,
            },
          },
        },
      }),
      prisma.call.findMany({
        where: {
          averageScore: {
            not: null,
          },
        },
        include: {
          scores: true,
          sdr: true,
        },
      }),
    ]);

    // Calcular estatísticas
    const totalCalls = calls.length;
    const avgScore = totalCalls > 0 
      ? calls.reduce((acc: number, call: typeof calls[0]) => acc + (call.averageScore || 0), 0) / totalCalls
      : 0;
    const successfulCalls = calls.filter((c: typeof calls[0]) => c.result === 'agendado').length;
    const successRate = totalCalls > 0 ? (successfulCalls / totalCalls) * 100 : 0;

    return NextResponse.json({
      calls,
      sdrs,
      callsWithScores,
      stats: {
        totalCalls,
        avgScore,
        successRate,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    // Return empty data structure instead of error to prevent frontend crashes
    return NextResponse.json({
      calls: [],
      sdrs: [],
      callsWithScores: [],
      stats: {
        totalCalls: 0,
        avgScore: 0,
        successRate: 0,
      },
    }, { status: 200 });
  }
}
