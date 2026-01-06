
import { prisma } from '@/lib/db';
import CallMonitoring from '@/components/call-monitoring';
import { SentimentAnalysis, SentimentJourneyPoint, DetectedTopic, DetectedKeyword } from '@/lib/types';

export const dynamic = 'force-dynamic';

async function getCallsData() {
  try {
    const callsResult = await prisma.call.findMany({
      include: {
        scores: true,
        sdr: true,
        keywords: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    type CallType = typeof callsResult[0];

    return callsResult.map((call: CallType) => ({
      ...call,
      sentimentAnalysis: (call.sentimentAnalysis as SentimentAnalysis | null) || undefined,
      sentimentJourney: (call.sentimentJourney as SentimentJourneyPoint[] | null) || undefined,
      detectedTopics: (call.detectedTopics as DetectedTopic[] | null) || undefined,
      detectedKeywords: (call.detectedKeywords as DetectedKeyword[] | null) || undefined,
    }));
  } catch (error) {
    console.error('Erro ao buscar dados de monitoramento:', error);
    // Return empty array on database connection error
    return [];
  }
}

export default async function MonitoringPage() {
  const calls = await getCallsData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark">Monitoria de Ligações</h1>
          <p className="text-gray-600 mt-1">
            Análise detalhada e reprodução das ligações gravadas
          </p>
        </div>
      </div>

      <CallMonitoring calls={calls} />
    </div>
  );
}
