
import { NextRequest, NextResponse } from 'next/server';
import { SimulationMessage } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { persona, conversationHistory, sdrMessage } = await request.json();

    // Constrói o contexto da conversa
    const systemPrompt = `Você é ${persona.name}, ${persona.role} na ${persona.company}.

Sua personalidade é: ${persona.personality}
Suas principais dores são: ${persona.painPoints.join(', ')}
Você tende a levantar objeções sobre: ${persona.objections.join(', ')}

Comportamento esperado baseado na personalidade:
${persona.personality === 'receptivo' ? '- Seja aberto e interessado\n- Faça perguntas construtivas\n- Demonstre entusiasmo quando algo faz sentido' : ''}
${persona.personality === 'cético' ? '- Questione tudo\n- Peça provas e exemplos concretos\n- Seja desconfiado inicialmente' : ''}
${persona.personality === 'apressado' ? '- Seja breve e direto\n- Mostre impaciência com detalhes desnecessários\n- Interrompa se a conversa não for objetiva' : ''}

Responda de forma natural e realista, como um executivo brasileiro responderia. Use no máximo 2-3 frases por resposta.`;

    // Converte histórico para formato da API
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory as SimulationMessage[]).map((msg) => ({
        role: msg.role === 'sdr' ? 'user' : 'assistant',
        content: msg.content,
      })),
      { role: 'user', content: sdrMessage },
    ];

    // Chama a API LLM
    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: messages,
        max_tokens: 150,
        temperature: 0.8,
      }),
    });

    const data = await response.json();
    const clientResponse = data.choices[0]?.message?.content || 'Desculpe, não entendi.';

    // Determina se a conversa deve terminar (após 10 mensagens ou se houve fechamento)
    const shouldEnd = conversationHistory.length >= 10 || 
      clientResponse.toLowerCase().includes('agendar') ||
      clientResponse.toLowerCase().includes('não tenho interesse');

    return NextResponse.json({
      clientResponse,
      shouldEnd,
      feedback: shouldEnd ? {
        overall: Math.floor(Math.random() * 20) + 70,
        strengths: [
          'Boa abertura e apresentação',
          'Usou perguntas abertas',
          'Manteve profissionalismo',
        ],
        improvements: [
          'Poderia explorar mais a dor do cliente',
          'Fechamento poderia ser mais assertivo',
        ],
        criteriaScores: {
          abertura: 4,
          spin: 3,
          fechamento: 3,
        },
      } : null,
    });
  } catch (error) {
    console.error('Erro no simulador:', error);
    return NextResponse.json(
      { error: 'Erro ao processar simulação' },
      { status: 500 }
    );
  }
}
