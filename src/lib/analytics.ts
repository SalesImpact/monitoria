import {
  CRITERIA_WEIGHTS,
  SentimentAnalysis,
  SentimentJourneyPoint,
  SentimentType,
  DetectedTopic,
  TopicCategory,
  DetectedKeyword,
  MONITORED_KEYWORDS,
  KeywordType,
  DetectedObjection,
  ObjectionType,
  LanguageAnalysis,
  ToneType,
  POWER_WORDS,
  WEAK_WORDS,
} from './types';

// ====================================
// CÁLCULO DE SCORE PONDERADO
// ====================================
export function calculateWeightedScore(scores: any): number {
  let totalWeighted = 0;
  let totalWeights = 0;

  // Percorre cada categoria
  Object.entries(scores).forEach(([categoria, criterios]: [string, any]) => {
    if (typeof criterios === 'object' && criterios !== null) {
      // Percorre cada critério dentro da categoria
      Object.entries(criterios).forEach(([criterio, score]: [string, any]) => {
        const peso = (CRITERIA_WEIGHTS as any)[categoria]?.[criterio] || 1.0;
        const scoreNum = typeof score === 'number' ? score : 0;
        
        totalWeighted += scoreNum * peso;
        totalWeights += peso * 5; // multiplicado por 5 (score máximo)
      });
    }
  });

  if (totalWeights === 0) return 0;
  
  // Retorna uma pontuação de 0 a 5
  return (totalWeighted / totalWeights) * 5;
}

// ====================================
// ANÁLISE DE SENTIMENTO (MOCK COM LÓGICA)
// ====================================
export function analyzeSentiment(transcription: string, scores: any): SentimentAnalysis {
  const text = transcription.toLowerCase();
  
  // Análise baseada em palavras-chave e scores
  let positiveCount = 0;
  let negativeCount = 0;
  
  MONITORED_KEYWORDS.positive.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches) positiveCount += matches.length;
  });
  
  MONITORED_KEYWORDS.negative.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches) negativeCount += matches.length;
  });
  
  // Análise baseada nos scores
  const avgScore = calculateWeightedScore(scores);
  
  // Determina sentimento geral
  let overall: SentimentType = 'neutro';
  if (avgScore >= 4 && positiveCount > negativeCount) {
    overall = 'entusiasmado';
  } else if (avgScore >= 3.5) {
    overall = 'positivo';
  } else if (avgScore >= 2.5) {
    overall = 'neutro';
  } else if (avgScore >= 1.5) {
    overall = 'negativo';
  } else {
    overall = 'frustrado';
  }
  
  // Analisa sentimento específico do cliente e SDR
  const clientSentiment = analyzeClientSentiment(text);
  const sdrSentiment = analyzeSdrSentiment(text, scores);
  
  return {
    overall,
    client: clientSentiment,
    sdr: sdrSentiment,
    confidence: Math.min(95, 60 + (positiveCount + negativeCount) * 5),
    emotionalTone: generateEmotionalTone(overall, clientSentiment, sdrSentiment),
  };
}

function analyzeClientSentiment(text: string): SentimentType {
  // Palavras que indicam frustração do cliente
  const frustrationWords = ['não', 'difícil', 'caro', 'problema', 'complicado', 'ocupado', 'gripado'];
  const positiveWords = ['ótimo', 'perfeito', 'excelente', 'interessante', 'bom'];
  
  let frustrationScore = 0;
  let positiveScore = 0;
  
  frustrationWords.forEach(word => {
    if (text.includes(word)) frustrationScore++;
  });
  
  positiveWords.forEach(word => {
    if (text.includes(word)) positiveScore++;
  });
  
  if (frustrationScore > positiveScore + 2) return 'frustrado';
  if (frustrationScore > positiveScore) return 'negativo';
  if (positiveScore > frustrationScore + 1) return 'entusiasmado';
  if (positiveScore > frustrationScore) return 'positivo';
  return 'neutro';
}

function analyzeSdrSentiment(text: string, scores: any): SentimentType {
  const avgScore = calculateWeightedScore(scores);
  const rapportScore = scores.abertura?.rapport || 3;
  const tomVozScore = scores.abertura?.tom_voz || 3;
  
  // SDR confiante tem boas pontuações em rapport e tom de voz
  if (rapportScore >= 4 && tomVozScore >= 4) return 'confiante';
  if (avgScore >= 3.5 && rapportScore >= 3) return 'positivo';
  if (avgScore < 2) return 'inseguro';
  if (rapportScore < 2) return 'negativo';
  return 'neutro';
}

function generateEmotionalTone(overall: SentimentType, client: SentimentType, sdr: SentimentType): string {
  const tones: { [key: string]: string } = {
    'entusiasmado': 'Ligação altamente energética e positiva',
    'positivo': 'Tom construtivo e receptivo',
    'neutro': 'Interação profissional e equilibrada',
    'negativo': 'Presença de resistência ou objeções',
    'frustrado': 'Tensão e dificuldade na comunicação',
    'confiante': 'SDR demonstra segurança e domínio',
    'inseguro': 'SDR demonstra hesitação',
  };
  
  return `${tones[overall] || 'Tom neutro'}. Cliente: ${tones[client] || 'neutro'}. SDR: ${tones[sdr] || 'neutro'}.`;
}

// ====================================
// JORNADA DE SENTIMENTO AO LONGO DA LIGAÇÃO
// ====================================
export function generateSentimentJourney(transcription: string, duration: string): SentimentJourneyPoint[] {
  const lines = transcription.split('\n').filter(line => line.trim());
  const [minutes, seconds] = duration.split(':').map(Number);
  const totalSeconds = (minutes || 0) * 60 + (seconds || 0);
  
  const journey: SentimentJourneyPoint[] = [];
  const secondsPerLine = totalSeconds / Math.max(lines.length, 1);
  
  lines.forEach((line, index) => {
    const [speaker, ...textParts] = line.split(':');
    const text = textParts.join(':').toLowerCase();
    
    if (!speaker || !text) return;
    
    const timestamp = Math.floor(index * secondsPerLine);
    const speakerType: 'client' | 'sdr' = speaker.trim().includes('SDR') || 
      ['Marcelo', 'Dayane', 'Fernanda', 'Carolina', 'Pedro'].some(name => speaker.includes(name))
      ? 'sdr' : 'client';
    
    // Análise de sentimento simples baseada em palavras
    let sentiment: SentimentType = 'neutro';
    let intensity = 50;
    
    if (text.includes('excelente') || text.includes('perfeito') || text.includes('ótimo')) {
      sentiment = 'entusiasmado';
      intensity = 85;
    } else if (text.includes('bom') || text.includes('interessante') || text.includes('pode')) {
      sentiment = 'positivo';
      intensity = 70;
    } else if (text.includes('não') || text.includes('difícil') || text.includes('problema')) {
      sentiment = 'negativo';
      intensity = 65;
    } else if (text.includes('caro') || text.includes('ocupado') || text.includes('ruim')) {
      sentiment = 'frustrado';
      intensity = 80;
    }
    
    journey.push({
      timestamp,
      sentiment,
      intensity,
      speaker: speakerType,
      text: text.substring(0, 100),
    });
  });
  
  return journey;
}

// ====================================
// DETECÇÃO DE TÓPICOS (TOPIC MODELING)
// ====================================
export function detectTopics(transcription: string): DetectedTopic[] {
  const text = transcription.toLowerCase();
  const topics: DetectedTopic[] = [];
  
  const topicPatterns: { [key in TopicCategory]: string[] } = {
    'preço': ['preço', 'valor', 'custo', 'investimento', 'orçamento', 'caro', 'barato'],
    'concorrência': ['concorrente', 'mercado', 'outro', 'alternativa', 'comparar'],
    'funcionalidades': ['recurso', 'ferramenta', 'funcionalidade', 'feature', 'sistema'],
    'prazos': ['prazo', 'tempo', 'quando', 'data', 'agendamento', 'cronograma'],
    'contratos': ['contrato', 'acordo', 'termo', 'cláusula', 'assinatura'],
    'suporte': ['suporte', 'ajuda', 'atendimento', 'assistência', 'dúvida'],
    'implementação': ['implementar', 'implantação', 'instalação', 'configuração', 'setup'],
    'resultados': ['resultado', 'retorno', 'roi', 'benefício', 'ganho', 'melhoria'],
    'dúvidas_técnicas': ['técnico', 'tecnologia', 'integração', 'api', 'sistema'],
    'objeções': ['mas', 'porém', 'preocupado', 'receio', 'não sei', 'difícil'],
    'benefícios': ['benefício', 'vantagem', 'ganho', 'economia', 'eficiência'],
    'comparações': ['comparar', 'diferença', 'versus', 'melhor', 'pior'],
    'urgência': ['urgente', 'rápido', 'imediato', 'agora', 'já'],
    'tomada_decisão': ['decidir', 'decisão', 'aprovar', 'diretoria', 'equipe'],
  };
  
  Object.entries(topicPatterns).forEach(([category, patterns]) => {
    let mentions = 0;
    const foundKeywords: string[] = [];
    let firstMention = -1;
    
    patterns.forEach(pattern => {
      const regex = new RegExp(`\\b${pattern}\\w*`, 'gi');
      const matches = text.match(regex);
      if (matches) {
        mentions += matches.length;
        foundKeywords.push(pattern);
        
        if (firstMention === -1) {
          const index = text.indexOf(pattern);
          if (index !== -1) {
            // Estima o segundo baseado na posição no texto
            firstMention = Math.floor((index / text.length) * 180); // assumindo ~3 min médio
          }
        }
      }
    });
    
    if (mentions > 0) {
      topics.push({
        category: category as TopicCategory,
        mentions,
        relevance: Math.min(100, mentions * 15),
        keywords: foundKeywords,
        firstMentionAt: firstMention >= 0 ? firstMention : 0,
      });
    }
  });
  
  // Ordena por relevância
  return topics.sort((a, b) => b.relevance - a.relevance);
}

// ====================================
// IDENTIFICAÇÃO DE PALAVRAS-CHAVE
// ====================================
export function detectKeywords(transcription: string): DetectedKeyword[] {
  const text = transcription.toLowerCase();
  const keywords: DetectedKeyword[] = [];
  
  // Processa palavras positivas
  MONITORED_KEYWORDS.positive.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches && matches.length > 0) {
      const contexts = extractContexts(text, word);
      keywords.push({
        word,
        type: 'positive',
        count: matches.length,
        context: contexts,
        sentiment_impact: 20 * matches.length,
      });
    }
  });
  
  // Processa palavras negativas
  MONITORED_KEYWORDS.negative.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches && matches.length > 0) {
      const contexts = extractContexts(text, word);
      keywords.push({
        word,
        type: 'negative',
        count: matches.length,
        context: contexts,
        sentiment_impact: -20 * matches.length,
      });
    }
  });
  
  // Processa palavras neutras
  MONITORED_KEYWORDS.neutral.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches && matches.length > 0) {
      const contexts = extractContexts(text, word);
      keywords.push({
        word,
        type: 'neutral',
        count: matches.length,
        context: contexts,
        sentiment_impact: 0,
      });
    }
  });
  
  // Ordena por impacto absoluto
  return keywords.sort((a, b) => Math.abs(b.sentiment_impact) - Math.abs(a.sentiment_impact));
}

function extractContexts(text: string, keyword: string, contextLength: number = 60): string[] {
  const contexts: string[] = [];
  const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
  let match;
  
  while ((match = regex.exec(text)) !== null && contexts.length < 3) {
    const start = Math.max(0, match.index - contextLength);
    const end = Math.min(text.length, match.index + keyword.length + contextLength);
    const context = '...' + text.substring(start, end).trim() + '...';
    contexts.push(context);
  }
  
  return contexts;
}

// ====================================
// ANÁLISE DE OBJEÇÕES
// ====================================
export function detectObjections(transcription: string, sentimentJourney?: SentimentJourneyPoint[]): DetectedObjection[] {
  const text = transcription.toLowerCase();
  const lines = transcription.split('\n').filter(line => line.trim());
  const objections: DetectedObjection[] = [];
  
  // Padrões de objeções por tipo
  const objectionPatterns: { [key in ObjectionType]: string[] } = {
    'preço': [
      'muito caro', 'preço alto', 'custa muito', 'orçamento apertado', 'não cabe no orçamento',
      'valor elevado', 'investimento alto', 'precisa de desconto', 'mais barato', 'muito dinheiro'
    ],
    'timing': [
      'não é o momento', 'agora não', 'mais tarde', 'ano que vem', 'próximo trimestre',
      'muito ocupado', 'sem tempo', 'outras prioridades', 'vamos deixar para', 'talvez depois'
    ],
    'concorrência': [
      'já temos uma solução', 'já uso', 'outro fornecedor', 'concorrente', 'parceiro atual',
      'comparar com', 'avaliando outras opções', 'proposta de outros', 'já contratamos'
    ],
    'funcionalidades': [
      'não tem o recurso', 'falta funcionalidade', 'não faz', 'preciso de', 'não atende',
      'não integra com', 'limitado', 'incompleto', 'não suporta', 'não oferece'
    ],
    'autoridade': [
      'preciso consultar', 'não decido sozinho', 'falar com', 'equipe precisa avaliar',
      'gerente precisa aprovar', 'diretoria decide', 'não tenho autonomia', 'depende de'
    ],
    'necessidade': [
      'não preciso', 'não vejo necessidade', 'está funcionando bem', 'não é prioridade',
      'não temos esse problema', 'não se aplica', 'não faz sentido', 'desnecessário'
    ],
    'confiança': [
      'não conheço', 'nunca ouvi falar', 'é confiável', 'quem usa', 'prova',
      'garantia', 'reputação', 'casos de sucesso', 'receio', 'inseguro', 'dúvida'
    ],
    'outros': []
  };
  
  let currentTimestamp = 0;
  const totalLines = lines.length;
  
  lines.forEach((line, index) => {
    const [speaker, ...textParts] = line.split(':');
    const lineText = textParts.join(':').trim().toLowerCase();
    
    if (!speaker || !lineText) return;
    
    // Estima timestamp baseado na posição da linha
    currentTimestamp = Math.floor((index / totalLines) * 180); // ~3 min médio
    
    // Verifica se é o cliente falando (geralmente quem levanta objeções)
    const isClient = !speaker.includes('SDR') && 
      !['Marcelo', 'Dayane', 'Fernanda', 'Carolina', 'Pedro'].some(name => speaker.includes(name));
    
    // Procura por padrões de objeção
    Object.entries(objectionPatterns).forEach(([type, patterns]) => {
      if (type === 'outros') return;
      
      patterns.forEach(pattern => {
        if (lineText.includes(pattern)) {
          // Verifica se o SDR respondeu (próximas linhas)
          let response = '';
          let wasOvercome = false;
          let effectiveness = 50;
          
          // Analisa as próximas 2-3 linhas para ver a resposta
          for (let j = index + 1; j < Math.min(index + 4, lines.length); j++) {
            const nextLine = lines[j];
            const [nextSpeaker, ...nextTextParts] = nextLine.split(':');
            const nextText = nextTextParts.join(':').trim();
            
            const isSdr = nextSpeaker.includes('SDR') || 
              ['Marcelo', 'Dayane', 'Fernanda', 'Carolina', 'Pedro'].some(name => nextSpeaker.includes(name));
            
            if (isSdr && nextText) {
              response = nextText;
              
              // Analisa se a resposta foi efetiva
              const positiveIndicators = ['entendo', 'faz sentido', 'compreendo', 'justamente', 'ótima questão'];
              const weakIndicators = ['mas', 'desculpa', 'infelizmente'];
              
              let effectivenessScore = 50;
              positiveIndicators.forEach(indicator => {
                if (nextText.toLowerCase().includes(indicator)) effectivenessScore += 15;
              });
              weakIndicators.forEach(indicator => {
                if (nextText.toLowerCase().includes(indicator)) effectivenessScore -= 10;
              });
              
              effectiveness = Math.max(0, Math.min(100, effectivenessScore));
              
              // Considera superada se a resposta foi bem elaborada e o sentimento melhorou
              if (response.length > 50 && effectiveness > 60) {
                wasOvercome = true;
              }
              
              break;
            }
          }
          
          objections.push({
            type: type as ObjectionType,
            text: lineText.substring(0, 150),
            timestamp: currentTimestamp,
            wasOvercome,
            response: response.substring(0, 200) || undefined,
            effectiveness,
          });
        }
      });
    });
  });
  
  // Remove duplicatas muito próximas (mesmo tipo e timestamp similar)
  const uniqueObjections: DetectedObjection[] = [];
  objections.forEach(objection => {
    const isDuplicate = uniqueObjections.some(
      existing => 
        existing.type === objection.type && 
        Math.abs(existing.timestamp - objection.timestamp) < 10
    );
    if (!isDuplicate) {
      uniqueObjections.push(objection);
    }
  });
  
  return uniqueObjections;
}

// ====================================
// ANÁLISE DE LINGUAGEM AVANÇADA
// ====================================
export function analyzeLanguage(transcription: string, duration: string): LanguageAnalysis {
  const text = transcription.toLowerCase();
  const words = text.split(/\s+/).filter(w => w.length > 2);
  
  // 1. Conta palavras de poder e palavras fracas
  let powerWordsCount = 0;
  const foundPowerWords: string[] = [];
  
  POWER_WORDS.forEach(powerWord => {
    const regex = new RegExp(`\\b${powerWord}\\w*`, 'gi');
    const matches = text.match(regex);
    if (matches) {
      powerWordsCount += matches.length;
      if (!foundPowerWords.includes(powerWord)) {
        foundPowerWords.push(powerWord);
      }
    }
  });
  
  let weakWordsCount = 0;
  const foundWeakWords: string[] = [];
  
  WEAK_WORDS.forEach(weakWord => {
    const regex = new RegExp(`\\b${weakWord}\\w*`, 'gi');
    const matches = text.match(regex);
    if (matches) {
      weakWordsCount += matches.length;
      if (!foundWeakWords.includes(weakWord)) {
        foundWeakWords.push(weakWord);
      }
    }
  });
  
  const powerWordsRatio = (powerWordsCount / (powerWordsCount + weakWordsCount + 1)) * 100;
  
  // 2. Análise de perguntas abertas vs fechadas
  const questionMatches = text.match(/\?/g) || [];
  const totalQuestions = questionMatches.length;
  
  // Perguntas abertas geralmente começam com: como, por que, o que, qual, quando, quem
  const openQuestionPatterns = [
    /como\b[^?]*\?/gi,
    /por que\b[^?]*\?/gi,
    /o que\b[^?]*\?/gi,
    /quais\b[^?]*\?/gi,
    /qual\b[^?]*\?/gi,
    /quando\b[^?]*\?/gi,
    /quem\b[^?]*\?/gi,
    /onde\b[^?]*\?/gi,
    /me conta\b[^?]*\?/gi,
    /me fala\b[^?]*\?/gi,
  ];
  
  let openQuestions = 0;
  openQuestionPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) openQuestions += matches.length;
  });
  
  const closedQuestions = Math.max(0, totalQuestions - openQuestions);
  const openQuestionsRatio = totalQuestions > 0 ? (openQuestions / totalQuestions) * 100 : 0;
  
  // 3. Estimativa de velocidade de fala (palavras por minuto)
  const [minutes, seconds] = duration.split(':').map(Number);
  const totalMinutes = (minutes || 0) + (seconds || 0) / 60;
  const wordsPerMinute = totalMinutes > 0 ? Math.round(words.length / totalMinutes) : 0;
  
  let paceCategory: 'muito_lento' | 'lento' | 'ideal' | 'rápido' | 'muito_rápido' = 'ideal';
  if (wordsPerMinute < 100) paceCategory = 'muito_lento';
  else if (wordsPerMinute < 120) paceCategory = 'lento';
  else if (wordsPerMinute <= 160) paceCategory = 'ideal';
  else if (wordsPerMinute <= 180) paceCategory = 'rápido';
  else paceCategory = 'muito_rápido';
  
  // 4. Detecção de tonalidade
  let tone: ToneType = 'profissional';
  
  const casualWords = ['tipo', 'né', 'aí', 'cara', 'mano', 'beleza', 'opa'];
  const aggressiveWords = ['tem que', 'precisa', 'deve', 'obrigatório', 'exijo'];
  const passiveWords = ['talvez', 'acho', 'pode ser', 'não sei', 'meio'];
  const consultiveWords = ['recomendo', 'sugiro', 'na minha experiência', 'aconselho', 'vale a pena'];
  
  let casualScore = 0;
  let aggressiveScore = 0;
  let passiveScore = 0;
  let consultiveScore = 0;
  
  casualWords.forEach(word => { if (text.includes(word)) casualScore++; });
  aggressiveWords.forEach(word => { if (text.includes(word)) aggressiveScore++; });
  passiveWords.forEach(word => { if (text.includes(word)) passiveScore++; });
  consultiveWords.forEach(word => { if (text.includes(word)) consultiveScore++; });
  
  const maxScore = Math.max(casualScore, aggressiveScore, passiveScore, consultiveScore);
  if (maxScore === 0 || (consultiveScore === 0 && aggressiveScore === 0 && passiveScore < 2)) {
    tone = 'profissional';
  } else if (maxScore === casualScore && casualScore >= 2) {
    tone = 'casual';
  } else if (maxScore === aggressiveScore && aggressiveScore >= 2) {
    tone = 'agressivo';
  } else if (maxScore === passiveScore && passiveScore >= 3) {
    tone = 'passivo';
  } else if (maxScore === consultiveScore) {
    tone = 'consultivo';
  }
  
  return {
    tone,
    powerWordsCount,
    weakWordsCount,
    powerWordsRatio,
    questionAnalysis: {
      openQuestions,
      closedQuestions,
      totalQuestions,
      openQuestionsRatio,
    },
    speechPaceEstimate: {
      wordsPerMinute,
      category: paceCategory,
    },
    topPowerWords: foundPowerWords.slice(0, 5),
    topWeakWords: foundWeakWords.slice(0, 5),
  };
}
