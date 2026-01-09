
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create admin user
  console.log('Creating admin user...');
  const hashedPassword = await bcrypt.hash('johndoe123', 12);
  
  let adminUser = await prisma.user.findFirst({
    where: { email: 'john@doe.com' }
  });
  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        id: `cl${randomBytes(16).toString('hex')}`,
        email: 'john@doe.com',
        name: 'Admin User',
        role: 'admin',
        organizationId: 'default-org-id'
      }
    });
  }

  // Create manager user
  let managerUser = await prisma.user.findFirst({
    where: { email: 'gestor@salesimpact.com' }
  });
  if (!managerUser) {
    managerUser = await prisma.user.create({
      data: {
        id: `cl${randomBytes(16).toString('hex')}`,
        email: 'gestor@salesimpact.com',
        name: 'Gestor Sales Impact',
        role: 'manager',
        organizationId: 'default-org-id'
      }
    });
  }

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
    
    let sdr = await prisma.user.findFirst({
      where: { email }
    });
    if (!sdr) {
      sdr = await prisma.user.create({
        data: {
          id: `cl${randomBytes(16).toString('hex')}`,
          name: sdrNameStr,
          email: email,
          role: 'sdr',
          organizationId: 'default-org-id'
        }
      });
    }
    
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
    
    // Get user_id from meetime_users if available, or create a placeholder
    // Note: The calls table uses BigInt for user_id, which references meetime_users
    // For now, we'll set it to null since we're using the User model, not meetime_users
    const userId = null; // Would need to map to meetime_users.id if available
    
    // Create call with correct schema fields
    const call = await prisma.calls.create({
      data: {
        id: BigInt(Date.now() + Math.random() * 1000), // Generate a unique BigInt ID
        date: callDate,
        user_id: userId,
        user_name: callData.sdr_name || null,
        status: callData.result || 'completed',
        call_type: callData.call_type || null,
        receiver_phone: '00000000000', // Required field, using placeholder
        stored_audio_filename: audioFilename,
        notes: callData.transcription || null,
        dialer_parameters: {
          client: callData.client,
          prospect_name: callData.prospect_name,
          duration: callData.duration,
          sentiment_analysis: callData.sentiment_analysis || null,
          sentiment_journey: callData.sentiment_journey || null,
          detected_topics: callData.detected_topics || null,
          detected_keywords: callData.detected_keywords || null,
          detected_objections: callData.detected_objections || null,
          language_analysis: callData.language_analysis || null,
        } as any,
      }
    });

    // Create call scores
    const scores = callData.scores;
    await prisma.monitoriaCallScore.create({
      data: {
        callId: call.id.toString(),
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
        // Sentimento
        nivelEngajamentoCliente: scores.sentimento?.nivel_engajamento_cliente || null,
        confiancaSdr: scores.sentimento?.confianca_sdr || null,
        // AI Feedback
        aiFeedback: callData.ai_feedback,
        averageScore: callData.average_score || 0,
        weightedScore: callData.average_score || 0,
        resultado: callData.result || null,
      }
    });

    console.log(`✅ Created call with scores: ${callData.id}`);
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
