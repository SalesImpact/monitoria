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
  return NextResponse.json({ 
    examples: [], 
    categorizedExamples: {} 
  }, { status: 200 });
}
