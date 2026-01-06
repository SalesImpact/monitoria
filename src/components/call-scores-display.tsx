
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  MessageSquare,
  User,
  Target,
  ArrowRight,
  BarChart3
} from 'lucide-react';

interface CallScoresDisplayProps {
  call: {
    sdrName: string;
    client: string;
    prospectName: string;
    averageScore?: number | null;
    scores?: {
      // Abertura
      saudacaoApresentacao: number;
      apresentacaoEmpresa: number;
      solicitacaoConfirmacaoNome: number;
      tomVoz: number;
      rapport: number;
      // Validação de Objetivo
      perguntasValidacao: number;
      escutaAtiva: number;
      pitchSolucao: number;
      historiaCliente: number;
      // SPIN Selling
      perguntasSituacao: number;
      perguntasProblema: number;
      perguntasImplicacao: number;
      perguntasNecessidadeSolucao: number;
      // Próximos Passos
      confirmouEntendimento: number;
      vendeuProximoPasso: number;
      agendouConcluiu: number;
      aiFeedback?: string | null;
    } | null;
  };
}

export default function CallScoresDisplay({ call }: CallScoresDisplayProps) {
  if (!call.scores) {
    return (
      <div className="text-center py-8">
        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Nenhuma avaliação disponível para esta ligação</p>
      </div>
    );
  }

  const getScoreIcon = (score: number) => {
    if (score >= 4) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (score >= 3) return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    return <XCircle className="w-4 h-4 text-red-600" />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-green-600';
    if (score >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    switch (score) {
      case 1: return 'Não usou';
      case 2: return 'Não atende expectativas';
      case 3: return 'Precisa melhoria';
      case 4: return 'Preenche expectativas';
      case 5: return 'Supera expectativas';
      default: return 'N/A';
    }
  };

  const scoreCategories = [
    {
      title: 'Abertura',
      icon: <User className="w-5 h-5 text-brand-green" />,
      items: [
        { key: 'saudacaoApresentacao', label: 'Saudação e Apresentação', score: call.scores.saudacaoApresentacao },
        { key: 'apresentacaoEmpresa', label: 'Apresentação da Empresa', score: call.scores.apresentacaoEmpresa },
        { key: 'solicitacaoConfirmacaoNome', label: 'Confirmação do Nome do Prospect', score: call.scores.solicitacaoConfirmacaoNome },
        { key: 'tomVoz', label: 'Tom de Voz', score: call.scores.tomVoz },
        { key: 'rapport', label: 'Rapport', score: call.scores.rapport },
      ]
    },
    {
      title: 'Validação de Objetivo',
      icon: <Target className="w-5 h-5 text-brand-green" />,
      items: [
        { key: 'perguntasValidacao', label: 'Conduziu Perguntas de Validação', score: call.scores.perguntasValidacao },
        { key: 'escutaAtiva', label: 'Aplicou Escuta Ativa', score: call.scores.escutaAtiva },
        { key: 'pitchSolucao', label: 'Realizou Pitch de Solução', score: call.scores.pitchSolucao },
        { key: 'historiaCliente', label: 'Conectou com História de Cliente', score: call.scores.historiaCliente },
      ]
    },
    {
      title: 'Técnica SPIN Selling',
      icon: <MessageSquare className="w-5 h-5 text-brand-green" />,
      items: [
        { key: 'perguntasSituacao', label: 'Perguntas de Situação', score: call.scores.perguntasSituacao },
        { key: 'perguntasProblema', label: 'Perguntas de Problema', score: call.scores.perguntasProblema },
        { key: 'perguntasImplicacao', label: 'Perguntas de Implicação', score: call.scores.perguntasImplicacao },
        { key: 'perguntasNecessidadeSolucao', label: 'Perguntas de Necessidade de Solução', score: call.scores.perguntasNecessidadeSolucao },
      ]
    },
    {
      title: 'Próximos Passos',
      icon: <ArrowRight className="w-5 h-5 text-brand-green" />,
      items: [
        { key: 'confirmouEntendimento', label: 'Confirmou Entendimento', score: call.scores.confirmouEntendimento },
        { key: 'vendeuProximoPasso', label: 'Vendeu Próximo Passo', score: call.scores.vendeuProximoPasso },
        { key: 'agendouConcluiu', label: 'Agendou e Concluiu', score: call.scores.agendouConcluiu },
      ]
    },
  ];

  // Calculate category averages
  const categoryAverages = scoreCategories.map(category => ({
    ...category,
    average: category.items.reduce((sum, item) => sum + item.score, 0) / category.items.length
  }));

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="text-brand-dark">Pontuação Geral</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold text-brand-dark">
              {call.averageScore?.toFixed(1) || '0.0'}/5.0
            </div>
            <div className="w-2/3">
              <Progress 
                value={((call.averageScore || 0) / 5) * 100} 
                className="h-3"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categoryAverages.map((category) => (
          <Card key={category.title}>
            <CardHeader>
              <CardTitle className="text-brand-dark flex items-center">
                {category.icon}
                <span className="ml-2">{category.title}</span>
                <Badge variant="outline" className="ml-auto">
                  {category.average.toFixed(1)}/5.0
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {category.items.map((item) => (
                <div key={item.key} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div className="flex items-center space-x-2">
                    {getScoreIcon(item.score)}
                    <span className="text-sm text-gray-700">{item.label}</span>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium ${getScoreColor(item.score)}`}>
                      {item.score}/5
                    </div>
                    <div className="text-xs text-gray-500">
                      {getScoreLabel(item.score)}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Feedback */}
      {call.scores.aiFeedback && (
        <div className="space-y-4">
          {/* Parse feedback to separate strengths and improvements */}
          {(() => {
            const feedback = call.scores.aiFeedback || '';
            
            // Try to find sections for strengths and areas of improvement
            const strengthsMatch = feedback.match(/Pontos Fortes:?\s*([\s\S]*?)(?=Áreas de Melhoria|Oportunidades de Melhoria|$)/i);
            const improvementsMatch = feedback.match(/(?:Áreas de Melhoria|Oportunidades de Melhoria):?\s*([\s\S]*?)$/i);
            
            const strengthsText = strengthsMatch ? strengthsMatch[1].trim() : '';
            const improvementsText = improvementsMatch ? improvementsMatch[1].trim() : '';
            
            // Function to parse bullet points
            const parseBullets = (text: string) => {
              const lines = text.split('\n').map(line => line.trim()).filter(line => line);
              return lines.map(line => line.replace(/^[•\-*]\s*/, ''));
            };

            const strengthsList = strengthsText ? parseBullets(strengthsText) : [];
            const improvementsList = improvementsText ? parseBullets(improvementsText) : [];

            return (
              <>
                {/* Pontos Fortes */}
                {strengthsList.length > 0 && (
                  <Card className="border-green-200 bg-green-50/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-green-800 flex items-center text-lg">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Pontos Fortes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {strengthsList.map((item, index) => (
                          <div 
                            key={index}
                            className="flex items-start space-x-3 p-3 bg-green-100/60 rounded-lg border border-green-200"
                          >
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-green-900 leading-relaxed">
                              {item}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Áreas de Melhoria */}
                {improvementsList.length > 0 && (
                  <Card className="border-red-200 bg-red-50/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-red-800 flex items-center text-lg">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        Áreas de Melhoria
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {improvementsList.map((item, index) => (
                          <div 
                            key={index}
                            className="flex items-start space-x-3 p-3 bg-red-100/60 rounded-lg border border-red-200"
                          >
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-900 leading-relaxed">
                              {item}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Fallback: If no structured format, show original feedback */}
                {strengthsList.length === 0 && improvementsList.length === 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-brand-dark flex items-center">
                        <MessageSquare className="w-5 h-5 mr-2 text-brand-green" />
                        Feedback da IA
                      </CardTitle>
                      <CardDescription>
                        Análise automática com pontos fortes e oportunidades de melhoria
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-50 p-4 rounded-lg border">
                        <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                          {call.scores.aiFeedback}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
