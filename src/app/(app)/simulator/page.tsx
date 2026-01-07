
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageSquare, 
  Send, 
  RotateCcw, 
  Target,
  User,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Clock
} from 'lucide-react';

const personas = [
  {
    id: 'receptive',
    name: 'Carlos Mendes',
    role: 'Diretor de Vendas',
    company: 'TechCorp Brasil',
    personality: 'receptivo' as const,
    difficulty: 'fácil' as const,
    description: 'Cliente interessado e aberto a conversar. Faz perguntas construtivas.',
    painPoints: ['Falta de visibilidade do pipeline', 'Tempo gasto em tarefas manuais'],
    objections: ['timing', 'autoridade'],
    avatar: '😊',
  },
  {
    id: 'skeptical',
    name: 'Ana Silva',
    role: 'Gerente de Operações',
    company: 'Indústria Global',
    personality: 'cético' as const,
    difficulty: 'médio' as const,
    description: 'Cliente cauteloso que questiona tudo. Precisa de provas e cases.',
    painPoints: ['Já tentou outras soluções', 'Orçamento limitado'],
    objections: ['confiança', 'preço', 'concorrência'],
    avatar: '🤔',
  },
  {
    id: 'rushed',
    name: 'Roberto Costa',
    role: 'CEO',
    company: 'Startup Aceleradora',
    personality: 'apressado' as const,
    difficulty: 'difícil' as const,
    description: 'Cliente muito ocupado, interrompe frequentemente. Quer direto ao ponto.',
    painPoints: ['Falta de tempo', 'Precisa de ROI rápido'],
    objections: ['timing', 'necessidade', 'autoridade'],
    avatar: '⏱️',
  },
];

export default function SimulatorPage() {
  const [selectedPersona, setSelectedPersona] = useState<typeof personas[0] | null>(null);
  const [messages, setMessages] = useState<Array<{ role: 'sdr' | 'client' | 'system', content: string }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [simulationStarted, setSimulationStarted] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);

  const startSimulation = (persona: typeof personas[0]) => {
    setSelectedPersona(persona);
    setSimulationStarted(true);
    setMessages([
      {
        role: 'system',
        content: `Roleplay iniciado com ${persona.name} - ${persona.role} na ${persona.company}`,
      },
      {
        role: 'system',
        content: `Dificuldade: ${persona.difficulty} | Personalidade: ${persona.personality}`,
      },
    ]);
    setFeedback(null);
  };

  const resetSimulation = () => {
    setSelectedPersona(null);
    setSimulationStarted(false);
    setMessages([]);
    setInput('');
    setFeedback(null);
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedPersona) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Adiciona mensagem do SDR
    const newMessages = [
      ...messages,
      { role: 'sdr' as const, content: userMessage },
    ];
    setMessages(newMessages);

    try {
      // Chama API para gerar resposta do cliente
      const response = await fetch('/api/simulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona: selectedPersona,
          conversationHistory: newMessages.filter(m => m.role !== 'system'),
          sdrMessage: userMessage,
        }),
      });

      const data = await response.json();

      // Adiciona resposta do cliente
      setMessages([
        ...newMessages,
        { role: 'client' as const, content: data.clientResponse },
      ]);

      // Se a simulação terminou, adiciona feedback
      if (data.shouldEnd) {
        setFeedback(data.feedback);
      }
    } catch (error) {
      console.error('Erro na simulação:', error);
      setMessages([
        ...newMessages,
        {
          role: 'system' as const,
          content: 'Erro ao processar a resposta. Tente novamente.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const endSimulation = () => {
    // Gera feedback final
    setFeedback({
      overall: 75,
      strengths: [
        'Boa abertura e apresentação inicial',
        'Perguntou sobre a dor do cliente',
        'Manteve tom profissional',
      ],
      improvements: [
        'Poderia ter usado mais perguntas de implicação',
        'Fechamento poderia ser mais assertivo',
        'Explore melhor o sentimento de urgência',
      ],
      criteriaScores: {
        abertura: 4,
        spin_selling: 3,
        fechamento: 3,
        rapport: 4,
      },
    });
  };

  if (!simulationStarted) {
    return (
      <div className="space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Roleplay com IA</h1>
          <p className="text-muted-foreground mt-2">
            Pratique suas habilidades de vendas com diferentes personas de clientes
          </p>
        </div>

        {/* Personas */}
        <div className="grid gap-4 md:grid-cols-3">
          {personas.map((persona) => (
            <Card key={persona.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="text-4xl mb-2">{persona.avatar}</div>
                  <Badge
                    variant={
                      persona.difficulty === 'fácil'
                        ? 'default'
                        : persona.difficulty === 'médio'
                        ? 'secondary'
                        : 'destructive'
                    }
                  >
                    {persona.difficulty}
                  </Badge>
                </div>
                <CardTitle>{persona.name}</CardTitle>
                <CardDescription>
                  {persona.role} • {persona.company}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {persona.description}
                </p>

                <div>
                  <h4 className="text-sm font-semibold mb-1">Dores Principais:</h4>
                  <ul className="text-sm space-y-1">
                    {persona.painPoints.map((pain, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <AlertCircle className="h-3 w-3 mt-0.5 text-orange-500" />
                        {pain}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-1">
                    Objeções Esperadas:
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {persona.objections.map((obj) => (
                      <Badge key={obj} variant="outline" className="text-xs">
                        {obj}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={() => startSimulation(persona)}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Iniciar Roleplay
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Dicas */}
        <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Dicas para uma boa simulação:
            </h3>
            <ul className="space-y-1 text-sm text-blue-900 dark:text-blue-100">
              <li>• Comece com personas mais fáceis para aquecer</li>
              <li>• Use a metodologia SPIN nas perguntas</li>
              <li>• Pratique diferentes técnicas de fechamento</li>
              <li>• Analise o feedback detalhado ao final</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6 max-w-4xl mx-auto">
      {/* Header da Simulação */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Roleplay em Andamento</h2>
          <p className="text-sm text-muted-foreground">
            {selectedPersona?.name} - {selectedPersona?.role}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={endSimulation}>
            Finalizar e Ver Feedback
          </Button>
          <Button variant="destructive" onClick={resetSimulation}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Recomeçar
          </Button>
        </div>
      </div>

      {/* Chat */}
      {!feedback ? (
        <Card>
          <CardContent className="p-6 space-y-4">
            {/* Mensagens */}
            <div className="space-y-4 min-h-[400px] max-h-[500px] overflow-y-auto">
              {messages.map((msg, idx) => (
                <div key={idx}>
                  {msg.role === 'system' ? (
                    <div className="text-center text-sm text-muted-foreground italic py-2">
                      {msg.content}
                    </div>
                  ) : (
                    <div
                      className={`flex gap-3 ${
                        msg.role === 'sdr' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {msg.role === 'client' && (
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-lg">
                          {selectedPersona?.avatar}
                        </div>
                      )}
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          msg.role === 'sdr'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                      </div>
                      {msg.role === 'sdr' && (
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                          <User className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-lg">
                    {selectedPersona?.avatar}
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.1s' }}
                      />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <Textarea
                placeholder="Digite sua mensagem..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                className="min-h-[60px]"
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                size="icon"
                className="h-[60px] w-[60px]"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Feedback
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              Feedback do Roleplay
            </CardTitle>
            <CardDescription>
              Análise detalhada da sua performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score Geral */}
            <div className="text-center py-4">
              <div className="text-5xl font-bold text-primary">
                {feedback.overall}%
              </div>
              <p className="text-muted-foreground mt-2">Score Geral</p>
            </div>

            {/* Pontos Fortes */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                Pontos Fortes
              </h3>
              <ul className="space-y-2">
                {feedback.strengths.map((strength: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2" />
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Áreas de Melhoria */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-orange-600">
                <TrendingUp className="h-5 w-5" />
                Áreas de Melhoria
              </h3>
              <ul className="space-y-2">
                {feedback.improvements.map((improvement: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-orange-600 rounded-full mt-2" />
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Scores por Critério */}
            <div>
              <h3 className="font-semibold mb-3">Scores por Critério</h3>
              <div className="grid gap-3 md:grid-cols-2">
                {Object.entries(feedback.criteriaScores).map(([criteria, score]: [string, any]) => (
                  <div key={criteria} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="capitalize">{criteria.replace(/_/g, ' ')}</span>
                    <Badge variant="outline">{score}/5</Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button className="flex-1" onClick={resetSimulation}>
                Novo Roleplay
              </Button>
              <Button className="flex-1" variant="outline">
                Ver Transcrição Completa
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
