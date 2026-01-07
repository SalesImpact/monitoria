'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Award, Video, BookOpen, Play, CheckCircle2 } from 'lucide-react';

// Dados mock para a biblioteca de recursos
const mockScripts = [
  {
    id: 1,
    title: 'Abertura de Chamada Profissional',
    category: 'Abertura',
    difficulty: 'Iniciante',
    criteria: ['Saudação', 'Tom de Voz', 'Rapport'],
    content: `**Saudação Inicial:**
"Olá [Nome], tudo bem? Aqui é [Seu Nome] da [Empresa]."

**Estabelecer Rapport:**
"Obrigado por atender! Como está seu dia até agora?"

**Motivo da Chamada:**
"[Nome], estou entrando em contato porque..."`,
  },
  {
    id: 2,
    title: 'Técnica SPIN - Perguntas Completas',
    category: 'SPIN Selling',
    difficulty: 'Intermediário',
    criteria: ['Perguntas de Situação', 'Perguntas de Problema', 'Perguntas de Implicação'],
    content: `**Situação:**
"Qual é o processo atual que vocês utilizam para...?"

**Problema:**
"Quais desafios vocês enfrentam com esse processo?"

**Implicação:**
"Se esse problema não for resolvido, que impacto isso teria no...?"

**Necessidade:**
"Como seria para vocês se pudessem resolver isso de forma mais eficiente?"`,
  },
  {
    id: 3,
    title: 'Fechamento e Agendamento',
    category: 'Próximos Passos',
    difficulty: 'Intermediário',
    criteria: ['Venda do Próximo Passo', 'Agendamento'],
    content: `**Recapitular Valor:**
"Então, [Nome], pelo que conversamos, [benefício] seria muito valioso para vocês, correto?"

**Propor Próximo Passo:**
"O que faz sentido agora é agendarmos uma conversa com [pessoa/equipe]..."

**Confirmar Compromisso:**
"Vou enviar o convite. Você confirma presença?"`,
  },
];

const mockVideos = [
  {
    id: 1,
    title: 'Masterclass: Construindo Rapport',
    category: 'Abertura',
    duration: '15 min',
    difficulty: 'Iniciante',
  },
  {
    id: 2,
    title: 'SPIN Selling na Prática',
    category: 'SPIN Selling',
    duration: '25 min',
    difficulty: 'Intermediário',
  },
  {
    id: 3,
    title: 'Superando Objeções de Preço',
    category: 'Objeções',
    duration: '20 min',
    difficulty: 'Avançado',
  },
];

const mockQuizzes = [
  {
    id: 1,
    title: 'Fundamentos de Abertura',
    description: 'Teste seus conhecimentos sobre as técnicas de abertura de chamada',
    questions: 10,
    passingScore: 70,
    duration: '10 min',
    difficulty: 'Iniciante',
  },
  {
    id: 2,
    title: 'SPIN Selling Completo',
    description: 'Avalie seu domínio da metodologia SPIN em diferentes cenários',
    questions: 15,
    passingScore: 75,
    duration: '15 min',
    difficulty: 'Intermediário',
  },
];

export default function BestPracticesPage() {
  const [selectedScript, setSelectedScript] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center mb-2">
          <Award className="w-8 h-8 text-gray-400 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Biblioteca de Recursos</h1>
        </div>
        <p className="text-gray-600">
          Scripts, vídeos e avaliações para treinamento
        </p>
      </div>

      {/* Biblioteca de Recursos */}
      <div className="space-y-6">
        <Tabs defaultValue="scripts" className="space-y-4">
          <TabsList>
            <TabsTrigger value="scripts">Scripts</TabsTrigger>
            <TabsTrigger value="videos">Vídeos</TabsTrigger>
            <TabsTrigger value="quizzes">Avaliações</TabsTrigger>
          </TabsList>

          {/* Scripts */}
          <TabsContent value="scripts" className="space-y-4">
            {mockScripts.map((script) => (
              <Card key={script.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        {script.title}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        Categoria: {script.category} • Nível: {script.difficulty}
                      </CardDescription>
                    </div>
                    <Button 
                      variant={selectedScript === script.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedScript(selectedScript === script.id ? null : script.id)}
                    >
                      {selectedScript === script.id ? 'Ocultar' : 'Ver Script'}
                    </Button>
                  </div>
                </CardHeader>
                {selectedScript === script.id && (
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {script.criteria.map((c, idx) => (
                        <Badge key={idx} variant="secondary">{c}</Badge>
                      ))}
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg whitespace-pre-wrap">
                      {script.content}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </TabsContent>

          {/* Vídeos */}
          <TabsContent value="videos" className="grid gap-4 md:grid-cols-2">
            {mockVideos.map((video) => (
              <Card key={video.id}>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Video className="w-8 h-8 text-muted-foreground" />
                    <Badge>{video.difficulty}</Badge>
                  </div>
                  <CardTitle>{video.title}</CardTitle>
                  <CardDescription>
                    {video.category} • {video.duration}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/30 rounded-lg h-40 flex items-center justify-center">
                    <Play className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <Button className="w-full mt-4">
                    <Play className="w-4 h-4 mr-2" />
                    Assistir Vídeo
                  </Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Quizzes */}
          <TabsContent value="quizzes" className="space-y-4">
            <Card className="bg-green-50 dark:bg-green-950/20 border-green-200">
              <CardContent className="pt-6">
                <p className="text-sm text-green-900 dark:text-green-100">
                  <strong>💡 Dica:</strong> Complete as avaliações para desbloquear o certificado "SDR Expert"!
                </p>
              </CardContent>
            </Card>

            {mockQuizzes.map((quiz) => (
              <Card key={quiz.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{quiz.title}</CardTitle>
                      <CardDescription className="mt-2">{quiz.description}</CardDescription>
                    </div>
                    <Badge variant="outline">{quiz.difficulty}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Questões</div>
                      <div className="font-semibold">{quiz.questions}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Nota Mínima</div>
                      <div className="font-semibold">{quiz.passingScore}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Duração</div>
                      <div className="font-semibold">{quiz.duration}</div>
                    </div>
                  </div>
                  <Button className="w-full">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Iniciar Avaliação
                  </Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
