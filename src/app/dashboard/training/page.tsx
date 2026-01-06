
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Video, 
  FileText, 
  Award,
  Play,
  CheckCircle2,
  Clock
} from 'lucide-react';

const scripts = [
  {
    id: '1',
    title: 'Abertura de Chamada - Cold Call',
    category: 'Abertura',
    difficulty: 'iniciante',
    content: `**Objetivo:** Capturar atenção e gerar interesse nos primeiros 10 segundos

**Script:**
"Bom dia, [Nome]! Aqui é [Seu Nome] da [Empresa]. Peguei você em um momento ruim?

[Aguardar resposta]

Perfeito! [Nome], falei com várias pessoas no [setor/cargo] que estavam enfrentando [dor específica]. Será que esse é um desafio para vocês também?"

**Por que funciona:**
- Respeita o tempo do prospect
- Estabelece relevância imediata
- Usa uma pergunta aberta para engajar`,
    relatedCriteria: ['saudacao_apresentacao', 'solicitacao_confirmacao_nome', 'rapport'],
  },
  {
    id: '2',
    title: 'Técnica SPIN - Perguntas de Situação',
    category: 'SPIN Selling',
    difficulty: 'intermediário',
    content: `**Objetivo:** Entender o contexto atual do cliente

**Perguntas Sugeridas:**
1. "Como vocês gerenciam [processo X] atualmente?"
2. "Quem é responsável por [atividade Y] na sua equipe?"
3. "Há quanto tempo vocês utilizam [ferramenta atual]?"
4. "Qual é o volume de [métrica] que vocês processam mensalmente?"

**Dica de Ouro:**
Faça no máximo 2-3 perguntas de situação. O objetivo é entender, não interrogar!`,
    relatedCriteria: ['perguntas_situacao', 'escuta_ativa'],
  },
  {
    id: '3',
    title: 'Fechamento com Próximos Passos',
    category: 'Fechamento',
    difficulty: 'avançado',
    content: `**Objetivo:** Garantir commitment e agendar próxima ação

**Script:**
"[Nome], baseado na nossa conversa, vejo que [resumir valor]. Faz sentido para você?

[Confirmar]

Perfeito! O próximo passo ideal seria [ação específica]. Tenho disponibilidade na [data/hora 1] ou [data/hora 2]. Qual funciona melhor para você?"

**Elementos Críticos:**
✓ Resumir valor demonstrado
✓ Obter confirmação explícita
✓ Oferecer 2 opções (não perguntar "quando você pode")
✓ Já ter calendário aberto para agendar na hora`,
    relatedCriteria: ['confirmou_entendimento', 'vendeu_proximo_passo', 'agendou_concluiu'],
  },
];

const videos = [
  {
    id: '1',
    title: 'Masterclass: Construindo Rapport em 30 Segundos',
    duration: 8,
    url: 'https://www.youtube.com/watch?v=example1',
    category: 'Abertura',
    difficulty: 'iniciante',
  },
  {
    id: '2',
    title: 'SPIN Selling na Prática: Análise de Chamada Real',
    duration: 15,
    url: 'https://www.youtube.com/watch?v=example2',
    category: 'SPIN Selling',
    difficulty: 'intermediário',
  },
  {
    id: '3',
    title: 'Superando Objeções de Preço: Técnicas Avançadas',
    duration: 12,
    url: 'https://www.youtube.com/watch?v=example3',
    category: 'Objeções',
    difficulty: 'avançado',
  },
];

const quizzes = [
  {
    id: '1',
    title: 'Fundamentos de Abertura',
    description: 'Teste seus conhecimentos sobre técnicas de abertura de chamadas',
    questions: 10,
    passingScore: 70,
    estimatedMinutes: 5,
    difficulty: 'fácil' as const,
  },
  {
    id: '2',
    title: 'SPIN Selling Completo',
    description: 'Avalie seu domínio da metodologia SPIN',
    questions: 15,
    passingScore: 75,
    estimatedMinutes: 10,
    difficulty: 'médio' as const,
  },
  {
    id: '3',
    title: 'Tratamento de Objeções Complexas',
    description: 'Desafie-se com cenários avançados de objeções',
    questions: 12,
    passingScore: 80,
    estimatedMinutes: 8,
    difficulty: 'difícil' as const,
  },
];

export default function TrainingPage() {
  const [selectedScript, setSelectedScript] = useState<string | null>(null);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Biblioteca de Treinamento</h1>
        <p className="text-muted-foreground mt-2">
          Recursos, scripts e avaliações para desenvolvimento contínuo
        </p>
      </div>

      <Tabs defaultValue="scripts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="scripts">
            <FileText className="mr-2 h-4 w-4" />
            Scripts
          </TabsTrigger>
          <TabsTrigger value="videos">
            <Video className="mr-2 h-4 w-4" />
            Vídeos
          </TabsTrigger>
          <TabsTrigger value="quizzes">
            <Award className="mr-2 h-4 w-4" />
            Avaliações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scripts" className="space-y-4">
          <div className="grid gap-4">
            {scripts.map((script) => (
              <Card key={script.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        {script.title}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {script.category}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        script.difficulty === 'iniciante'
                          ? 'default'
                          : script.difficulty === 'intermediário'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {script.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedScript === script.id ? (
                    <>
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: script.content
                              .split('\n')
                              .map((line) => {
                                if (line.startsWith('**') && line.endsWith('**')) {
                                  return `<h4 class="font-semibold mt-4 mb-2">${line.slice(2, -2)}</h4>`;
                                }
                                if (line.startsWith('"') || line.includes('✓')) {
                                  return `<p class="ml-4">${line}</p>`;
                                }
                                return `<p>${line}</p>`;
                              })
                              .join(''),
                          }}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setSelectedScript(null)}
                        >
                          Fechar
                        </Button>
                        <Button>Adicionar aos Favoritos</Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-wrap gap-2">
                        {script.relatedCriteria.map((criteria) => (
                          <Badge key={criteria} variant="outline">
                            {criteria.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                      <Button onClick={() => setSelectedScript(script.id)}>
                        Ver Script Completo
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="videos" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {videos.map((video) => (
              <Card key={video.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    {video.title}
                  </CardTitle>
                  <CardDescription>
                    {video.category} • {video.duration} min
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <Play className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge>{video.difficulty}</Badge>
                    <Button>Assistir Agora</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="quizzes" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {quizzes.map((quiz) => (
              <Card key={quiz.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    {quiz.title}
                  </CardTitle>
                  <CardDescription>{quiz.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Questões</div>
                      <div className="font-semibold">{quiz.questions}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Duração</div>
                      <div className="font-semibold flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {quiz.estimatedMinutes} min
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Aprovação</div>
                      <div className="font-semibold">{quiz.passingScore}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Nível</div>
                      <Badge variant="outline">{quiz.difficulty}</Badge>
                    </div>
                  </div>
                  <Button className="w-full">
                    <Play className="mr-2 h-4 w-4" />
                    Iniciar Avaliação
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="text-sm text-green-900 dark:text-green-100">
                  <strong>Dica:</strong> Complete todas as avaliações para
                  desbloquear o certificado de "SDR Expert" e conquistar novas
                  oportunidades de desenvolvimento!
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
