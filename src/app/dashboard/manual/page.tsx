'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Target, 
  TrendingUp, 
  Users, 
  Lightbulb,
  AlertCircle,
  CheckCircle,
  BarChart,
  Workflow,
  MessageSquare
} from 'lucide-react';

type TabValue = 'metodologia' | 'criterios' | 'funcionalidades' | 'uso' | 'interpretacao';

export default function ManualPage() {
  const [activeTab, setActiveTab] = useState<TabValue>('metodologia');

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark flex items-center">
            <BookOpen className="w-8 h-8 mr-3 text-brand-green" />
            Guia & Manual do Sistema
          </h1>
          <p className="text-gray-600 mt-2">
            Entenda a metodologia, critérios de avaliação e como aproveitar ao máximo a plataforma
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 bg-gray-100 p-2 rounded-lg">
        <Button
          variant={activeTab === 'metodologia' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('metodologia')}
          className="w-full"
        >
          <Workflow className="w-4 h-4 mr-2" />
          Metodologia
        </Button>
        <Button
          variant={activeTab === 'criterios' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('criterios')}
          className="w-full"
        >
          <Target className="w-4 h-4 mr-2" />
          Critérios
        </Button>
        <Button
          variant={activeTab === 'funcionalidades' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('funcionalidades')}
          className="w-full"
        >
          <BarChart className="w-4 h-4 mr-2" />
          Funcionalidades
        </Button>
        <Button
          variant={activeTab === 'uso' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('uso')}
          className="w-full"
        >
          <Users className="w-4 h-4 mr-2" />
          Como Usar
        </Button>
        <Button
          variant={activeTab === 'interpretacao' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('interpretacao')}
          className="w-full"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Interpretação
        </Button>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'metodologia' && (
          <MethodologyTab />
        )}
        
        {activeTab === 'criterios' && (
          <CriteriaTab />
        )}
        
        {activeTab === 'funcionalidades' && (
          <FunctionalitiesTab />
        )}
        
        {activeTab === 'uso' && (
          <UsageTab />
        )}
        
        {activeTab === 'interpretacao' && (
          <InterpretationTab />
        )}
      </div>
    </div>
  );
}

// Tab Components
function MethodologyTab() {
  return (
    <Card className="card-hover">
      <CardHeader>
        <CardTitle className="text-brand-dark">Processo de Análise de Ligações</CardTitle>
        <CardDescription>
          Entenda como funciona a análise automatizada das ligações de vendas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <ProcessStep
            number={1}
            color="blue"
            title="Captura de Áudio"
            description="Ligações são gravadas e armazenadas de forma segura. Metadados importantes são registrados automaticamente (data, cliente, SDR responsável)."
          />
          <ProcessStep
            number={2}
            color="green"
            title="Transcrição Automática"
            description="O áudio é convertido em texto utilizando tecnologia de IA. O sistema identifica automaticamente os interlocutores (SDR vs. Cliente) para facilitar a análise."
          />
          <ProcessStep
            number={3}
            color="purple"
            title="Análise Estruturada"
            description="A transcrição é avaliada baseada em 16 critérios específicos de vendas. Cada critério recebe uma pontuação de 0 a 5, além de feedback qualitativo detalhado."
          />
          <ProcessStep
            number={4}
            color="orange"
            title="Agregação de Resultados"
            description="Cálculo automático de médias individuais e de equipe. Identificação de padrões, tendências e comparação entre SDRs para gerar insights acionáveis."
          />
        </div>
      </CardContent>
    </Card>
  );
}

function CriteriaTab() {
  return (
    <Card className="card-hover">
      <CardHeader>
        <CardTitle className="text-brand-dark">16 Critérios de Avaliação</CardTitle>
        <CardDescription>
          Sistema estruturado em 4 categorias principais de análise
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="abertura">
            <AccordionTrigger className="text-lg font-semibold text-brand-dark">
              <div className="flex items-center">
                <Badge className="mr-3 bg-blue-500">Categoria 1</Badge>
                1️⃣ ABERTURA (Opening)
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pl-4">
                <CriterionSummary
                  number="1.1"
                  title="Saudação e Apresentação"
                  description="Cordialidade e clareza na identificação pessoal"
                />
                <CriterionSummary
                  number="1.2"
                  title="Apresentação da Empresa"
                  description="Clareza sobre qual empresa representa"
                />
                <CriterionSummary
                  number="1.3"
                  title="Confirmação do Nome"
                  description="Confirmação educada do nome do interlocutor"
                />
                <CriterionSummary
                  number="1.4"
                  title="Tom de Voz"
                  description="Energia, clareza e confiança na fala"
                />
                <CriterionSummary
                  number="1.5"
                  title="Rapport"
                  description="Capacidade de criar conexão com o cliente"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="validacao">
            <AccordionTrigger className="text-lg font-semibold text-brand-dark">
              <div className="flex items-center">
                <Badge className="mr-3 bg-green-500">Categoria 2</Badge>
                2️⃣ VALIDAÇÃO DO OBJETIVO
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pl-4">
                <CriterionSummary
                  number="2.1"
                  title="Perguntas de Validação"
                  description="Uso de perguntas para confirmar interesse/qualificação"
                />
                <CriterionSummary
                  number="2.2"
                  title="Escuta Ativa"
                  description="Demonstra estar ouvindo e processando informações"
                />
                <CriterionSummary
                  number="2.3"
                  title="Pitch da Solução"
                  description="Clareza e relevância da apresentação da solução"
                />
                <CriterionSummary
                  number="2.4"
                  title="História do Cliente"
                  description="Uso de cases ou exemplos de sucesso"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="spin">
            <AccordionTrigger className="text-lg font-semibold text-brand-dark">
              <div className="flex items-center">
                <Badge className="mr-3 bg-purple-500">Categoria 3</Badge>
                3️⃣ SPIN SELLING
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pl-4">
                <div className="p-4 bg-purple-50 rounded-lg mb-4">
                  <p className="text-sm text-gray-700">
                    <strong>SPIN Selling</strong> é uma metodologia baseada em perguntas estratégicas 
                    desenvolvida por Neil Rackham. O nome é um acrônimo para os 4 tipos de perguntas.
                  </p>
                </div>
                <CriterionSummary
                  number="3.1"
                  title="Perguntas de Situação (Situation)"
                  description="Perguntas sobre o contexto atual do cliente"
                />
                <CriterionSummary
                  number="3.2"
                  title="Perguntas de Problema (Problem)"
                  description="Identificação de dores e desafios"
                />
                <CriterionSummary
                  number="3.3"
                  title="Perguntas de Implicação (Implication)"
                  description="Explora consequências dos problemas"
                />
                <CriterionSummary
                  number="3.4"
                  title="Perguntas de Necessidade-Solução (Need-Payoff)"
                  description="Perguntas sobre o valor da solução"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="proximos-passos">
            <AccordionTrigger className="text-lg font-semibold text-brand-dark">
              <div className="flex items-center">
                <Badge className="mr-3 bg-orange-500">Categoria 4</Badge>
                4️⃣ PRÓXIMOS PASSOS
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pl-4">
                <CriterionSummary
                  number="4.1"
                  title="Confirmou Entendimento"
                  description="Resumo e confirmação do que foi discutido"
                />
                <CriterionSummary
                  number="4.2"
                  title="Vendeu Próximo Passo"
                  description="Clareza sobre o que virá a seguir"
                />
                <CriterionSummary
                  number="4.3"
                  title="Agendou/Concluiu"
                  description="Fechou compromisso concreto"
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}

function FunctionalitiesTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="text-brand-dark flex items-center">
            <BarChart className="w-5 h-5 mr-2 text-blue-500" />
            Dashboard Geral
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-700">
            <FeatureItem text="KPIs em tempo real: Total de ligações, média de pontuação, taxa de agendamento" />
            <FeatureItem text="Gráfico de performance: Evolução temporal da equipe" />
            <FeatureItem text="Rankings: Top 5 e Bottom 5 SDRs" />
            <FeatureItem text="Nuvem de palavras: Termos mais utilizados nas ligações" />
          </ul>
        </CardContent>
      </Card>

      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="text-brand-dark flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-green-500" />
            Monitoramento de Ligações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-700">
            <FeatureItem text="Lista completa: Todas as ligações gravadas" />
            <FeatureItem text="Filtros avançados: Por SDR, data, pontuação, resultado" />
            <FeatureItem text="Player de áudio: Integrado para ouvir ligações" />
            <FeatureItem text="Modal interativo: Análise profunda com transcrição" />
          </ul>
        </CardContent>
      </Card>

      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="text-brand-dark flex items-center">
            <Users className="w-5 h-5 mr-2 text-purple-500" />
            Análise Individual de SDR
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-700">
            <FeatureItem text="Perfil completo: Estatísticas individuais detalhadas" />
            <FeatureItem text="Histórico: Ligações com tendências" />
            <FeatureItem text="Radar chart: Pontuação por critério" />
            <FeatureItem text="Comparação: Com média da equipe" />
          </ul>
        </CardContent>
      </Card>

      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="text-brand-dark flex items-center">
            <Target className="w-5 h-5 mr-2 text-orange-500" />
            Análise por Critérios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-700">
            <FeatureItem text="Ranking: Do melhor ao pior desempenho" />
            <FeatureItem text="Distribuição: Ligações por faixa de pontuação" />
            <FeatureItem text="Detalhamento clicável: Veja ligações específicas" />
            <FeatureItem text="Insights: Melhor critério e maior oportunidade" />
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function UsageTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="card-hover border-blue-200">
        <CardHeader>
          <CardTitle className="text-brand-dark flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-500" />
            Para Gestores
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-700">
          <div>
            <h4 className="font-semibold mb-1">1. Dashboard Inicial</h4>
            <p>Acesse para visão geral da equipe e monitore evolução dos KPIs</p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">2. Monitoramento de Ligações</h4>
            <p>Use filtros para focar em ligações específicas e compartilhe exemplos</p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">3. Análise Individual</h4>
            <p>Prepare sessões 1:1 com dados concretos</p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">4. Análise por Critérios</h4>
            <p>Identifique gaps de treinamento da equipe</p>
          </div>
        </CardContent>
      </Card>

      <Card className="card-hover border-green-200">
        <CardHeader>
          <CardTitle className="text-brand-dark flex items-center">
            <Target className="w-5 h-5 mr-2 text-green-500" />
            Para SDRs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-700">
          <div>
            <h4 className="font-semibold mb-1">1. Acompanhe sua Performance</h4>
            <p>Veja seu ranking e pontuação média, compare-se com a equipe</p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">2. Aprenda com Exemplos</h4>
            <p>Ouça suas melhores ligações e revise pontuações baixas</p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">3. Foco em Melhoria Contínua</h4>
            <p>Trabalhe em critérios específicos e acompanhe sua evolução</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InterpretationTab() {
  return (
    <div className="space-y-6">
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="text-brand-dark">Escalas de Pontuação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScoreRange
            range="4.5 - 5.0"
            label="Excelente"
            color="green"
            meaning="Performance excepcional"
            action="Replicar boas práticas com o resto da equipe"
          />
          <ScoreRange
            range="3.5 - 4.4"
            label="Bom"
            color="blue"
            meaning="Performance sólida"
            action="Manter consistência e buscar excelência"
          />
          <ScoreRange
            range="2.5 - 3.4"
            label="Médio"
            color="yellow"
            meaning="Precisa melhorar"
            action="Focar em treinamento específico"
          />
          <ScoreRange
            range="0.0 - 2.4"
            label="Abaixo"
            color="red"
            meaning="Performance crítica"
            action="Intervenção urgente necessária"
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="text-brand-dark">Médias Esperadas por Nível</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ExpectedAverage level="SDR Iniciante (0-3 meses)" range="2.5 - 3.0" />
            <ExpectedAverage level="SDR Intermediário (3-12 meses)" range="3.0 - 3.8" />
            <ExpectedAverage level="SDR Sênior (12+ meses)" range="3.8 - 4.5" />
            <ExpectedAverage level="SDR Top Performer" range="4.5+" highlight />
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="text-brand-dark flex items-center">
              <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
              Dicas de Coaching
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <CoachingTip
              title="Pontuação baixa em ABERTURA"
              tips={["Role-play focado em primeiros 30 segundos", "Scripts de abertura testados"]}
            />
            <CoachingTip
              title="Pontuação baixa em SPIN"
              tips={["Workshop sobre perguntas estratégicas", "Lista de perguntas por tipo (S-P-I-N)"]}
            />
            <CoachingTip
              title="Pontuação baixa em PRÓXIMOS PASSOS"
              tips={["Técnicas de fechamento e CTA", "Simular objeções comuns"]}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper Components
function ProcessStep({ number, color, title, description }: { number: number; color: string; title: string; description: string }) {
  const bgColors = {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    purple: 'bg-purple-50',
    orange: 'bg-orange-50'
  };
  const textColors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500'
  };

  return (
    <div className={`flex items-start gap-4 p-4 ${bgColors[color as keyof typeof bgColors]} rounded-lg`}>
      <div className={`flex-shrink-0 w-10 h-10 ${textColors[color as keyof typeof textColors]} text-white rounded-full flex items-center justify-center font-bold`}>
        {number}
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-brand-dark mb-1">{title}</h4>
        <p className="text-sm text-gray-700">{description}</p>
      </div>
    </div>
  );
}

function CriterionSummary({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center mb-1">
        <Badge variant="outline" className="mr-2">{number}</Badge>
        <h4 className="font-semibold text-brand-dark">{title}</h4>
      </div>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <li className="flex items-start">
      <CheckCircle className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
      <span><strong>{text.split(':')[0]}:</strong> {text.split(':')[1]}</span>
    </li>
  );
}

function ScoreRange({ range, label, color, meaning, action }: { range: string; label: string; color: string; meaning: string; action: string }) {
  const bgColors = {
    green: 'bg-green-50 border-green-500',
    blue: 'bg-blue-50 border-blue-500',
    yellow: 'bg-yellow-50 border-yellow-500',
    red: 'bg-red-50 border-red-500'
  };
  const badgeColors = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  };
  const textColors = {
    green: 'text-green-700',
    blue: 'text-blue-700',
    yellow: 'text-yellow-700',
    red: 'text-red-700'
  };

  return (
    <div className={`p-4 ${bgColors[color as keyof typeof bgColors]} border-l-4 rounded-r-lg`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-2xl font-bold ${textColors[color as keyof typeof textColors]}`}>{range}</span>
        <Badge className={badgeColors[color as keyof typeof badgeColors]}>{label}</Badge>
      </div>
      <p className="text-sm text-gray-700 mb-1">
        <strong>Significado:</strong> {meaning}
      </p>
      <p className="text-sm text-gray-600">
        <strong>Ação Recomendada:</strong> {action}
      </p>
    </div>
  );
}

function ExpectedAverage({ level, range, highlight }: { level: string; range: string; highlight?: boolean }) {
  return (
    <div className={`p-3 ${highlight ? 'bg-green-50' : 'bg-gray-50'} rounded-lg`}>
      <div className="flex justify-between items-center">
        <span className="font-medium">{level}</span>
        <Badge variant={highlight ? 'default' : 'outline'} className={highlight ? 'bg-green-500' : ''}>{range}</Badge>
      </div>
    </div>
  );
}

function CoachingTip({ title, tips }: { title: string; tips: string[] }) {
  return (
    <div className="p-3 bg-orange-50 rounded-lg">
      <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
        <AlertCircle className="w-4 h-4 mr-2 text-orange-500" />
        {title}
      </h4>
      <ul className="space-y-1 ml-6">
        {tips.map((tip, idx) => (
          <li key={idx} className="text-gray-700">• {tip}</li>
        ))}
      </ul>
    </div>
  );
}
