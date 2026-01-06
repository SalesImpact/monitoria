import { prisma } from '@/lib/db';
import CriteriaAnalysisContent from '@/components/criteria-analysis-content';

export const dynamic = 'force-dynamic';

async function getCriteriaData() {
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

    return { calls, sdrs };
  } catch (error) {
    console.error('Erro ao buscar dados de critérios:', error);
    return { calls: [], sdrs: [] };
  }
}

export default async function CriteriaAnalysisPage() {
  const { calls, sdrs } = await getCriteriaData();

  return <CriteriaAnalysisContent calls={calls} sdrs={sdrs} />;
}
