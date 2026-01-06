
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { DetectedObjection } from '@/lib/types';

type CallWithObjections = {
  id: string;
  sdrName: string;
  detectedObjections: unknown;
  result: string;
};

type SdrObjectionStats = {
  name: string;
  total: number;
  overcome: number;
  byType: Record<string, number>;
};

export async function GET() {
  try {
    const calls = await prisma.call.findMany({
      select: {
        id: true,
        sdrName: true,
        detectedObjections: true,
        result: true,
      },
    });

    const objectionsByType: Record<string, number> = {};
    const objectionsBySdr: Record<string, SdrObjectionStats> = {};
    const objectionOvercomeRate: Record<string, { total: number; overcome: number }> = {};
    let totalObjections = 0;
    let totalOvercome = 0;

    calls.forEach((call: CallWithObjections) => {
      const objections = (call.detectedObjections as DetectedObjection[]) || [];
      if (!objections || !Array.isArray(objections)) return;

      objections.forEach((obj: DetectedObjection) => {
        const type = obj.type || 'outros';
        
        // Conta por tipo
        objectionsByType[type] = (objectionsByType[type] || 0) + 1;
        totalObjections++;

        // Conta superadas
        if (obj.wasOvercome) {
          totalOvercome++;
        }

        // Taxa de superação por tipo
        if (!objectionOvercomeRate[type]) {
          objectionOvercomeRate[type] = { total: 0, overcome: 0 };
        }
        objectionOvercomeRate[type].total++;
        if (obj.wasOvercome) {
          objectionOvercomeRate[type].overcome++;
        }

        // Conta por SDR
        if (!objectionsBySdr[call.sdrName]) {
          objectionsBySdr[call.sdrName] = {
            name: call.sdrName,
            total: 0,
            overcome: 0,
            byType: {} as Record<string, number>,
          };
        }
        objectionsBySdr[call.sdrName].total++;
        if (obj.wasOvercome) {
          objectionsBySdr[call.sdrName].overcome++;
        }
        objectionsBySdr[call.sdrName].byType[type] = 
          (objectionsBySdr[call.sdrName].byType[type] || 0) + 1;
      });
    });

    const overcomeRate = totalObjections > 0 ? (totalOvercome / totalObjections) * 100 : 0;

    // Tipo mais comum
    const mostCommon = Object.entries(objectionsByType)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return NextResponse.json({
      totalObjections,
      totalOvercome,
      overcomeRate,
      mostCommon,
      objectionsByType,
      objectionOvercomeRate,
      objectionsBySdr: Object.values(objectionsBySdr).sort((a, b) => 
        (b.overcome / b.total) - (a.overcome / a.total)
      ),
    });
  } catch (error) {
    console.error('Erro ao buscar dados de objeções:', error);
    return NextResponse.json({
      totalObjections: 0,
      totalOvercome: 0,
      overcomeRate: 0,
      mostCommon: 'N/A',
      objectionsByType: {},
      objectionOvercomeRate: {},
      objectionsBySdr: [],
    }, { status: 200 });
  }
}
