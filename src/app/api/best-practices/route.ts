import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { BestPracticeExample } from '@/lib/types';

function getCategoryForCriteria(criterio: string): string {
  const categories: { [key: string]: string } = {
    'saudacaoApresentacao': 'Abertura',
    'apresentacaoEmpresa': 'Abertura',
    'solicitacaoConfirmacaoNome': 'Abertura',
    'tomVoz': 'Abertura',
    'rapport': 'Abertura',
    'perguntasValidacao': 'Validação de Objetivo',
    'escutaAtiva': 'Validação de Objetivo',
    'pitchSolucao': 'Validação de Objetivo',
    'historiaCliente': 'Validação de Objetivo',
    'perguntasSituacao': 'SPIN Selling',
    'perguntasProblema': 'SPIN Selling',
    'perguntasImplicacao': 'SPIN Selling',
    'perguntasNecessidadeSolucao': 'SPIN Selling',
    'confirmouEntendimento': 'Próximos Passos',
    'vendeuProximoPasso': 'Próximos Passos',
    'agendouConcluiu': 'Próximos Passos',
  };
  return categories[criterio] || 'Outros';
}

function formatCriteriaName(criterio: string): string {
  const names: { [key: string]: string } = {
    'saudacaoApresentacao': 'Saudação e Apresentação',
    'apresentacaoEmpresa': 'Apresentação da Empresa',
    'solicitacaoConfirmacaoNome': 'Confirmação do Nome',
    'tomVoz': 'Tom de Voz',
    'rapport': 'Rapport',
    'perguntasValidacao': 'Perguntas de Validação',
    'escutaAtiva': 'Escuta Ativa',
    'pitchSolucao': 'Pitch da Solução',
    'historiaCliente': 'História do Cliente',
    'perguntasSituacao': 'Perguntas de Situação (SPIN)',
    'perguntasProblema': 'Perguntas de Problema (SPIN)',
    'perguntasImplicacao': 'Perguntas de Implicação (SPIN)',
    'perguntasNecessidadeSolucao': 'Perguntas de Necessidade (SPIN)',
    'confirmouEntendimento': 'Confirmação de Entendimento',
    'vendeuProximoPasso': 'Venda do Próximo Passo',
    'agendouConcluiu': 'Agendamento/Conclusão',
  };
  return names[criterio] || criterio;
}

function generateExplanation(criterio: string, score: number): string {
  const explanations: { [key: string]: string } = {
    'rapport': 'SDR demonstrou excelente capacidade de criar conexão genuína com o prospect, usando técnicas de espelhamento e demonstrando interesse real.',
    'perguntasSituacao': 'Perguntas de situação bem estruturadas que revelaram o contexto completo do prospect.',
    'perguntasProblema': 'Identificação precisa das dores e desafios do prospect através de perguntas direcionadas.',
    'perguntasImplicacao': 'Expandiu o impacto percebido do problema, fazendo o prospect refletir sobre as consequências.',
    'escutaAtiva': 'Demonstrou escuta ativa exemplar, fazendo pausas, parafraseando e validando o que foi dito.',
    'agendouConcluiu': 'Fechamento impecável com confirmação clara de próximos passos e agendamento efetivo.',
  };
  return explanations[criterio] || `Execução exemplar deste critério com pontuação ${score}/5.`;
}

function generateTags(criterio: string, categoria: string): string[] {
  const baseTags = [categoria];
  
  const criterioTags: { [key: string]: string[] } = {
    'rapport': ['Conexão', 'Empatia', 'Relacionamento'],
    'perguntasSituacao': ['SPIN', 'Descoberta', 'Contexto'],
    'perguntasProblema': ['SPIN', 'Dores', 'Desafios'],
    'perguntasImplicacao': ['SPIN', 'Valor', 'Impacto'],
    'escutaAtiva': ['Comunicação', 'Atenção', 'Validação'],
    'agendouConcluiu': ['Fechamento', 'Próximos Passos', 'Compromisso'],
  };
  
  return [...baseTags, ...(criterioTags[criterio] || [])];
}

export async function GET() {
  try {
    const calls = await prisma.call.findMany({
      where: {
        averageScore: {
          gte: 4.0,
        },
      },
      include: {
        scores: true,
        sdr: true,
      },
      orderBy: {
        averageScore: 'desc',
      },
      take: 10,
    });

    const examples: BestPracticeExample[] = [];

    calls.forEach((call: typeof calls[0]) => {
      if (!call.scores) return;

      const highScoreCriteria: { [key: string]: number } = {};

      Object.entries(call.scores).forEach(([key, value]) => {
        if (typeof value === 'number' && value >= 4 && key !== 'id' && key !== 'callId') {
          highScoreCriteria[key] = value;
        }
      });

      Object.entries(highScoreCriteria).forEach(([criterio, score]) => {
        const transcriptionLines = call.transcription?.split('\n') || [];
        const relevantLines = transcriptionLines.slice(0, 10);
        
        examples.push({
          id: `${call.id}_${criterio}`,
          call_id: call.id,
          sdr_name: call.sdrName,
          criterio: formatCriteriaName(criterio),
          categoria: getCategoryForCriteria(criterio),
          score: score,
          trecho_transcricao: relevantLines.join('\n'),
          timestamp_inicio: 0,
          timestamp_fim: 0,
          audio_url: call.audioFile || undefined,
          explicacao: generateExplanation(criterio, score),
          tags: generateTags(criterio, getCategoryForCriteria(criterio)),
        });
      });
    });

    // Agrupa por categoria
    const categorizedExamples: { [key: string]: BestPracticeExample[] } = {};
    examples.forEach(example => {
      if (!categorizedExamples[example.categoria]) {
        categorizedExamples[example.categoria] = [];
      }
      categorizedExamples[example.categoria].push(example);
    });

    return NextResponse.json({ examples, categorizedExamples });
  } catch (error) {
    console.error('Erro ao buscar exemplos:', error);
    return NextResponse.json({ 
      examples: [], 
      categorizedExamples: {} 
    }, { status: 200 });
  }
}
