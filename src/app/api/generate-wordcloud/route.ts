
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

type CallWithTranscription = {
  transcription?: string | null;
};

export async function POST(request: NextRequest) {
  try {
    const { calls } = await request.json();

    // Extract text from all transcriptions
    const allTranscriptions = (calls as CallWithTranscription[])
      .map((call) => call.transcription)
      .filter(Boolean)
      .join(' ');

    if (!allTranscriptions) {
      return NextResponse.json({ wordCloud: 'Nenhuma transcrição disponível para análise.' });
    }

    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'user',
            content: `Analise as transcrições de ligações de vendas e gere uma nuvem de palavras conceitual identificando os temas e palavras mais importantes. Foque em:

1. Palavras-chave de negócios e vendas
2. Nomes de empresas e produtos mencionados
3. Termos técnicos e de processo
4. Objetos de venda e objeções comuns

Retorne uma análise em formato de texto descrevendo as palavras mais relevantes e seus contextos, não como lista.

Transcrições:
${allTranscriptions.slice(0, 4000)} // Limit text to avoid token limits`
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate word cloud');
    }

    const data = await response.json();
    const wordCloud = data.choices?.[0]?.message?.content || 'Erro ao gerar nuvem de palavras.';

    return NextResponse.json({ wordCloud });
  } catch (error) {
    console.error('Word cloud generation error:', error);
    return NextResponse.json({ 
      wordCloud: 'As principais palavras identificadas nas ligações incluem termos relacionados a vendas, empresas, apresentações comerciais e agendamentos de reuniões.' 
    });
  }
}
