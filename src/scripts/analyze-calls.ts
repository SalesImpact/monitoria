import { Pool, PoolConfig } from 'pg';
import OpenAI from 'openai';
import { randomUUID } from 'crypto';

interface TranscriptionSegment {
  end: number;
  text: string;
  start: number;
  speaker: string;
}

interface CallTranscription {
  call_id: number;
  transcription_text: string;
  transcription_segments?: TranscriptionSegment[] | null;
}

interface SeparatedTranscription {
  sdrText: string;
  prospectText: string;
  fullText: string;
}

interface CallScores {
  // ABERTURA
  saudacao_apresentacao: number;
  apresentacao_empresa: number;
  solicitacao_confirmacao_nome: number;
  tom_voz: number;
  rapport: number;
  // VALIDAÇÃO DO OBJETIVO
  perguntas_validacao: number;
  escuta_ativa: number;
  pitch_solucao: number;
  historia_cliente: number;
  // SPIN SELLING
  perguntas_situacao: number;
  perguntas_problema: number;
  perguntas_implicacao: number;
  perguntas_necessidade_solucao: number;
  // PRÓXIMOS PASSOS
  confirmou_entendimento: number;
  vendeu_proximo_passo: number;
  agendou_concluiu: number;
  // Opcionais
  nivel_engajamento_cliente?: number;
  confianca_sdr?: number;
  ai_feedback: string;
  // Novos campos
  resultado?: string;
  sentimento_geral?: string;
  sentimento_cliente?: string;
  sentimento_sdr?: string;
  objeções?: Record<string, boolean>;
  objeções_superadas?: Record<string, boolean>;
  palavras_chave_positivas?: Record<string, number>;
  palavras_chave_negativas?: Record<string, number>;
  palavras_chave_neutras?: Record<string, number>;
}

interface AnalysisResult {
  scores: CallScores;
  average_score: number;
  weighted_score: number;
}

interface Stats {
  total: number;
  success: number;
  errors: number;
  skipped: number;
  startTime: number;
  endTime?: number;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function separateTranscriptionBySpeaker(
  transcription: CallTranscription
): SeparatedTranscription {
  let sdrText = '';
  let prospectText = '';
  let fullText = transcription.transcription_text;

  if (transcription.transcription_segments && Array.isArray(transcription.transcription_segments)) {
    const sdrSegments: string[] = [];
    const prospectSegments: string[] = [];

    for (const segment of transcription.transcription_segments) {
      const text = segment.text?.trim() || '';
      if (!text) continue;

      if (segment.speaker === 'SDR') {
        sdrSegments.push(text);
      } else if (segment.speaker === 'PROSPECT') {
        prospectSegments.push(text);
      }
    }

    sdrText = sdrSegments.join(' ');
    prospectText = prospectSegments.join(' ');
  }

  return {
    sdrText,
    prospectText,
    fullText,
  };
}

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed: {
    dryRun: boolean;
    limit?: number;
    force: boolean;
    workers: number;
  } = {
    dryRun: false,
    force: false,
    workers: 30,
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dry-run') {
      parsed.dryRun = true;
    } else if (args[i] === '--limit' && i + 1 < args.length) {
      parsed.limit = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--force' || args[i] === '--reanalyze') {
      parsed.force = true;
    } else if (args[i] === '--workers' && i + 1 < args.length) {
      parsed.workers = parseInt(args[i + 1], 10);
      i++;
    }
  }

  return parsed;
}

function buildAnalysisPrompt(
  separated: SeparatedTranscription
): string {
  const { fullText, sdrText, prospectText } = separated;
  
  return `Você é um especialista em análise de ligações de vendas. Analise a seguinte transcrição de uma ligação de vendas e avalie o desempenho do SDR (Sales Development Representative) segundo 16 critérios específicos, além de extrair informações adicionais sobre resultado, sentimentos, objeções e palavras-chave.

TRANSCRIÇÃO COMPLETA DA LIGAÇÃO:
${fullText}

${sdrText ? `TEXTO DO SDR:
${sdrText}

` : ''}${prospectText ? `TEXTO DO PROSPECT/CLIENTE:
${prospectText}

` : ''}INSTRUÇÕES:
1. Avalie cada critério de 0 a 5 (0 = ausente/péssimo, 5 = excelente)
2. Seja rigoroso mas justo na avaliação
3. Retorne APENAS um JSON válido, sem markdown, sem texto adicional

CRITÉRIOS DE AVALIAÇÃO:

1. ABERTURA (Opening):
   1.1 Saudação e Apresentação (0-5): Cordialidade, clareza na identificação pessoal. 5 = Saudação calorosa + apresentação clara do nome. 0-2 = Falta de apresentação ou tom inadequado.
   1.2 Apresentação da Empresa (0-5): Clareza sobre qual empresa representa. 5 = Menciona empresa de forma clara e contextualizada. 0-2 = Não menciona ou menciona confusamente.
   1.3 Confirmação do Nome (0-5): Confirmação educada do nome do interlocutor. 5 = Confirma o nome de forma natural. 0-2 = Não confirma ou faz de forma inadequada.
   1.4 Tom de Voz (0-5): Energia, clareza, confiança na fala. 5 = Tom profissional, energético e confiante. 0-2 = Monótono, inseguro ou agressivo.
   1.5 Rapport (0-5): Capacidade de criar conexão com o cliente. 5 = Cria empatia, usa humor adequado, escuta ativamente. 0-2 = Conversa puramente transacional.

2. VALIDAÇÃO DO OBJETIVO:
   2.1 Perguntas de Validação (0-5): Uso de perguntas para confirmar interesse/qualificação. 5 = Faz múltiplas perguntas qualificadoras. 0-2 = Não faz perguntas de validação.
   2.2 Escuta Ativa (0-5): Demonstra estar ouvindo e processando informações. 5 = Parafraseia, faz perguntas de follow-up. 0-2 = Interrompe, não responde adequadamente.
   2.3 Pitch da Solução (0-5): Clareza e relevância da apresentação da solução. 5 = Pitch customizado, focado em benefícios. 0-2 = Genérico, focado em features.
   2.4 História do Cliente (0-5): Uso de cases ou exemplos de sucesso. 5 = Conta história relevante e impactante. 0-2 = Não usa social proof.

3. SPIN SELLING:
   3.1 Perguntas de Situação (0-5): Perguntas sobre contexto atual do cliente (ex: "Como é seu processo atual?", "Quantas pessoas na equipe?"). 5 = Múltiplas perguntas contextuais. 0-2 = Não faz perguntas de situação.
   3.2 Perguntas de Problema (0-5): Identificação de dores e desafios (ex: "Quais dificuldades vocês enfrentam?", "O que não funciona bem?"). 5 = Explora problemas em profundidade. 0-2 = Não identifica problemas.
   3.3 Perguntas de Implicação (0-5): Explora consequências dos problemas (ex: "Quanto isso custa?", "Como isso afeta sua equipe?"). 5 = Amplia percepção do problema. 0-2 = Não explora implicações.
   3.4 Perguntas de Necessidade-Solução (0-5): Perguntas sobre valor da solução (ex: "Seria útil se...?", "Quão importante é resolver isso?"). 5 = Cliente mesmo verbaliza valor. 0-2 = Não explora necessidade.

4. PRÓXIMOS PASSOS:
   4.1 Confirmou Entendimento (0-5): Resumo e confirmação do que foi discutido. 5 = Resume pontos-chave e confirma alinhamento. 0-2 = Não confirma entendimento.
   4.2 Vendeu Próximo Passo (0-5): Clareza sobre o que virá a seguir. 5 = Propõe próximo passo com valor claro. 0-2 = Não propõe continuidade.
   4.3 Agendou/Concluiu (0-5): Fechou compromisso concreto. 5 = Agendamento confirmado com data/hora. 0-2 = Sem compromisso definido.

5. RESULTADO DA LIGAÇÃO:
   Analise o desfecho da ligação e classifique em uma das três categorias:
   - "Agendado": Houve agendamento de reunião/demo/next step com data/hora definida
   - "Não Agendado": Ligação não resultou em agendamento
   - "Qualificação Sucesso": Cliente foi qualificado com sucesso mesmo sem agendamento (ex: interessado, fit identificado, mas timing não é agora)

6. SENTIMENTOS:
   Analise o sentimento durante a conversa:
   - sentimento_geral: Sentimento geral da conversa (POSITIVO, NEGATIVO, NEUTRO)
   - sentimento_cliente: Sentimento do cliente/prospect (POSITIVO, NEGATIVO, NEUTRO)
   - sentimento_sdr: Sentimento do SDR durante a conversa (POSITIVO, NEGATIVO, NEUTRO)

7. OBJEÇÕES:
   Identifique quais objeções foram levantadas pelo cliente durante a conversa. As 8 categorias são:
   - Preço: Objeções relacionadas a custo, preço alto, orçamento
   - Timing: Objeções sobre momento, tempo, prioridades
   - Concorrência: Mencionou soluções/concorrentes existentes
   - Funcionalidades: Falta de recursos ou funcionalidades
   - Autoridade: Precisa consultar outra pessoa/equipe
   - Necessidade: Não vê necessidade ou problema não existe
   - Confiança: Dúvidas sobre empresa, produto, credibilidade
   - Outros: Outras objeções não categorizadas
   
   Para cada objeção detectada, identifique se foi superada pelo SDR (objeções_superadas). Uma objeção é considerada superada quando o cliente demonstra aceitação da resposta do SDR ou muda de posição.

8. PALAVRAS-CHAVE:
   Extraia palavras-chave significativas da conversa e categorize por sentimento:
   - palavras_chave_positivas: Palavras que indicam sentimento positivo (ex: "perfeito", "excelente", "ótimo", "interessante") com contagem de ocorrências
   - palavras_chave_negativas: Palavras que indicam sentimento negativo (ex: "não", "problema", "difícil", "caro") com contagem de ocorrências
   - palavras_chave_neutras: Palavras neutras (ex: "talvez", "possivelmente", "ver", "analisar") com contagem de ocorrências
   
   Formato: objeto JSON onde a chave é a palavra e o valor é o número de vezes que apareceu na conversa.

FORMATO DE RESPOSTA (JSON):
{
  "scores": {
    "saudacao_apresentacao": 0-5,
    "apresentacao_empresa": 0-5,
    "solicitacao_confirmacao_nome": 0-5,
    "tom_voz": 0-5,
    "rapport": 0-5,
    "perguntas_validacao": 0-5,
    "escuta_ativa": 0-5,
    "pitch_solucao": 0-5,
    "historia_cliente": 0-5,
    "perguntas_situacao": 0-5,
    "perguntas_problema": 0-5,
    "perguntas_implicacao": 0-5,
    "perguntas_necessidade_solucao": 0-5,
    "confirmou_entendimento": 0-5,
    "vendeu_proximo_passo": 0-5,
    "agendou_concluiu": 0-5,
    "nivel_engajamento_cliente": 0-5 (opcional),
    "confianca_sdr": 0-5 (opcional)
  },
  "resultado": "Agendado" | "Não Agendado" | "Qualificação Sucesso",
  "sentimento_geral": "POSITIVO" | "NEGATIVO" | "NEUTRO",
  "sentimento_cliente": "POSITIVO" | "NEGATIVO" | "NEUTRO",
  "sentimento_sdr": "POSITIVO" | "NEGATIVO" | "NEUTRO",
  "objeções": {
    "Preço": true/false,
    "Timing": true/false,
    "Concorrência": true/false,
    "Funcionalidades": true/false,
    "Autoridade": true/false,
    "Necessidade": true/false,
    "Confiança": true/false,
    "Outros": true/false
  },
  "objeções_superadas": {
    "Preço": true/false,
    "Timing": true/false,
    "Concorrência": true/false,
    "Funcionalidades": true/false,
    "Autoridade": true/false,
    "Necessidade": true/false,
    "Confiança": true/false,
    "Outros": true/false
  },
  "palavras_chave_positivas": {
    "palavra1": quantidade,
    "palavra2": quantidade
  },
  "palavras_chave_negativas": {
    "palavra1": quantidade,
    "palavra2": quantidade
  },
  "palavras_chave_neutras": {
    "palavra1": quantidade,
    "palavra2": quantidade
  },
  "ai_feedback": "Feedback qualitativo detalhado sobre a ligação, destacando pontos fortes e oportunidades de melhoria (máximo 500 palavras)"
}`;
}

async function analyzeWithOpenAI(
  openai: OpenAI,
  separated: SeparatedTranscription,
  maxRetries = 3
): Promise<AnalysisResult> {
  const prompt = buildAnalysisPrompt(separated);
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Você é um analista especializado em avaliação de ligações de vendas. Retorne sempre JSON válido, sem markdown, sem texto adicional.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Resposta vazia da OpenAI');
      }

      const parsed = JSON.parse(content);
      const scores = parsed.scores as CallScores;
      const aiFeedback = parsed.ai_feedback || '';

      // Validar scores
      const allScores = [
        scores.saudacao_apresentacao,
        scores.apresentacao_empresa,
        scores.solicitacao_confirmacao_nome,
        scores.tom_voz,
        scores.rapport,
        scores.perguntas_validacao,
        scores.escuta_ativa,
        scores.pitch_solucao,
        scores.historia_cliente,
        scores.perguntas_situacao,
        scores.perguntas_problema,
        scores.perguntas_implicacao,
        scores.perguntas_necessidade_solucao,
        scores.confirmou_entendimento,
        scores.vendeu_proximo_passo,
        scores.agendou_concluiu,
      ];

      // Validar que todos os scores estão entre 0 e 5
      for (const score of allScores) {
        if (typeof score !== 'number' || score < 0 || score > 5) {
          throw new Error(`Score inválido: ${score}. Deve estar entre 0 e 5.`);
        }
      }

      // Validar resultado
      const validResults = ['Agendado', 'Não Agendado', 'Qualificação Sucesso'];
      if (parsed.resultado && !validResults.includes(parsed.resultado)) {
        throw new Error(`Resultado inválido: ${parsed.resultado}. Deve ser um de: ${validResults.join(', ')}`);
      }

      // Validar sentimentos
      const validSentimentos = ['POSITIVO', 'NEGATIVO', 'NEUTRO'];
      if (parsed.sentimento_geral && !validSentimentos.includes(parsed.sentimento_geral)) {
        throw new Error(`Sentimento geral inválido: ${parsed.sentimento_geral}`);
      }
      if (parsed.sentimento_cliente && !validSentimentos.includes(parsed.sentimento_cliente)) {
        throw new Error(`Sentimento cliente inválido: ${parsed.sentimento_cliente}`);
      }
      if (parsed.sentimento_sdr && !validSentimentos.includes(parsed.sentimento_sdr)) {
        throw new Error(`Sentimento SDR inválido: ${parsed.sentimento_sdr}`);
      }

      // Calcular média simples
      const averageScore =
        allScores.reduce((sum, s) => sum + s, 0) / allScores.length;

      // Calcular média ponderada (categorias têm pesos diferentes)
      const aberturaAvg =
        (scores.saudacao_apresentacao +
          scores.apresentacao_empresa +
          scores.solicitacao_confirmacao_nome +
          scores.tom_voz +
          scores.rapport) /
        5;
      const validacaoAvg =
        (scores.perguntas_validacao +
          scores.escuta_ativa +
          scores.pitch_solucao +
          scores.historia_cliente) /
        4;
      const spinAvg =
        (scores.perguntas_situacao +
          scores.perguntas_problema +
          scores.perguntas_implicacao +
          scores.perguntas_necessidade_solucao) /
        4;
      const proximosPassosAvg =
        (scores.confirmou_entendimento +
          scores.vendeu_proximo_passo +
          scores.agendou_concluiu) /
        3;

      // Pesos: Abertura (20%), Validação (25%), SPIN (30%), Próximos Passos (25%)
      const weightedScore =
        aberturaAvg * 0.2 +
        validacaoAvg * 0.25 +
        spinAvg * 0.3 +
        proximosPassosAvg * 0.25;

      return {
        scores: {
          ...scores,
          ai_feedback: aiFeedback,
          resultado: parsed.resultado,
          sentimento_geral: parsed.sentimento_geral,
          sentimento_cliente: parsed.sentimento_cliente,
          sentimento_sdr: parsed.sentimento_sdr,
          objeções: parsed.objeções || {},
          objeções_superadas: parsed.objeções_superadas || {},
          palavras_chave_positivas: parsed.palavras_chave_positivas || {},
          palavras_chave_negativas: parsed.palavras_chave_negativas || {},
          palavras_chave_neutras: parsed.palavras_chave_neutras || {},
        },
        average_score: Math.round(averageScore * 100) / 100,
        weighted_score: Math.round(weightedScore * 100) / 100,
      };
    } catch (error: any) {
      lastError = error;
      const isRateLimit = error?.status === 429 || error?.message?.includes('rate limit');
      
      if (isRateLimit && attempt < maxRetries) {
        const backoffMs = Math.pow(2, attempt) * 1000;
        console.warn(
          `Rate limit atingido. Tentativa ${attempt}/${maxRetries}. Aguardando ${backoffMs}ms...`
        );
        await sleep(backoffMs);
        continue;
      }

      if (attempt < maxRetries) {
        const backoffMs = Math.pow(2, attempt) * 1000;
        console.warn(
          `Erro na tentativa ${attempt}/${maxRetries}: ${error.message}. Aguardando ${backoffMs}ms...`
        );
        await sleep(backoffMs);
        continue;
      }

      throw error;
    }
  }

  throw lastError || new Error('Falha ao analisar com OpenAI após múltiplas tentativas');
}

async function fetchTranscriptions(
  pool: Pool,
  limit?: number,
  force = false
): Promise<CallTranscription[]> {
  const params: any[] = [];
  let paramIndex = 1;

  // Hardcoded: Filtrar apenas calls do usuário Vitor (meetime_user_id: 41888)
  const MEETIME_USER_ID = 41888;

  let query = `
    SELECT ct.call_id, ct.transcription_text, ct.transcription_segments
    FROM call_transcriptions ct
    INNER JOIN calls c ON ct.call_id = c.id
  `;

  const whereConditions: string[] = [];

  if (!force) {
    query += `
      LEFT JOIN monitoria_call_scores mcs ON ct.call_id::text = mcs.call_id
    `;
    whereConditions.push(`mcs.call_id IS NULL`);
  }

  // Filtrar apenas calls do usuário especificado
  whereConditions.push(`c.user_id = $${paramIndex}::bigint`);
  params.push(MEETIME_USER_ID);
  paramIndex++;

  if (whereConditions.length > 0) {
    query += ` WHERE ${whereConditions.join(' AND ')}`;
  }

  query += ` ORDER BY ct.created_at DESC`;

  if (limit) {
    query += ` LIMIT $${paramIndex}`;
    params.push(limit);
  }

  const result = await pool.query<CallTranscription>(query, params);

  return result.rows;
}

// Função para processar uma transcrição individual
async function processTranscription(
  pool: Pool,
  openai: OpenAI,
  transcription: CallTranscription,
  dryRun: boolean,
  index: number,
  total: number
): Promise<{ success: boolean; error?: string }> {
  const progress = `[${index + 1}/${total}]`;
  
  try {
    if (!transcription.transcription_text || transcription.transcription_text.trim().length === 0) {
      console.warn(`${progress} ⚠️  call_id ${transcription.call_id}: Transcrição vazia, pulando...`);
      return { success: false, error: 'Transcrição vazia' };
    }

    const separated = separateTranscriptionBySpeaker(transcription);
    const analysis = await analyzeWithOpenAI(openai, separated);
    await saveScores(pool, transcription.call_id, analysis, dryRun);

    console.log(
      `${progress} ✅ call_id ${transcription.call_id} - Average: ${analysis.average_score.toFixed(2)}, Weighted: ${analysis.weighted_score.toFixed(2)}`
    );
    
    return { success: true };
  } catch (error: any) {
    console.error(
      `${progress} ❌ call_id ${transcription.call_id}: ${error.message}`
    );
    return { success: false, error: error.message };
  }
}

// Função para processar com controle de concorrência
async function processWithWorkers(
  pool: Pool,
  openai: OpenAI,
  transcriptions: CallTranscription[],
  dryRun: boolean,
  maxWorkers: number
): Promise<Stats> {
  const stats: Stats = {
    total: transcriptions.length,
    success: 0,
    errors: 0,
    skipped: 0,
    startTime: Date.now(),
  };

  // Fila de processamento com controle de concorrência
  let currentIndex = 0;

  // Função worker que processa itens da fila
  const worker = async (): Promise<void> => {
    while (currentIndex < transcriptions.length) {
      const index = currentIndex++;
      const transcription = transcriptions[index];
      
      const result = await processTranscription(
        pool,
        openai,
        transcription,
        dryRun,
        index,
        transcriptions.length
      );

      // Atualiza estatísticas de forma thread-safe
      if (result.success) {
        stats.success++;
      } else {
        if (result.error === 'Transcrição vazia') {
          stats.skipped++;
        } else {
          stats.errors++;
        }
      }
    }
  };

  // Inicia todos os workers
  const workers = Array.from({ length: maxWorkers }, () => worker());
  
  // Aguarda todos os workers terminarem
  await Promise.all(workers);

  return stats;
}

async function saveScores(
  pool: Pool,
  callId: number,
  analysis: AnalysisResult,
  dryRun: boolean
): Promise<void> {
  if (dryRun) {
    return;
  }

  const id = randomUUID();
  const now = new Date();

  const userIdQuery = await pool.query(
    'SELECT user_id FROM calls WHERE id = $1',
    [callId]
  );
  const userId = userIdQuery.rows[0]?.user_id || null;

  const query = `
    INSERT INTO monitoria_call_scores (
      id, call_id, user_id,
      saudacao_apresentacao, apresentacao_empresa, solicitacao_confirmacao_nome,
      tom_voz, rapport,
      perguntas_validacao, escuta_ativa, pitch_solucao, historia_cliente,
      perguntas_situacao, perguntas_problema, perguntas_implicacao,
      perguntas_necessidade_solucao,
      confirmou_entendimento, vendeu_proximo_passo, agendou_concluiu,
      nivel_engajamento_cliente, confianca_sdr,
      average_score, weighted_score, ai_feedback,
      resultado, sentimento_geral, sentimento_cliente, sentimento_sdr,
      objeções, objeções_superadas,
      palavras_chave_positivas, palavras_chave_negativas, palavras_chave_neutras,
      created_at, updated_at
    ) VALUES (
      $1, $2::text, $3,
      $4, $5, $6, $7, $8,
      $9, $10, $11, $12,
      $13, $14, $15, $16,
      $17, $18, $19,
      $20, $21,
      $22, $23, $24,
      $25, $26, $27, $28,
      $29::jsonb, $30::jsonb,
      $31::jsonb, $32::jsonb, $33::jsonb,
      $34, $35
    )
    ON CONFLICT (call_id) 
    DO UPDATE SET
      user_id = EXCLUDED.user_id,
      saudacao_apresentacao = EXCLUDED.saudacao_apresentacao,
      apresentacao_empresa = EXCLUDED.apresentacao_empresa,
      solicitacao_confirmacao_nome = EXCLUDED.solicitacao_confirmacao_nome,
      tom_voz = EXCLUDED.tom_voz,
      rapport = EXCLUDED.rapport,
      perguntas_validacao = EXCLUDED.perguntas_validacao,
      escuta_ativa = EXCLUDED.escuta_ativa,
      pitch_solucao = EXCLUDED.pitch_solucao,
      historia_cliente = EXCLUDED.historia_cliente,
      perguntas_situacao = EXCLUDED.perguntas_situacao,
      perguntas_problema = EXCLUDED.perguntas_problema,
      perguntas_implicacao = EXCLUDED.perguntas_implicacao,
      perguntas_necessidade_solucao = EXCLUDED.perguntas_necessidade_solucao,
      confirmou_entendimento = EXCLUDED.confirmou_entendimento,
      vendeu_proximo_passo = EXCLUDED.vendeu_proximo_passo,
      agendou_concluiu = EXCLUDED.agendou_concluiu,
      nivel_engajamento_cliente = EXCLUDED.nivel_engajamento_cliente,
      confianca_sdr = EXCLUDED.confianca_sdr,
      average_score = EXCLUDED.average_score,
      weighted_score = EXCLUDED.weighted_score,
      ai_feedback = EXCLUDED.ai_feedback,
      resultado = EXCLUDED.resultado,
      sentimento_geral = EXCLUDED.sentimento_geral,
      sentimento_cliente = EXCLUDED.sentimento_cliente,
      sentimento_sdr = EXCLUDED.sentimento_sdr,
      objeções = EXCLUDED.objeções,
      objeções_superadas = EXCLUDED.objeções_superadas,
      palavras_chave_positivas = EXCLUDED.palavras_chave_positivas,
      palavras_chave_negativas = EXCLUDED.palavras_chave_negativas,
      palavras_chave_neutras = EXCLUDED.palavras_chave_neutras,
      updated_at = EXCLUDED.updated_at
    `;

  await pool.query(query, [
    id,
    callId.toString(),
    userId,
    analysis.scores.saudacao_apresentacao,
    analysis.scores.apresentacao_empresa,
    analysis.scores.solicitacao_confirmacao_nome,
    analysis.scores.tom_voz,
    analysis.scores.rapport,
    analysis.scores.perguntas_validacao,
    analysis.scores.escuta_ativa,
    analysis.scores.pitch_solucao,
    analysis.scores.historia_cliente,
    analysis.scores.perguntas_situacao,
    analysis.scores.perguntas_problema,
    analysis.scores.perguntas_implicacao,
    analysis.scores.perguntas_necessidade_solucao,
    analysis.scores.confirmou_entendimento,
    analysis.scores.vendeu_proximo_passo,
    analysis.scores.agendou_concluiu,
    analysis.scores.nivel_engajamento_cliente || null,
    analysis.scores.confianca_sdr || null,
    analysis.average_score,
    analysis.weighted_score,
    analysis.scores.ai_feedback,
    analysis.scores.resultado || null,
    analysis.scores.sentimento_geral || null,
    analysis.scores.sentimento_cliente || null,
    analysis.scores.sentimento_sdr || null,
    analysis.scores.objeções ? JSON.stringify(analysis.scores.objeções) : null,
    analysis.scores.objeções_superadas ? JSON.stringify(analysis.scores.objeções_superadas) : null,
    analysis.scores.palavras_chave_positivas ? JSON.stringify(analysis.scores.palavras_chave_positivas) : null,
    analysis.scores.palavras_chave_negativas ? JSON.stringify(analysis.scores.palavras_chave_negativas) : null,
    analysis.scores.palavras_chave_neutras ? JSON.stringify(analysis.scores.palavras_chave_neutras) : null,
    now,
    now,
  ]);
}

function printStats(stats: Stats) {
  stats.endTime = Date.now();
  const duration = ((stats.endTime - stats.startTime) / 1000).toFixed(2);

  console.log('\n' + '='.repeat(60));
  console.log('RESUMO ESTATÍSTICO');
  console.log('='.repeat(60));
  console.log(`Total de calls encontradas: ${stats.total}`);
  console.log(`Calls processadas com sucesso: ${stats.success}`);
  console.log(`Calls com erro: ${stats.errors}`);
  console.log(`Calls puladas (já analisadas): ${stats.skipped}`);
  console.log(`Tempo total de execução: ${duration}s`);
  console.log(`Taxa de sucesso: ${stats.total > 0 ? ((stats.success / stats.total) * 100).toFixed(1) : 0}%`);
  console.log('='.repeat(60) + '\n');
}

async function main() {
  const args = parseArgs();

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL não definida no .env');
    process.exit(1);
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY não definida no .env');
    process.exit(1);
  }

  // Configuração SSL: aceita certificados autoassinados por padrão
  // Isso resolve problemas comuns em ambientes de desenvolvimento/staging
  const dbUrl = process.env.DATABASE_URL || '';
  
  // Parse da URL do PostgreSQL usando URL nativo do Node.js
  let poolConfig: PoolConfig;
  
  try {
    // Tenta fazer parse da URL
    const url = new URL(dbUrl);
    const auth = url.username && url.password 
      ? { user: decodeURIComponent(url.username), password: decodeURIComponent(url.password) }
      : {};
    
    poolConfig = {
      host: url.hostname,
      port: url.port ? parseInt(url.port, 10) : 5432,
      database: url.pathname.slice(1).split('?')[0], // Remove / e query params
      ...auth,
      ssl: {
        rejectUnauthorized: false,
      },
      // Aumenta o pool de conexões para suportar workers paralelos
      max: Math.max(20, args.workers + 10),
    };
  } catch (error) {
    // Se o parse falhar, usa connectionString diretamente
    // Mas ainda força SSL com rejectUnauthorized: false
    poolConfig = {
      connectionString: dbUrl,
      ssl: {
        rejectUnauthorized: false,
      },
      max: Math.max(20, args.workers + 10),
    } as PoolConfig;
  }

  const pool = new Pool(poolConfig);

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    console.log('🔍 Buscando transcrições...');
    console.log('🔍 Filtrando apenas calls do usuário Vitor (meetime_user_id: 41888)');
    if (args.force) {
      console.log('⚠️  Modo FORCE ativado - re-analisando calls já processadas');
    } else {
      console.log('ℹ️  Pulando calls já analisadas (use --force para re-analisar)');
    }

    const transcriptions = await fetchTranscriptions(
      pool,
      args.limit,
      args.force
    );

    if (transcriptions.length === 0) {
      console.log('✅ Nenhuma transcrição encontrada para processar.');
      await pool.end();
      return;
    }

    console.log(`📊 Encontradas ${transcriptions.length} transcrição(ões) para processar`);
    console.log(`🚀 Processando com ${args.workers} workers paralelos\n`);

    if (args.dryRun) {
      console.log('🧪 MODO DRY-RUN: Nenhum dado será salvo no banco\n');
    }

    const stats = await processWithWorkers(
      pool,
      openai,
      transcriptions,
      args.dryRun,
      args.workers
    );

    printStats(stats);
  } catch (error: any) {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main().catch(console.error);

