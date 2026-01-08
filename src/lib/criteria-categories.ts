export type CategoryKey = 'abertura' | 'validacao_objetivo' | 'spin_selling' | 'proximos_passos';

export type CriteriaKey =
  | 'saudacaoApresentacao'
  | 'apresentacaoEmpresa'
  | 'solicitacaoConfirmacaoNome'
  | 'tomVoz'
  | 'rapport'
  | 'perguntasValidacao'
  | 'escutaAtiva'
  | 'pitchSolucao'
  | 'historiaCliente'
  | 'perguntasSituacao'
  | 'perguntasProblema'
  | 'perguntasImplicacao'
  | 'perguntasNecessidadeSolucao'
  | 'confirmouEntendimento'
  | 'vendeuProximoPasso'
  | 'agendouConcluiu';

export const CATEGORY_CRITERIA_MAP: Record<CategoryKey, CriteriaKey[]> = {
  abertura: [
    'saudacaoApresentacao',
    'apresentacaoEmpresa',
    'solicitacaoConfirmacaoNome',
    'tomVoz',
    'rapport',
  ],
  validacao_objetivo: [
    'perguntasValidacao',
    'escutaAtiva',
    'pitchSolucao',
    'historiaCliente',
  ],
  spin_selling: [
    'perguntasSituacao',
    'perguntasProblema',
    'perguntasImplicacao',
    'perguntasNecessidadeSolucao',
  ],
  proximos_passos: [
    'confirmouEntendimento',
    'vendeuProximoPasso',
    'agendouConcluiu',
  ],
};

export const CRITERIA_TO_CATEGORY: Record<CriteriaKey, CategoryKey> = {
  saudacaoApresentacao: 'abertura',
  apresentacaoEmpresa: 'abertura',
  solicitacaoConfirmacaoNome: 'abertura',
  tomVoz: 'abertura',
  rapport: 'abertura',
  perguntasValidacao: 'validacao_objetivo',
  escutaAtiva: 'validacao_objetivo',
  pitchSolucao: 'validacao_objetivo',
  historiaCliente: 'validacao_objetivo',
  perguntasSituacao: 'spin_selling',
  perguntasProblema: 'spin_selling',
  perguntasImplicacao: 'spin_selling',
  perguntasNecessidadeSolucao: 'spin_selling',
  confirmouEntendimento: 'proximos_passos',
  vendeuProximoPasso: 'proximos_passos',
  agendouConcluiu: 'proximos_passos',
};

export const CATEGORY_DISPLAY_NAMES: Record<CategoryKey, string> = {
  abertura: 'Abertura',
  validacao_objetivo: 'Validação do Objetivo',
  spin_selling: 'SPIN Selling',
  proximos_passos: 'Próximos Passos',
};

export function getCategoryForCriteria(criteria: string): CategoryKey {
  return CRITERIA_TO_CATEGORY[criteria as CriteriaKey] || 'abertura';
}

export function getCategoryDisplayName(category: CategoryKey): string {
  return CATEGORY_DISPLAY_NAMES[category];
}

export function calculateCategoryAverage(
  callScores: Array<Record<string, any>>,
  category: CategoryKey
): number {
  const criteria = CATEGORY_CRITERIA_MAP[category];
  const allScores: number[] = [];

  callScores.forEach((score) => {
    criteria.forEach((criterion) => {
      const value = score[criterion];
      if (typeof value === 'number' && !isNaN(value)) {
        allScores.push(value);
      }
    });
  });

  if (allScores.length === 0) return 0;
  return allScores.reduce((sum, val) => sum + val, 0) / allScores.length;
}

export function getCategoryWeight(category: CategoryKey): number {
  const weights: Record<CategoryKey, number> = {
    abertura: 1.0,
    validacao_objetivo: 1.5,
    spin_selling: 2.5,
    proximos_passos: 2.3,
  };
  return weights[category] || 1.0;
}

