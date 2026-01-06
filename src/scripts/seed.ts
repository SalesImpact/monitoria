
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create admin user
  console.log('Creating admin user...');
  const hashedPassword = await bcrypt.hash('johndoe123', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      name: 'Admin User',
      role: 'admin'
    }
  });

  // Create manager user
  const managerUser = await prisma.user.upsert({
    where: { email: 'gestor@salesimpact.com' },
    update: {},
    create: {
      email: 'gestor@salesimpact.com',
      name: 'Gestor Sales Impact',
      role: 'manager'
    }
  });

  // Read the calls analysis JSON
  const jsonPath = path.join(process.cwd(), 'data', 'sdr_calls_analysis.json');
  const jsonContent = fs.readFileSync(jsonPath, 'utf8');
  const data = JSON.parse(jsonContent);

  console.log(`Found ${data.calls.length} calls to process...`);

  // Create SDRs first
  const sdrNames = [...new Set(data.calls.map((call: any) => call.sdr_name))];
  const sdrMap: Record<string, string> = {};

  for (const sdrName of sdrNames) {
    const sdrNameStr = String(sdrName);
    const email = `${sdrNameStr.toLowerCase().replace(/\s+/g, '.')}@salesimpact.com`;
    
    const sdr = await prisma.sDR.upsert({
      where: { email },
      update: {},
      create: {
        name: sdrNameStr,
        email: email,
        status: 'active',
      }
    });
    
    sdrMap[sdrNameStr] = sdr.id;
    console.log(`Created SDR: ${sdrNameStr}`);
  }

  // Create calls with all data
  for (const callData of data.calls) {
    console.log(`Processing call: ${callData.id}`);
    
    // Parse date
    const callDate = new Date(callData.date);
    
    // Get audio filename from path
    const audioFilename = callData.audio_file ? path.basename(callData.audio_file) : null;
    
    // Create call
    const call = await prisma.call.create({
      data: {
        sdrId: sdrMap[callData.sdr_name],
        sdrName: callData.sdr_name,
        client: callData.client,
        prospectName: callData.prospect_name,
        date: callDate,
        duration: callData.duration,
        callType: callData.call_type,
        result: callData.result,
        audioFile: audioFilename,
        transcription: callData.transcription,
        averageScore: callData.average_score,
        // NEW: Análise de sentimento e tópicos
        sentimentAnalysis: callData.sentiment_analysis || null,
        sentimentJourney: callData.sentiment_journey || null,
        detectedTopics: callData.detected_topics || null,
        detectedKeywords: callData.detected_keywords || null,
        // NEW: Análise de objeções e linguagem avançada
        detectedObjections: callData.detected_objections || null,
        languageAnalysis: callData.language_analysis || null,
      }
    });

    // Create call scores
    const scores = callData.scores;
    await prisma.callScore.create({
      data: {
        callId: call.id,
        // Abertura
        saudacaoApresentacao: scores.abertura.saudacao_apresentacao,
        apresentacaoEmpresa: scores.abertura.apresentacao_empresa,
        solicitacaoConfirmacaoNome: scores.abertura.solicitacao_confirmacao_nome,
        tomVoz: scores.abertura.tom_voz,
        rapport: scores.abertura.rapport,
        // Validação de Objetivo
        perguntasValidacao: scores.validacao_objetivo.perguntas_validacao,
        escutaAtiva: scores.validacao_objetivo.escuta_ativa,
        pitchSolucao: scores.validacao_objetivo.pitch_solucao,
        historiaCliente: scores.validacao_objetivo.historia_cliente,
        // SPIN Selling
        perguntasSituacao: scores.spin_selling.perguntas_situacao,
        perguntasProblema: scores.spin_selling.perguntas_problema,
        perguntasImplicacao: scores.spin_selling.perguntas_implicacao,
        perguntasNecessidadeSolucao: scores.spin_selling.perguntas_necessidade_solucao,
        // Próximos Passos
        confirmouEntendimento: scores.proximos_passos.confirmou_entendimento,
        vendeuProximoPasso: scores.proximos_passos.vendeu_proximo_passo,
        agendouConcluiu: scores.proximos_passos.agendou_concluiu,
        // NEW: Sentimento
        nivelEngajamentoCliente: scores.sentimento?.nivel_engajamento_cliente || null,
        confiancaSdr: scores.sentimento?.confianca_sdr || null,
        // AI Feedback
        aiFeedback: callData.ai_feedback,
      }
    });

    // Create keywords
    for (const keyword of callData.keywords) {
      await prisma.keyword.create({
        data: {
          callId: call.id,
          word: keyword,
        }
      });
    }

    console.log(`✅ Created call with scores and keywords: ${callData.id}`);
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
