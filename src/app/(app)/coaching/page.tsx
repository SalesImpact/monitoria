'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, TrendingUp, PlayCircle, Video, FileText, AlertCircle, Users } from 'lucide-react';

function generateMicroTrainings(improvements: any[]) {
  const trainingLibrary: Record<string, any[]> = {
    'Saudação e Apresentação': [
      {
        id: 'mt_saudacao_1',
        titulo: 'Saudação e Apresentação Profissional',
        tipo: 'vídeo',
        duracao_minutos: 5,
        descricao: 'Técnicas para uma saudação calorosa e apresentação clara do seu nome.',
        nivel: 'iniciante',
      }
    ],
    'Apresentação da Empresa': [
      {
        id: 'mt_empresa_1',
        titulo: 'Como Apresentar sua Empresa de Forma Clara',
        tipo: 'vídeo',
        duracao_minutos: 6,
        descricao: 'Aprenda a mencionar sua empresa de forma contextualizada e credível.',
        nivel: 'iniciante',
      }
    ],
    'Confirmação do Nome': [
      {
        id: 'mt_nome_1',
        titulo: 'Confirmação Educada do Nome',
        tipo: 'artigo',
        duracao_minutos: 3,
        descricao: 'Técnicas para confirmar o nome do interlocutor de forma natural.',
        nivel: 'iniciante',
      }
    ],
    'Tom de Voz': [
      {
        id: 'mt_tom_1',
        titulo: 'Tom de Voz Profissional e Confiante',
        tipo: 'vídeo',
        duracao_minutos: 8,
        descricao: 'Como transmitir profissionalismo e engajamento através do tom de voz.',
        nivel: 'iniciante',
      }
    ],
    'Rapport': [
      {
        id: 'mt_rapport_1',
        titulo: 'Construindo Rapport Rapidamente',
        tipo: 'vídeo',
        duracao_minutos: 7,
        descricao: 'Estratégias comprovadas para criar conexão genuína com prospects.',
        nivel: 'iniciante',
      }
    ],
    'Perguntas de Validação': [
      {
        id: 'mt_validacao_1',
        titulo: 'Perguntas de Validação Eficazes',
        tipo: 'vídeo',
        duracao_minutos: 10,
        descricao: 'Técnicas para fazer perguntas qualificadoras e validar interesse.',
        nivel: 'intermediário',
      }
    ],
    'Escuta Ativa': [
      {
        id: 'mt_escuta_1',
        titulo: 'Escuta Ativa: Além de Ouvir',
        tipo: 'artigo',
        duracao_minutos: 5,
        descricao: 'Técnicas práticas para melhorar sua escuta ativa e captar sinais importantes.',
        nivel: 'iniciante',
      }
    ],
    'Pitch da Solução': [
      {
        id: 'mt_pitch_1',
        titulo: 'Pitch Customizado e Focado em Benefícios',
        tipo: 'vídeo',
        duracao_minutos: 12,
        descricao: 'Como criar um pitch relevante que conecta solução às necessidades do cliente.',
        nivel: 'intermediário',
      }
    ],
    'História do Cliente': [
      {
        id: 'mt_historia_1',
        titulo: 'Usando Cases e Exemplos de Sucesso',
        tipo: 'vídeo',
        duracao_minutos: 8,
        descricao: 'Como contar histórias relevantes e impactantes para aumentar credibilidade.',
        nivel: 'intermediário',
      }
    ],
    'Perguntas de Situação': [
      {
        id: 'mt_spin_situacao_1',
        titulo: 'Fundamentos do SPIN: Perguntas de Situação',
        tipo: 'vídeo',
        duracao_minutos: 8,
        descricao: 'Aprenda a fazer perguntas de situação eficazes que revelam o contexto do cliente.',
        nivel: 'iniciante',
      }
    ],
    'Perguntas de Problema': [
      {
        id: 'mt_spin_problema_1',
        titulo: 'Identificando Dores: Perguntas de Problema',
        tipo: 'vídeo',
        duracao_minutos: 10,
        descricao: 'Técnicas para descobrir problemas reais que o prospect enfrenta.',
        nivel: 'intermediário',
      }
    ],
    'Perguntas de Implicação': [
      {
        id: 'mt_spin_implicacao_1',
        titulo: 'Ampliando Impacto: Perguntas de Implicação',
        tipo: 'vídeo',
        duracao_minutos: 12,
        descricao: 'Como expandir a percepção de valor através de perguntas de implicação.',
        nivel: 'avançado',
      }
    ],
    'Perguntas de Necessidade': [
      {
        id: 'mt_spin_necessidade_1',
        titulo: 'Perguntas de Necessidade-Solução (SPIN)',
        tipo: 'vídeo',
        duracao_minutos: 10,
        descricao: 'Técnicas para fazer o cliente verbalizar o valor da solução.',
        nivel: 'avançado',
      }
    ],
    'Confirmou Entendimento': [
      {
        id: 'mt_entendimento_1',
        titulo: 'Confirmação de Entendimento',
        tipo: 'artigo',
        duracao_minutos: 4,
        descricao: 'Como resumir pontos-chave e confirmar alinhamento para evitar mal-entendidos.',
        nivel: 'iniciante',
      }
    ],
    'Vendeu Próximo Passo': [
      {
        id: 'mt_proximo_passo_1',
        titulo: 'Vendendo o Próximo Passo com Valor',
        tipo: 'vídeo',
        duracao_minutos: 9,
        descricao: 'Técnicas para propor próximo passo com valor claro e manter momentum.',
        nivel: 'intermediário',
      }
    ],
    'Agendou/Concluiu': [
      {
        id: 'mt_fechamento_1',
        titulo: 'Técnicas de Fechamento e Agendamento',
        tipo: 'vídeo',
        duracao_minutos: 9,
        descricao: 'Como confirmar próximos passos de forma assertiva e natural.',
        nivel: 'intermediário',
      }
    ],
  };
  
  const suggested = improvements.flatMap(imp => 
    trainingLibrary[imp.criterio] || []
  );
  
  return suggested.length > 0 ? suggested : [
    {
      id: 'mt_geral_1',
      titulo: 'Fundamentos de SDR de Alta Performance',
      tipo: 'vídeo',
      duracao_minutos: 15,
      descricao: 'Overview completo das melhores práticas para SDRs.',
      nivel: 'iniciante',
    }
  ];
}

function generateRolePlays(improvements: any[]) {
  const rolePlayLibrary: Record<string, any> = {
    'spin_selling': {
      id: 'rp_spin_1',
      titulo: 'Prática de SPIN Selling Completo',
      contexto: 'Cliente potencial do setor agrícola, demonstra interesse mas tem dúvidas sobre ROI',
      objetivo: 'Praticar todas as 4 etapas do SPIN: Situação, Problema, Implicação e Necessidade',
      nivel_dificuldade: 'médio',
      tempo_estimado_minutos: 15,
    },
    'abertura': {
      id: 'rp_abertura_1',
      titulo: 'Abertura de Ligação Impactante',
      contexto: 'Ligação fria para decisor ocupado',
      objetivo: 'Criar conexão rápida, apresentar valor e conseguir 2 minutos de atenção',
      nivel_dificuldade: 'fácil',
      tempo_estimado_minutos: 10,
    },
    'validacao_objetivo': {
      id: 'rp_validacao_1',
      titulo: 'Validação e Qualificação de Lead',
      contexto: 'Lead demonstra interesse inicial mas precisa ser qualificado',
      objetivo: 'Validar necessidade, orçamento e autoridade para decisão',
      nivel_dificuldade: 'médio',
      tempo_estimado_minutos: 12,
    },
    'proximos_passos': {
      id: 'rp_fechamento_1',
      titulo: 'Confirmação e Agendamento Eficaz',
      contexto: 'Cliente interessado mas hesitante em agendar',
      objetivo: 'Vender o próximo passo e confirmar agendamento com segurança',
      nivel_dificuldade: 'médio',
      tempo_estimado_minutos: 12,
    },
  };
  
  const categories = [...new Set(improvements.map(imp => imp.categoria))];
  return categories.map(cat => rolePlayLibrary[cat]).filter(Boolean);
}

export default function CoachingPage() {
  const [coachingData, setCoachingData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSdr, setSelectedSdr] = useState<string>('all');

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/coaching-data');
        const data = await response.json();
        
        const processedData = data.sdrs.map((sdr: any) => ({
          sdr: {
            id: sdr.id,
            name: sdr.name,
            email: sdr.email,
          },
          improvements: sdr.topImprovements || [],
          microTrainings: generateMicroTrainings(sdr.topImprovements || []),
          rolePlays: generateRolePlays(sdr.topImprovements || []),
          averageScore: sdr.averageScore || 0,
          totalCalls: sdr.totalCalls || 0,
        }));
        
        setCoachingData(processedData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredData = selectedSdr === 'all' 
    ? coachingData 
    : coachingData.filter(data => data.sdr.id === selectedSdr);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-gray-500">Carregando...</div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Target className="w-8 h-8 text-purple-500 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Coaching com IA</h1>
          </div>
        </div>
        <p className="text-gray-600">
          Recomendações personalizadas e planos de desenvolvimento para cada SDR
        </p>
      </div>

      {/* Filtro de SDR */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Users className="w-5 h-5 text-gray-500" />
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Filtrar por SDR
              </label>
              <Select value={selectedSdr} onValueChange={setSelectedSdr}>
                <SelectTrigger className="w-full md:w-[300px]">
                  <SelectValue placeholder="Selecione um SDR" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os SDRs ({coachingData.length})</SelectItem>
                  {coachingData.map((data) => (
                    <SelectItem key={data.sdr.id} value={data.sdr.id}>
                      {data.sdr.name} ({data.totalCalls} ligações)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedSdr !== 'all' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedSdr('all')}
              >
                Limpar Filtro
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* SDR Coaching Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredData.map(({ sdr, improvements, microTrainings, rolePlays, averageScore, totalCalls }) => (
          <Card key={sdr.id} className="card-hover border-2">
            <CardHeader className="bg-gradient-to-br from-purple-50 to-blue-50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-brand-dark">{sdr.name}</CardTitle>
                  <CardDescription>{sdr.email}</CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">{averageScore.toFixed(1)}</div>
                  <div className="text-xs text-gray-500">{totalCalls} ligações</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Top 3 Improvement Areas */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  <h3 className="font-semibold text-gray-900">Top 3 Pontos de Melhoria</h3>
                </div>
                <div className="space-y-2">
                  {improvements.map((imp: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={
                            imp.prioridade === 'alta' ? 'bg-red-100 text-red-800' :
                            imp.prioridade === 'média' ? 'bg-orange-100 text-orange-800' :
                            'bg-yellow-100 text-yellow-800'
                          }>
                            {imp.prioridade.toUpperCase()}
                          </Badge>
                          <span className="font-medium text-sm">{imp.criterio}</span>
                        </div>
                        <p className="text-xs text-gray-600">
                          Categoria: {imp.categoria}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-lg font-bold text-gray-900">{imp.score_atual.toFixed(1)}</div>
                        <div className="text-xs text-gray-500">/ 5.0</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Micro Trainings */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Video className="w-5 h-5 text-blue-500" />
                  <h3 className="font-semibold text-gray-900">Micro-Treinamentos Sugeridos</h3>
                </div>
                <div className="space-y-2">
                  {microTrainings.slice(0, 2).map((training: any, idx: number) => (
                    <div key={idx} className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm text-blue-900">{training.titulo}</h4>
                          <p className="text-xs text-blue-700 mt-1">{training.descricao}</p>
                        </div>
                        {training.tipo === 'vídeo' ? (
                          <Video className="w-4 h-4 text-blue-600 flex-shrink-0 ml-2" />
                        ) : (
                          <FileText className="w-4 h-4 text-blue-600 flex-shrink-0 ml-2" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">{training.duracao_minutos} min</Badge>
                        <Badge variant="outline" className="text-xs capitalize">{training.nivel}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Role-Plays */}
              {rolePlays.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <PlayCircle className="w-5 h-5 text-green-500" />
                    <h3 className="font-semibold text-gray-900">Role-Plays Recomendados</h3>
                  </div>
                  <div className="space-y-2">
                    {rolePlays.slice(0, 2).map((rp: any, idx: number) => (
                      <div key={idx} className="p-3 bg-green-50 rounded-lg border border-green-100">
                        <h4 className="font-medium text-sm text-green-900 mb-1">{rp.titulo}</h4>
                        <p className="text-xs text-green-700 mb-2">{rp.contexto}</p>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-800 text-xs capitalize">
                            {rp.nivel_dificuldade}
                          </Badge>
                          <span className="text-xs text-green-600">{rp.tempo_estimado_minutos} min</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Statistics */}
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-4 rounded-lg border">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Progresso Geral</p>
                  <div className="flex items-center justify-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    <span className="text-2xl font-bold text-purple-600">
                      {((averageScore / 5) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
