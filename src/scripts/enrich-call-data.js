const fs = require('fs');
const path = require('path');

// Pesos dos critérios
const CRITERIA_WEIGHTS = {
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
    perguntas_situacao: 2.5,
    perguntas_problema: 2.8,
    perguntas_implicacao: 3.0,
    perguntas_necessidade_solucao: 3.0,
  },
  proximos_passos: {
    confirmou_entendimento: 2.2,
    vendeu_proximo_passo: 2.5,
    agendou_concluiu: 2.8,
  },
};

// Palavras-chave monitoradas
const MONITORED_KEYWORDS = {
  positive: ['excelente', 'perfeito', 'ótimo', 'maravilhoso', 'concordo', 'interessante', 'adorei', 'sucesso', 'resultado', 'eficiente', 'rápido', 'fácil', 'prático', 'bom'],
  negative: ['caro', 'difícil', 'complicado', 'problema', 'preocupado', 'ruim', 'lento', 'confuso', 'incerto', 'dúvida', 'receio', 'frustrado', 'não'],
  neutral: ['talvez', 'pensar', 'avaliar', 'considerar', 'analisar', 'verificar', 'estudar', 'consultar', 'equipe']
};

function calculateWeightedScore(scores) {
  let totalWeighted = 0;
  let totalWeights = 0;

  Object.entries(scores).forEach(([categoria, criterios]) => {
    if (typeof criterios === 'object' && criterios !== null) {
      Object.entries(criterios).forEach(([criterio, score]) => {
        const peso = CRITERIA_WEIGHTS[categoria]?.[criterio] || 1.0;
        const scoreNum = typeof score === 'number' ? score : 0;
        
        totalWeighted += scoreNum * peso;
        totalWeights += peso * 5;
      });
    }
  });

  if (totalWeights === 0) return 0;
  return (totalWeighted / totalWeights) * 5;
}

function analyzeSentiment(transcription, scores) {
  const text = transcription.toLowerCase();
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
  
  const avgScore = calculateWeightedScore(scores);
  
  let overall = 'neutro';
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
  
  const clientSentiment = negativeCount > positiveCount + 2 ? 'frustrado' : 
                          negativeCount > positiveCount ? 'negativo' :
                          positiveCount > negativeCount + 1 ? 'entusiasmado' :
                          positiveCount > negativeCount ? 'positivo' : 'neutro';
  
  const sdrSentiment = scores.abertura?.rapport >= 4 && scores.abertura?.tom_voz >= 4 ? 'confiante' :
                       avgScore >= 3.5 ? 'positivo' :
                       avgScore < 2 ? 'inseguro' : 'neutro';
  
  return {
    overall,
    client: clientSentiment,
    sdr: sdrSentiment,
    confidence: Math.min(95, 60 + (positiveCount + negativeCount) * 5),
    emotionalTone: `Análise geral: ${overall}. Cliente demonstrou atitude ${clientSentiment}, SDR apresentou postura ${sdrSentiment}.`
  };
}

function generateSentimentJourney(transcription, duration) {
  const lines = transcription.split('\n').filter(line => line.trim());
  const [minutes, seconds] = duration.split(':').map(Number);
  const totalSeconds = (minutes || 0) * 60 + (seconds || 0);
  
  const journey = [];
  const secondsPerLine = totalSeconds / Math.max(lines.length, 1);
  
  const sdrNames = ['Marcelo', 'Dayane', 'Fernanda', 'Carolina', 'Pedro'];
  
  lines.forEach((line, index) => {
    const [speaker, ...textParts] = line.split(':');
    const text = textParts.join(':').toLowerCase();
    
    if (!speaker || !text) return;
    
    const timestamp = Math.floor(index * secondsPerLine);
    const speakerType = sdrNames.some(name => speaker.includes(name)) ? 'sdr' : 'client';
    
    let sentiment = 'neutro';
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
      text: text.substring(0, 100)
    });
  });
  
  return journey;
}

function detectTopics(transcription) {
  const text = transcription.toLowerCase();
  const topics = [];
  
  const topicPatterns = {
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
    const foundKeywords = [];
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
            firstMention = Math.floor((index / text.length) * 180);
          }
        }
      }
    });
    
    if (mentions > 0) {
      topics.push({
        category,
        mentions,
        relevance: Math.min(100, mentions * 15),
        keywords: foundKeywords,
        firstMentionAt: firstMention >= 0 ? firstMention : 0,
      });
    }
  });
  
  return topics.sort((a, b) => b.relevance - a.relevance);
}

function detectKeywords(transcription) {
  const text = transcription.toLowerCase();
  const keywords = [];
  
  Object.entries(MONITORED_KEYWORDS).forEach(([type, wordList]) => {
    wordList.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = text.match(regex);
      if (matches && matches.length > 0) {
        const impact = type === 'positive' ? 20 : type === 'negative' ? -20 : 0;
        keywords.push({
          word,
          type,
          count: matches.length,
          sentiment_impact: impact * matches.length,
        });
      }
    });
  });
  
  return keywords.sort((a, b) => Math.abs(b.sentiment_impact) - Math.abs(a.sentiment_impact));
}

// Adiciona scores de sentimento aos critérios existentes
function addSentimentScores(call) {
  const sentiment = call.sentiment_analysis;
  
  // Gera scores de sentimento baseados na análise
  const clientEngagement = sentiment.client === 'entusiasmado' ? 5 :
                           sentiment.client === 'positivo' ? 4 :
                           sentiment.client === 'neutro' ? 3 :
                           sentiment.client === 'negativo' ? 2 : 1;
  
  const sdrConfidence = sentiment.sdr === 'confiante' ? 5 :
                        sentiment.sdr === 'positivo' ? 4 :
                        sentiment.sdr === 'neutro' ? 3 :
                        sentiment.sdr === 'inseguro' ? 2 : 1;
  
  call.scores.sentimento = {
    nivel_engajamento_cliente: clientEngagement,
    confianca_sdr: sdrConfidence,
  };
  
  // Recalcula average_score com ponderação
  call.average_score = calculateWeightedScore(call.scores);
}

// ====================================
// ANÁLISE DE OBJEÇÕES
// ====================================
function detectObjections(transcription) {
  const text = transcription.toLowerCase();
  const lines = transcription.split('\n').filter(line => line.trim());
  const objections = [];
  
  const objectionPatterns = {
    'preço': ['muito caro', 'preço alto', 'custa muito', 'orçamento apertado', 'não cabe no orçamento', 'valor elevado', 'investimento alto', 'mais barato', 'muito dinheiro'],
    'timing': ['não é o momento', 'agora não', 'mais tarde', 'ano que vem', 'próximo trimestre', 'muito ocupado', 'sem tempo', 'outras prioridades', 'talvez depois'],
    'concorrência': ['já temos uma solução', 'já uso', 'outro fornecedor', 'concorrente', 'parceiro atual', 'comparar com', 'avaliando outras opções', 'proposta de outros', 'já contratamos'],
    'funcionalidades': ['não tem o recurso', 'falta funcionalidade', 'não faz', 'preciso de', 'não atende', 'não integra com', 'limitado', 'incompleto', 'não suporta', 'não oferece'],
    'autoridade': ['preciso consultar', 'não decido sozinho', 'falar com', 'equipe precisa avaliar', 'gerente precisa aprovar', 'diretoria decide', 'não tenho autonomia', 'depende de'],
    'necessidade': ['não preciso', 'não vejo necessidade', 'está funcionando bem', 'não é prioridade', 'não temos esse problema', 'não se aplica', 'não faz sentido', 'desnecessário'],
    'confiança': ['não conheço', 'nunca ouvi falar', 'é confiável', 'quem usa', 'prova', 'garantia', 'reputação', 'casos de sucesso', 'receio', 'inseguro', 'dúvida']
  };
  
  const totalLines = lines.length;
  
  lines.forEach((line, index) => {
    const parts = line.split(':');
    if (parts.length < 2) return;
    
    const speaker = parts[0];
    const lineText = parts.slice(1).join(':').trim().toLowerCase();
    const currentTimestamp = Math.floor((index / totalLines) * 180);
    
    const isClient = !speaker.includes('SDR') && !['Marcelo', 'Dayane', 'Fernanda', 'Carolina', 'Pedro'].some(name => speaker.includes(name));
    
    Object.entries(objectionPatterns).forEach(([type, patterns]) => {
      patterns.forEach(pattern => {
        if (lineText.includes(pattern)) {
          let response = '';
          let wasOvercome = false;
          let effectiveness = 50;
          
          for (let j = index + 1; j < Math.min(index + 4, lines.length); j++) {
            const nextParts = lines[j].split(':');
            if (nextParts.length < 2) continue;
            
            const nextSpeaker = nextParts[0];
            const nextText = nextParts.slice(1).join(':').trim();
            
            const isSdr = nextSpeaker.includes('SDR') || ['Marcelo', 'Dayane', 'Fernanda', 'Carolina', 'Pedro'].some(name => nextSpeaker.includes(name));
            
            if (isSdr && nextText) {
              response = nextText;
              
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
              
              if (response.length > 50 && effectiveness > 60) {
                wasOvercome = true;
              }
              
              break;
            }
          }
          
          objections.push({
            type,
            text: lineText.substring(0, 150),
            timestamp: currentTimestamp,
            wasOvercome,
            response: response.substring(0, 200) || undefined,
            effectiveness
          });
        }
      });
    });
  });
  
  const uniqueObjections = [];
  objections.forEach(objection => {
    const isDuplicate = uniqueObjections.some(
      existing => existing.type === objection.type && Math.abs(existing.timestamp - objection.timestamp) < 10
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
const POWER_WORDS = ['garantir', 'comprovado', 'resultados', 'sucesso', 'eficaz', 'exclusivo', 'especialista', 'inovador', 'líder', 'premium', 'transformar', 'otimizar', 'maximizar', 'revolucionário', 'estratégico', 'investimento', 'roi', 'crescimento', 'economia', 'lucro', 'solução', 'benefício', 'vantagem', 'oportunidade', 'diferencial', 'parceria', 'colaboração', 'personalizado', 'customizado'];

const WEAK_WORDS = ['talvez', 'acho', 'tipo', 'meio', 'mais ou menos', 'tentar', 'esperar', 'não sei', 'difícil', 'problema', 'desculpa', 'mas', 'porém', 'infelizmente', 'limitado', 'barato', 'simples', 'básico', 'comum', 'normal', 'só', 'apenas', 'possível', 'provável'];

function analyzeLanguage(transcription, duration) {
  const text = transcription.toLowerCase();
  const words = text.split(/\s+/).filter(w => w.length > 2);
  
  let powerWordsCount = 0;
  const foundPowerWords = [];
  
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
  const foundWeakWords = [];
  
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
  
  const questionMatches = text.match(/\?/g) || [];
  const totalQuestions = questionMatches.length;
  
  const openQuestionPatterns = [
    /como\b[^?]*\?/gi, /por que\b[^?]*\?/gi, /o que\b[^?]*\?/gi,
    /quais\b[^?]*\?/gi, /qual\b[^?]*\?/gi, /quando\b[^?]*\?/gi,
    /quem\b[^?]*\?/gi, /onde\b[^?]*\?/gi, /me conta\b[^?]*\?/gi, /me fala\b[^?]*\?/gi
  ];
  
  let openQuestions = 0;
  openQuestionPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) openQuestions += matches.length;
  });
  
  const closedQuestions = Math.max(0, totalQuestions - openQuestions);
  const openQuestionsRatio = totalQuestions > 0 ? (openQuestions / totalQuestions) * 100 : 0;
  
  const parts = duration.split(':').map(Number);
  const totalMinutes = (parts[0] || 0) + (parts[1] || 0) / 60;
  const wordsPerMinute = totalMinutes > 0 ? Math.round(words.length / totalMinutes) : 0;
  
  let paceCategory = 'ideal';
  if (wordsPerMinute < 100) paceCategory = 'muito_lento';
  else if (wordsPerMinute < 120) paceCategory = 'lento';
  else if (wordsPerMinute <= 160) paceCategory = 'ideal';
  else if (wordsPerMinute <= 180) paceCategory = 'rápido';
  else paceCategory = 'muito_rápido';
  
  const casualWords = ['tipo', 'né', 'aí', 'cara', 'mano', 'beleza', 'opa'];
  const aggressiveWords = ['tem que', 'precisa', 'deve', 'obrigatório', 'exijo'];
  const passiveWords = ['talvez', 'acho', 'pode ser', 'não sei', 'meio'];
  const consultiveWords = ['recomendo', 'sugiro', 'na minha experiência', 'aconselho', 'vale a pena'];
  
  let casualScore = 0, aggressiveScore = 0, passiveScore = 0, consultiveScore = 0;
  
  casualWords.forEach(word => { if (text.includes(word)) casualScore++; });
  aggressiveWords.forEach(word => { if (text.includes(word)) aggressiveScore++; });
  passiveWords.forEach(word => { if (text.includes(word)) passiveScore++; });
  consultiveWords.forEach(word => { if (text.includes(word)) consultiveScore++; });
  
  const maxScore = Math.max(casualScore, aggressiveScore, passiveScore, consultiveScore);
  let tone = 'profissional';
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
      openQuestionsRatio
    },
    speechPaceEstimate: {
      wordsPerMinute,
      category: paceCategory
    },
    topPowerWords: foundPowerWords.slice(0, 5),
    topWeakWords: foundWeakWords.slice(0, 5)
  };
}

// Lê e processa o arquivo
const dataPath = path.join(__dirname, '../data/sdr_calls_analysis.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

console.log('Enriquecendo dados de', data.calls.length, 'ligações...');

data.calls.forEach((call, index) => {
  console.log(`Processando ligação ${index + 1}: ${call.id}`);
  
  // Análise de sentimento
  call.sentiment_analysis = analyzeSentiment(call.transcription, call.scores);
  
  // Jornada de sentimento
  call.sentiment_journey = generateSentimentJourney(call.transcription, call.duration);
  
  // Detecção de tópicos
  call.detected_topics = detectTopics(call.transcription);
  
  // Palavras-chave
  call.detected_keywords = detectKeywords(call.transcription);
  
  // NEW: Análise de objeções
  call.detected_objections = detectObjections(call.transcription);
  
  // NEW: Análise de linguagem avançada
  call.language_analysis = analyzeLanguage(call.transcription, call.duration);
  
  // Adiciona scores de sentimento e recalcula average_score
  addSentimentScores(call);
});

// Salva o arquivo atualizado
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log('✓ Dados enriquecidos salvos com sucesso!');
console.log('✓ Novas análises adicionadas: sentiment_analysis, sentiment_journey, detected_topics, detected_keywords, detected_objections, language_analysis');
