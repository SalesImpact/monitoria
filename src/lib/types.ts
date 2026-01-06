// ====================================
// PONDERAÇÃO DE CRITÉRIOS
// ====================================
export const CRITERIA_WEIGHTS = {
  abertura: {
    saudacao_apresentacao: 1.0,
    apresentacao_empresa: 1.0,
    solicitacao_confirmacao_nome: 1.0,
    tom_voz: 1.2,
    rapport: 1.3,
  },
  validacao_objetivo: {
    perguntas_validacao: 1.5,
    escuta_ativa: 1.8,
    pitch_solucao: 1.4,
    historia_cliente: 1.5,
  },
  spin_selling: {
    perguntas_situacao: 2.5,  // SPIN Selling tem peso MUITO maior
    perguntas_problema: 2.8,
    perguntas_implicacao: 3.0,
    perguntas_necessidade_solucao: 3.0,
  },
  proximos_passos: {
    confirmou_entendimento: 2.2,  // Próximos Passos também tem peso maior
    vendeu_proximo_passo: 2.5,
    agendou_concluiu: 2.8,
  },
  sentimento: {
    nivel_engajamento_cliente: 1.8,
    confianca_sdr: 1.6,
  },
} as const;

// ====================================
// ANÁLISE DE SENTIMENTO E EMOÇÕES
// ====================================
export type SentimentType = 'positivo' | 'neutro' | 'negativo' | 'entusiasmado' | 'frustrado' | 'confiante' | 'inseguro';

export type SentimentAnalysis = {
  overall: SentimentType;
  client: SentimentType;
  sdr: SentimentType;
  confidence: number; // 0-100
  emotionalTone: string; // descrição textual
};

export type SentimentJourneyPoint = {
  timestamp: number; // segundos desde o início
  sentiment: SentimentType;
  intensity: number; // 0-100
  speaker: 'client' | 'sdr';
  text?: string;
};

// ====================================
// TOPIC MODELING (DETECÇÃO DE TÓPICOS)
// ====================================
export type TopicCategory = 
  | 'preço'
  | 'concorrência'
  | 'funcionalidades'
  | 'prazos'
  | 'contratos'
  | 'suporte'
  | 'implementação'
  | 'resultados'
  | 'dúvidas_técnicas'
  | 'objeções'
  | 'benefícios'
  | 'comparações'
  | 'urgência'
  | 'tomada_decisão';

export type DetectedTopic = {
  category: TopicCategory;
  mentions: number;
  relevance: number; // 0-100
  keywords: string[];
  firstMentionAt: number; // segundos
};

// ====================================
// PALAVRAS-CHAVE
// ====================================
export type KeywordType = 'positive' | 'negative' | 'neutral';

export type DetectedKeyword = {
  word: string;
  type: KeywordType;
  count: number;
  context: string[];
  sentiment_impact: number; // -100 a +100
};

// Palavras-chave pré-definidas para monitoramento
export const MONITORED_KEYWORDS = {
  positive: [
    'excelente', 'perfeito', 'ótimo', 'maravilhoso', 'concordo',
    'interessante', 'adorei', 'impressionante', 'incrível', 'sucesso',
    'resultado', 'eficiente', 'rápido', 'fácil', 'prático'
  ],
  negative: [
    'caro', 'difícil', 'complicado', 'problema', 'preocupado',
    'ruim', 'insatisfeito', 'lento', 'confuso', 'incerto',
    'dúvida', 'receio', 'não funciona', 'decepcionado', 'frustrado'
  ],
  neutral: [
    'talvez', 'pensar', 'avaliar', 'considerar', 'analisar',
    'verificar', 'conferir', 'estudar', 'consultar', 'equipe'
  ]
} as const;

// ====================================
// COACHING E TREINAMENTO
// ====================================
export type ImprovementArea = {
  criterio: string;
  categoria: string;
  score_atual: number;
  score_ideal: number;
  gap: number;
  prioridade: 'alta' | 'média' | 'baixa';
  descricao: string;
};

export type MicroTraining = {
  id: string;
  titulo: string;
  tipo: 'vídeo' | 'artigo' | 'exemplo' | 'role-play';
  duracao_minutos: number;
  url?: string;
  descricao: string;
  criterios_relacionados: string[];
  nivel: 'iniciante' | 'intermediário' | 'avançado';
};

export type CoachingRecommendation = {
  sdr_name: string;
  top_3_melhorias: ImprovementArea[];
  micro_trainings_sugeridos: MicroTraining[];
  role_plays_sugeridos: RolePlayScenario[];
  progresso_ultimos_30_dias: {
    criterio: string;
    evolucao: number; // % de melhoria
  }[];
};

export type RolePlayScenario = {
  id: string;
  titulo: string;
  contexto: string;
  objetivo: string;
  nivel_dificuldade: 'fácil' | 'médio' | 'difícil';
  criterios_trabalhados: string[];
  tempo_estimado_minutos: number;
  dialogo_exemplo?: string;
};

// ====================================
// BIBLIOTECA DE MELHORES PRÁTICAS
// ====================================
export type BestPracticeExample = {
  id: string;
  call_id: string;
  sdr_name: string;
  criterio: string;
  categoria: string;
  score: number;
  trecho_transcricao: string;
  timestamp_inicio: number;
  timestamp_fim: number;
  audio_url?: string;
  explicacao: string;
  tags: string[];
};

// ====================================
// FILTROS AVANÇADOS
// ====================================
export type AdvancedFilters = {
  sentimento?: SentimentType[];
  topicos?: TopicCategory[];
  palavras_chave?: string[];
  score_min?: number;
  score_max?: number;
  data_inicio?: Date;
  data_fim?: Date;
  resultado?: string[];
  sdr?: string[];
};

// ====================================
// ANÁLISE DE OBJEÇÕES
// ====================================
export type ObjectionType = 
  | 'preço'
  | 'timing'
  | 'concorrência'
  | 'funcionalidades'
  | 'autoridade'
  | 'necessidade'
  | 'confiança'
  | 'outros';

export type DetectedObjection = {
  type: ObjectionType;
  text: string;
  timestamp: number; // segundos
  wasOvercome: boolean; // superada ou não
  response?: string; // resposta do SDR
  effectiveness: number; // 0-100, quão efetiva foi a resposta
};

export type ObjectionResponse = {
  objectionType: ObjectionType;
  bestPractices: readonly string[];
  examples: readonly string[];
  scriptSuggestion: string;
  tipsToAvoid: readonly string[];
};

// Biblioteca de respostas para objeções
export const OBJECTION_LIBRARY: Record<ObjectionType, ObjectionResponse> = {
  'preço': {
    objectionType: 'preço',
    bestPractices: [
      'Não entre em defensiva - reconheça a preocupação',
      'Apresente o ROI e benefícios tangíveis',
      'Compare com o custo de não resolver o problema',
      'Use casos de sucesso de clientes similares'
    ],
    examples: [
      '"Entendo sua preocupação com o investimento. Quando nossos clientes comparam nosso valor com o custo atual de [problema], eles percebem um retorno em média de [X]% nos primeiros [Y] meses."',
      '"Ótima questão! Vamos olhar juntos: quanto custa hoje não ter uma solução para [problema específico]? Nossos clientes relatam economias de [X] mensais após implementação."'
    ],
    scriptSuggestion: 'Reconhecer → Isolar → Quantificar valor → Comparar alternativas → Próximo passo',
    tipsToAvoid: [
      'Não diga apenas "nosso preço é justo"',
      'Evite descontos imediatos sem justificativa',
      'Não compare com concorrentes de forma negativa',
      'Não minimize a preocupação do cliente'
    ]
  },
  'timing': {
    objectionType: 'timing',
    bestPractices: [
      'Descubra o real motivo por trás do "não é o momento"',
      'Crie urgência com base em valor, não em pressão',
      'Mostre o custo de adiar a decisão',
      'Ofereça um caminho de baixo comprometimento'
    ],
    examples: [
      '"Compreendo que existem prioridades neste momento. Posso perguntar: o que especificamente precisa acontecer antes de avançarmos?"',
      '"Faz sentido! Enquanto isso, que tal agendar uma demonstração técnica para sua equipe se familiarizar? Assim quando for o momento certo, vocês já estarão um passo à frente."'
    ],
    scriptSuggestion: 'Validar preocupação → Investigar motivo real → Mostrar custo de espera → Oferecer próximo passo leve',
    tipsToAvoid: [
      'Não force um fechamento imediato',
      'Evite apenas aceitar e desistir',
      'Não crie pressão artificial',
      'Não ignore completamente a objeção'
    ]
  },
  'concorrência': {
    objectionType: 'concorrência',
    bestPractices: [
      'Nunca fale mal dos concorrentes',
      'Foque nos seus diferenciais únicos',
      'Faça perguntas sobre o que é importante para o cliente',
      'Use casos de clientes que migraram da concorrência'
    ],
    examples: [
      '"Ótimo que esteja avaliando opções! [Concorrente] é uma solução sólida. Posso perguntar: quais critérios são mais importantes para você nesta decisão?"',
      '"Muitos de nossos clientes também avaliaram [concorrente]. O que os fez escolher nossa solução foi principalmente [diferencial X] e [diferencial Y]. Esses pontos são relevantes para você?"'
    ],
    scriptSuggestion: 'Reconhecer concorrente → Perguntar critérios → Destacar diferenciais únicos → Validar fit',
    tipsToAvoid: [
      'Nunca critique concorrentes diretamente',
      'Não entre em guerra de preços',
      'Evite comparações genéricas',
      'Não assuma que conhece os critérios do cliente'
    ]
  },
  'funcionalidades': {
    objectionType: 'funcionalidades',
    bestPractices: [
      'Entenda se a funcionalidade é "must-have" ou "nice-to-have"',
      'Mostre workarounds ou roadmap de desenvolvimento',
      'Valide se outras funcionalidades compensam',
      'Conecte com casos de uso reais'
    ],
    examples: [
      '"Entendo que [funcionalidade X] é importante. Posso perguntar: como você utiliza isso hoje no seu processo?"',
      '"Essa funcionalidade específica está em nosso roadmap para [prazo]. Enquanto isso, [funcionalidade similar] pode atender sua necessidade de [objetivo]. Vamos explorar juntos?"'
    ],
    scriptSuggestion: 'Identificar necessidade real → Verificar criticidade → Oferecer alternativas → Mostrar roadmap',
    tipsToAvoid: [
      'Não prometa funcionalidades que não existem',
      'Evite minimizar a importância da necessidade',
      'Não compare feature por feature superficialmente',
      'Não assuma que entendeu a necessidade'
    ]
  },
  'autoridade': {
    objectionType: 'autoridade',
    bestPractices: [
      'Identifique o decisor real e processo de decisão',
      'Peça para envolver outros stakeholders na conversa',
      'Entenda objeções potenciais de cada decisor',
      'Posicione-se como parceiro no processo'
    ],
    examples: [
      '"Perfeito! Entendo que outras pessoas participam dessa decisão. Quem mais precisa avaliar e o que é importante para cada um?"',
      '"Ótimo. Para otimizar o tempo de todos, que tal agendarmos uma reunião breve com [decisor] onde apresento os pontos principais? Assim você também tem todas as informações para discussão interna."'
    ],
    scriptSuggestion: 'Mapear stakeholders → Entender processo decisório → Oferecer suporte → Envolver decisores',
    tipsToAvoid: [
      'Não trate o contato como mero intermediário',
      'Evite pressionar por acesso imediato ao decisor',
      'Não ignore a influência do contato atual',
      'Não assuma hierarquias sem confirmar'
    ]
  },
  'necessidade': {
    objectionType: 'necessidade',
    bestPractices: [
      'Reconecte com a dor/problema inicial',
      'Use perguntas de implicação (SPIN)',
      'Mostre impacto no negócio',
      'Compartilhe casos de empresas similares'
    ],
    examples: [
      '"Entendo. Quando conversamos antes, você mencionou [problema X]. Isso deixou de ser uma preocupação?"',
      '"Faz sentido. Empresas do seu segmento geralmente não percebem o impacto de [problema] até que [consequência]. Vale explorarmos isso juntos?"'
    ],
    scriptSuggestion: 'Reconectar com problema → Fazer perguntas de implicação → Mostrar impacto → Validar relevância',
    tipsToAvoid: [
      'Não force uma necessidade inexistente',
      'Evite ser genérico sobre o valor',
      'Não assuma que você conhece o negócio melhor',
      'Não desista na primeira negativa'
    ]
  },
  'confiança': {
    objectionType: 'confiança',
    bestPractices: [
      'Use provas sociais (cases, depoimentos)',
      'Ofereça trial/POC de baixo risco',
      'Apresente certificações e credenciais',
      'Conecte com clientes referência'
    ],
    examples: [
      '"Compreendo totalmente essa preocupação. Por isso trabalhamos com empresas como [cliente X] e [cliente Y] do seu setor. Posso conectar você com [nome], que tinha preocupações similares?"',
      '"Faz sentido ser criterioso. Que tal começarmos com [trial/POC] de [X dias] sem compromisso? Assim você valida na prática se entregamos o que prometemos."'
    ],
    scriptSuggestion: 'Validar preocupação → Apresentar provas sociais → Oferecer baixo risco → Conectar com referências',
    tipsToAvoid: [
      'Não fique na defensiva',
      'Evite apenas listar features e prêmios',
      'Não pressione por decisão rápida',
      'Não ignore o histórico de decepções do cliente'
    ]
  },
  'outros': {
    objectionType: 'outros',
    bestPractices: [
      'Escute atentamente e faça perguntas clarificadoras',
      'Valide o entendimento da objeção',
      'Seja criativo nas soluções',
      'Mantenha a conversa aberta'
    ],
    examples: [
      '"Ajuda-me a entender melhor: quando você diz [objeção], especificamente o que te preocupa?"',
      '"Interessante ponto. Não tinha considerado isso por esse ângulo. Vamos explorar juntos como podemos endereçar essa questão."'
    ],
    scriptSuggestion: 'Clarificar → Validar entendimento → Explorar soluções → Manter diálogo',
    tipsToAvoid: [
      'Não tenha resposta pronta sem entender',
      'Evite categorizar erroneamente',
      'Não encerre a conversa prematuramente',
      'Não ignore objeções atípicas'
    ]
  }
} as const;

// ====================================
// ANÁLISE DE LINGUAGEM AVANÇADA
// ====================================
export type ToneType = 'profissional' | 'casual' | 'agressivo' | 'passivo' | 'consultivo';

export type LanguageAnalysis = {
  tone: ToneType;
  powerWordsCount: number;
  weakWordsCount: number;
  powerWordsRatio: number; // % de palavras de poder
  questionAnalysis: {
    openQuestions: number;
    closedQuestions: number;
    totalQuestions: number;
    openQuestionsRatio: number; // % de perguntas abertas
  };
  speechPaceEstimate: {
    wordsPerMinute: number;
    category: 'muito_lento' | 'lento' | 'ideal' | 'rápido' | 'muito_rápido';
  };
  topPowerWords: string[];
  topWeakWords: string[];
};

// Palavras de poder (geram confiança, ação, valor)
export const POWER_WORDS = [
  'garantir', 'comprovado', 'resultados', 'sucesso', 'eficaz',
  'exclusivo', 'especialista', 'inovador', 'líder', 'premium',
  'transformar', 'otimizar', 'maximizar', 'revolucionário', 'estratégico',
  'investimento', 'ROI', 'crescimento', 'economia', 'lucro',
  'solução', 'benefício', 'vantagem', 'oportunidade', 'diferencial',
  'parceria', 'colaboração', 'personalizado', 'customizado', 'exclusivo'
] as const;

// Palavras fracas (geram dúvida, incerteza, fraqueza)
export const WEAK_WORDS = [
  'talvez', 'acho', 'tipo', 'meio', 'mais ou menos',
  'tentar', 'esperar', 'não sei', 'difícil', 'problema',
  'desculpa', 'mas', 'porém', 'infelizmente', 'limitado',
  'barato', 'simples', 'básico', 'comum', 'normal',
  'só', 'apenas', 'possível', 'provável', 'talvez'
] as const;

// ====================================
// RELATÓRIOS
// ====================================
export type ReportTemplate = {
  id: string;
  name: string;
  description: string;
  targetAudience: 'gestor' | 'diretor' | 'sdr';
  sections: ReportSection[];
  defaultFilters?: AdvancedFilters;
};

export type ReportSection = {
  id: string;
  title: string;
  type: 'kpis' | 'chart' | 'table' | 'text' | 'ranking';
  metrics: string[];
  chartType?: 'bar' | 'line' | 'pie' | 'radar';
};

export type ExportFormat = 'pdf' | 'excel' | 'csv';

export type SavedFilter = {
  id: string;
  name: string;
  filters: AdvancedFilters;
  createdAt: Date;
  lastUsed?: Date;
};

// ====================================
// BIBLIOTECA DE RECURSOS
// ====================================
export type ResourceType = 'script' | 'video' | 'article' | 'quiz';

export type TrainingResource = {
  id: string;
  title: string;
  type: ResourceType;
  category: string;
  description: string;
  content?: string; // Para scripts e artigos
  url?: string; // Para vídeos externos
  duration?: number; // minutos
  difficulty: 'iniciante' | 'intermediário' | 'avançado';
  tags: string[];
  relatedCriteria: string[];
};

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // índice da resposta correta
  explanation: string;
  category: string;
  difficulty: 'fácil' | 'médio' | 'difícil';
};

export type Quiz = {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  passingScore: number; // % mínimo para passar
  estimatedMinutes: number;
};

export type QuizResult = {
  quizId: string;
  userId: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  passed: boolean;
  completedAt: Date;
  answers: {
    questionId: string;
    selectedAnswer: number;
    correct: boolean;
  }[];
};

// ====================================
// SIMULADOR DE IA
// ====================================
export type ClientPersona = {
  id: string;
  name: string;
  role: string;
  company: string;
  personality: 'receptivo' | 'cético' | 'apressado' | 'analítico' | 'amigável' | 'desconfiado';
  painPoints: string[];
  objections: ObjectionType[];
  budget: 'baixo' | 'médio' | 'alto';
  decisionStyle: 'rápido' | 'cauteloso' | 'colaborativo';
};

export type SimulationScenario = {
  id: string;
  title: string;
  description: string;
  difficulty: 'fácil' | 'médio' | 'difícil';
  persona: ClientPersona;
  objectives: string[];
  successCriteria: string[];
  estimatedDuration: number; // minutos
};

export type SimulationMessage = {
  id: string;
  role: 'sdr' | 'client' | 'system';
  content: string;
  timestamp: Date;
  analysis?: {
    tone: ToneType;
    effectiveness: number; // 0-100
    suggestions?: string[];
  };
};

export type SimulationSession = {
  id: string;
  scenarioId: string;
  userId: string;
  startedAt: Date;
  endedAt?: Date;
  messages: SimulationMessage[];
  finalScore?: number;
  feedback?: {
    strengths: string[];
    improvements: string[];
    criteriaScores: Record<string, number>;
  };
};

// ====================================
// TIPOS EXISTENTES (mantidos)
// ====================================
export type DateRange = {
  from: Date | undefined
  to: Date | undefined
}

// ====================================
// ORGANIZAÇÃO E MULTI-TENANCY
// ====================================
export type Organization = {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserWithOrganization = {
  id: string;
  name: string | null;
  email: string;
  role: string | null;
  organizationId: string;
  organization: Organization;
  meetimeId: string | null;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}