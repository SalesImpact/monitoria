import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const callId = parseInt(params.id);
    
    if (isNaN(callId)) {
      return NextResponse.json(
        { error: 'ID da ligação inválido' },
        { status: 400 }
      );
    }

    // Buscar transcrição da call usando Prisma
    const transcription = await prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        ct.transcription_text,
        ct.transcription_segments,
        ct.transcription_language,
        ct.word_count,
        ct.confidence_score
      FROM call_transcriptions ct
      WHERE ct.call_id = ${callId}
      LIMIT 1
    `);

    if (!transcription || transcription.length === 0) {
      return NextResponse.json({
        transcriptionText: null,
        transcriptionSegments: null,
        transcriptionLanguage: null,
        wordCount: null,
        confidenceScore: null
      });
    }

    const trans = transcription[0];

    return NextResponse.json({
      transcriptionText: trans.transcription_text || null,
      transcriptionSegments: trans.transcription_segments || null,
      transcriptionLanguage: trans.transcription_language || null,
      wordCount: trans.word_count ? Number(trans.word_count) : null,
      confidenceScore: trans.confidence_score ? Number(trans.confidence_score) : null
    });
  } catch (error) {
    console.error('Error fetching transcription:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar transcrição' },
      { status: 500 }
    );
  }
}

