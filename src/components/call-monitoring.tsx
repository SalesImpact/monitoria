'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Search, 
  Calendar, 
  Clock, 
  User, 
  Building, 
  Phone,
  BarChart3,
  ChevronRight,
  Volume2,
  FileText,
  Heart,
  Tag,
  TrendingUp,
  Smile,
  Frown,
  Meh
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AudioPlayer from '@/components/audio-player';
import CallScoresDisplay from '@/components/call-scores-display';
import SentimentJourneyChart from '@/components/sentiment-journey-chart';

interface SentimentAnalysis {
  overall: string;
  client: string;
  sdr: string;
  confidence: number;
  emotionalTone: string;
}

interface SentimentJourneyPoint {
  timestamp: number;
  sentiment: string;  // Pode ser qualquer string do JSON
  intensity: number;
  speaker: string;  // Pode ser 'client' ou 'sdr'
  text?: string;
}

interface DetectedTopic {
  category: string;
  mentions: number;
  relevance: number;
  keywords: string[];
  firstMentionAt: number;
}

interface DetectedKeyword {
  word: string;
  type: 'positive' | 'negative' | 'neutral';
  count: number;
  sentiment_impact: number;
}

interface Call {
  id: string;
  sdrName: string;
  client: string;
  prospectName: string;
  date: Date;
  duration: string;
  callType: string;
  result: string;
  audioFile?: string | null;
  transcription?: string | null;
  averageScore?: number | null;
  sdr: {
    name: string;
    email: string;
  };
  scores?: {
    saudacaoApresentacao: number;
    apresentacaoEmpresa: number;
    solicitacaoConfirmacaoNome: number;
    tomVoz: number;
    rapport: number;
    perguntasValidacao: number;
    escutaAtiva: number;
    pitchSolucao: number;
    historiaCliente: number;
    perguntasSituacao: number;
    perguntasProblema: number;
    perguntasImplicacao: number;
    perguntasNecessidadeSolucao: number;
    confirmouEntendimento: number;
    vendeuProximoPasso: number;
    agendouConcluiu: number;
    nivelEngajamentoCliente?: number | null;
    confiancaSdr?: number | null;
    aiFeedback?: string | null;
  } | null;
  keywords: Array<{
    word: string;
  }>;
  sentimentAnalysis?: SentimentAnalysis;
  sentimentJourney?: SentimentJourneyPoint[];
  detectedTopics?: DetectedTopic[];
  detectedKeywords?: DetectedKeyword[];
}

interface CallMonitoringProps {
  calls: Call[];
}

function getSentimentIcon(sentiment: string) {
  switch (sentiment.toLowerCase()) {
    case 'entusiasmado':
    case 'positivo':
    case 'confiante':
      return <Smile className="w-5 h-5 text-green-500" />;
    case 'neutro':
      return <Meh className="w-5 h-5 text-gray-500" />;
    case 'negativo':
    case 'frustrado':
    case 'inseguro':
      return <Frown className="w-5 h-5 text-red-500" />;
    default:
      return <Meh className="w-5 h-5 text-gray-500" />;
  }
}

function getSentimentBadgeColor(sentiment: string): string {
  switch (sentiment.toLowerCase()) {
    case 'entusiasmado':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'positivo':
    case 'confiante':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'neutro':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'negativo':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'frustrado':
    case 'inseguro':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

function getTopicBadgeColor(relevance: number): string {
  if (relevance >= 70) return 'bg-purple-100 text-purple-800 border-purple-200';
  if (relevance >= 40) return 'bg-blue-100 text-blue-800 border-blue-200';
  return 'bg-gray-100 text-gray-800 border-gray-200';
}

export default function CallMonitoring({ calls }: CallMonitoringProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSDR, setSelectedSDR] = useState<string>('all');
  const [selectedResult, setSelectedResult] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSentiment, setSelectedSentiment] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');

  // Handle undefined or empty calls
  const safeCalls = calls || [];

  const uniqueSDRs = [...new Set(safeCalls.map(call => call.sdrName))];
  const uniqueResults = [...new Set(safeCalls.map(call => call.result))];
  const uniqueTypes = [...new Set(safeCalls.map(call => call.callType))];
  const uniqueSentiments = [...new Set(safeCalls.flatMap(call => 
    call.sentimentAnalysis ? [call.sentimentAnalysis.overall] : []
  ))];
  const uniqueTopics = [...new Set(safeCalls.flatMap(call => 
    call.detectedTopics ? call.detectedTopics.map(t => t.category) : []
  ))];

  const filteredCalls = safeCalls.filter((call) => {
    const matchesSearch =
      call.sdrName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.prospectName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSDR = selectedSDR === 'all' || call.sdrName === selectedSDR;
    const matchesResult = selectedResult === 'all' || call.result === selectedResult;
    const matchesType = selectedType === 'all' || call.callType === selectedType;
    const matchesSentiment = selectedSentiment === 'all' || 
      (call.sentimentAnalysis && call.sentimentAnalysis.overall === selectedSentiment);
    const matchesTopic = selectedTopic === 'all' || 
      (call.detectedTopics && call.detectedTopics.some(t => t.category === selectedTopic));

    return matchesSearch && matchesSDR && matchesResult && matchesType && matchesSentiment && matchesTopic;
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 3) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (score >= 2) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getResultBadgeVariant = (result: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (result === 'agendado') return 'default';
    if (result === 'qualificação_sucesso') return 'secondary';
    return 'outline';
  };

  const getResultLabel = (result: string) => {
    const labels: { [key: string]: string } = {
      'agendado': 'Agendado',
      'não_agendado': 'Não Agendado',
      'qualificação_sucesso': 'Qualificação Sucesso',
    };
    return labels[result] || result;
  };

  return (
    <div className="space-y-6">
      <Card className="card-hover border-gray-200">
        <CardContent className="p-6">
          {/* Filters Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
            {/* Search */}
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por SDR, cliente ou prospect..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 focus:border-brand-green focus:ring-brand-green"
              />
            </div>

            {/* SDR Filter */}
            <Select value={selectedSDR} onValueChange={setSelectedSDR}>
              <SelectTrigger className="border-gray-300">
                <SelectValue placeholder="Todos os SDRs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os SDRs</SelectItem>
                {uniqueSDRs.map((sdr) => (
                  <SelectItem key={sdr} value={sdr}>
                    {sdr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Result Filter */}
            <Select value={selectedResult} onValueChange={setSelectedResult}>
              <SelectTrigger className="border-gray-300">
                <SelectValue placeholder="Todos os resultados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os resultados</SelectItem>
                {uniqueResults.map((result) => (
                  <SelectItem key={result} value={result}>
                    {getResultLabel(result)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="border-gray-300">
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {uniqueTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type === 'call_real' ? 'Ligação Real' : 'Roleplay'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sentiment Filter - NEW */}
            <Select value={selectedSentiment} onValueChange={setSelectedSentiment}>
              <SelectTrigger className="border-gray-300">
                <SelectValue placeholder="Sentimento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os sentimentos</SelectItem>
                {uniqueSentiments.map((sentiment) => (
                  <SelectItem key={sentiment} value={sentiment}>
                    {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Topic Filter - Second Row */}
          <div className="mb-6">
            <Select value={selectedTopic} onValueChange={setSelectedTopic}>
              <SelectTrigger className="border-gray-300 max-w-xs">
                <SelectValue placeholder="Filtrar por tópico discutido" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tópicos</SelectItem>
                {uniqueTopics.map((topic) => (
                  <SelectItem key={topic} value={topic}>
                    {topic.charAt(0).toUpperCase() + topic.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-gray-50/50">
                <TableHead className="font-semibold text-gray-700">SDR</TableHead>
                <TableHead className="font-semibold text-gray-700">Cliente</TableHead>
                <TableHead className="font-semibold text-gray-700">Prospect</TableHead>
                <TableHead className="font-semibold text-gray-700">Data</TableHead>
                <TableHead className="font-semibold text-gray-700">Duração</TableHead>
                <TableHead className="font-semibold text-gray-700">Score</TableHead>
                <TableHead className="font-semibold text-gray-700">Sentimento</TableHead>
                <TableHead className="font-semibold text-gray-700">Resultado</TableHead>
                <TableHead className="font-semibold text-gray-700">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCalls.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12">
                    <Phone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">
                      Nenhuma ligação encontrada
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Ajuste os filtros para encontrar as ligações desejadas
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCalls.map((call) => (
                  <TableRow key={call.id} className="hover:bg-gray-50 cursor-pointer transition-colors">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-brand-green text-brand-dark text-xs">
                            {getInitials(call.sdrName)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-brand-dark">{call.sdrName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-700">{call.client}</TableCell>
                    <TableCell className="text-gray-700">{call.prospectName}</TableCell>
                    <TableCell className="text-gray-600 text-sm">
                      {new Date(call.date).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-gray-600 text-sm">{call.duration}</TableCell>
                    <TableCell>
                      {call.averageScore ? (
                        <Badge className={`${getScoreColor(call.averageScore)} font-semibold`}>
                          {call.averageScore.toFixed(1)}/5.0
                        </Badge>
                      ) : (
                        <span className="text-gray-400 text-sm">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {call.sentimentAnalysis ? (
                        <div className="flex items-center gap-2">
                          {getSentimentIcon(call.sentimentAnalysis.overall)}
                          <span className="text-sm capitalize">{call.sentimentAnalysis.overall}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getResultBadgeVariant(call.result)}>
                        {getResultLabel(call.result)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            className="bg-brand-blue hover:bg-brand-blue/90 text-white"
                            size="sm"
                          >
                            Ver Detalhes
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-brand-dark">
                              Análise Completa da Ligação
                            </DialogTitle>
                            <DialogDescription className="text-base">
                              Análise detalhada com sentimentos, tópicos e palavras-chave
                            </DialogDescription>
                          </DialogHeader>
                          
                          <Tabs defaultValue="overview" className="mt-6">
                            <TabsList className="grid w-full grid-cols-4">
                              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                              <TabsTrigger value="sentiment">Sentimento</TabsTrigger>
                              <TabsTrigger value="topics">Tópicos</TabsTrigger>
                              <TabsTrigger value="transcription">Transcrição</TabsTrigger>
                            </TabsList>

                            {/* OVERVIEW TAB */}
                            <TabsContent value="overview" className="space-y-6">
                              {/* Call Info Header */}
                              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex items-center space-x-4">
                                    <Avatar className="h-12 w-12">
                                      <AvatarFallback className="bg-brand-green text-brand-dark text-lg">
                                        {getInitials(call.sdrName)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <h3 className="text-xl font-bold text-brand-dark">{call.sdrName}</h3>
                                      <p className="text-sm text-gray-600">{call.sdr.email}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Badge variant={getResultBadgeVariant(call.result)} className="text-sm">
                                      {getResultLabel(call.result)}
                                    </Badge>
                                    <Badge variant="outline" className="text-sm">
                                      {call.callType === 'call_real' ? 'Real' : 'Roleplay'}
                                    </Badge>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div className="flex items-center space-x-2">
                                    <Building className="w-4 h-4 text-gray-400" />
                                    <div>
                                      <p className="text-xs text-gray-500">Cliente</p>
                                      <p className="text-sm font-medium text-gray-900">{call.client}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <div>
                                      <p className="text-xs text-gray-500">Prospect</p>
                                      <p className="text-sm font-medium text-gray-900">{call.prospectName}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <div>
                                      <p className="text-xs text-gray-500">Data</p>
                                      <p className="text-sm font-medium text-gray-900">
                                        {new Date(call.date).toLocaleDateString('pt-BR')}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <div>
                                      <p className="text-xs text-gray-500">Duração</p>
                                      <p className="text-sm font-medium text-gray-900">{call.duration}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Audio Player */}
                              {call.audioFile && (
                                <div className="bg-white p-6 rounded-xl border border-gray-200">
                                  <div className="flex items-center space-x-2 mb-3">
                                    <Volume2 className="w-5 h-5 text-brand-green" />
                                    <h4 className="font-semibold text-brand-dark">Áudio da Ligação</h4>
                                  </div>
                                  <AudioPlayer audioFile={call.audioFile} />
                                </div>
                              )}

                              {/* Call Check Analysis */}
                              <div className="bg-white p-6 rounded-xl border border-gray-200">
                                <div className="flex items-center space-x-2 mb-4">
                                  <BarChart3 className="w-5 h-5 text-brand-green" />
                                  <h4 className="font-semibold text-brand-dark text-lg">Análise Call Check</h4>
                                </div>
                                <CallScoresDisplay call={call} />
                              </div>
                            </TabsContent>

                            {/* SENTIMENT TAB - NEW */}
                            <TabsContent value="sentiment" className="space-y-6">
                              {call.sentimentAnalysis && (
                                <>
                                  {/* Sentiment Summary */}
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Card className="border-2">
                                      <CardContent className="p-4">
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="text-sm font-medium text-gray-600">Sentimento Geral</span>
                                          {getSentimentIcon(call.sentimentAnalysis.overall)}
                                        </div>
                                        <Badge className={`${getSentimentBadgeColor(call.sentimentAnalysis.overall)} text-sm capitalize`}>
                                          {call.sentimentAnalysis.overall}
                                        </Badge>
                                        <p className="text-xs text-gray-500 mt-2">
                                          Confiança: {call.sentimentAnalysis.confidence}%
                                        </p>
                                      </CardContent>
                                    </Card>

                                    <Card className="border-2">
                                      <CardContent className="p-4">
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="text-sm font-medium text-gray-600">Cliente</span>
                                          {getSentimentIcon(call.sentimentAnalysis.client)}
                                        </div>
                                        <Badge className={`${getSentimentBadgeColor(call.sentimentAnalysis.client)} text-sm capitalize`}>
                                          {call.sentimentAnalysis.client}
                                        </Badge>
                                        {call.scores?.nivelEngajamentoCliente && (
                                          <p className="text-xs text-gray-500 mt-2">
                                            Engajamento: {call.scores.nivelEngajamentoCliente}/5
                                          </p>
                                        )}
                                      </CardContent>
                                    </Card>

                                    <Card className="border-2">
                                      <CardContent className="p-4">
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="text-sm font-medium text-gray-600">SDR</span>
                                          {getSentimentIcon(call.sentimentAnalysis.sdr)}
                                        </div>
                                        <Badge className={`${getSentimentBadgeColor(call.sentimentAnalysis.sdr)} text-sm capitalize`}>
                                          {call.sentimentAnalysis.sdr}
                                        </Badge>
                                        {call.scores?.confiancaSdr && (
                                          <p className="text-xs text-gray-500 mt-2">
                                            Confiança: {call.scores.confiancaSdr}/5
                                          </p>
                                        )}
                                      </CardContent>
                                    </Card>
                                  </div>

                                  {/* Emotional Tone */}
                                  <Card>
                                    <CardContent className="p-4">
                                      <h4 className="font-semibold text-gray-900 mb-2">Tom Emocional</h4>
                                      <p className="text-sm text-gray-700">{call.sentimentAnalysis.emotionalTone}</p>
                                    </CardContent>
                                  </Card>

                                  {/* Sentiment Journey Chart */}
                                  {call.sentimentJourney && call.sentimentJourney.length > 0 && (
                                    <SentimentJourneyChart 
                                      journey={call.sentimentJourney} 
                                      duration={call.duration} 
                                    />
                                  )}
                                </>
                              )}
                            </TabsContent>

                            {/* TOPICS TAB - NEW */}
                            <TabsContent value="topics" className="space-y-6">
                              {/* Detected Topics */}
                              {call.detectedTopics && call.detectedTopics.length > 0 && (
                                <Card>
                                  <CardContent className="p-6">
                                    <div className="flex items-center space-x-2 mb-4">
                                      <TrendingUp className="w-5 h-5 text-purple-500" />
                                      <h4 className="font-semibold text-gray-900">Tópicos Discutidos</h4>
                                    </div>
                                    <div className="space-y-3">
                                      {call.detectedTopics.map((topic, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                              <Badge className={`${getTopicBadgeColor(topic.relevance)} capitalize`}>
                                                {topic.category.replace('_', ' ')}
                                              </Badge>
                                              <span className="text-xs text-gray-500">
                                                {topic.mentions} menções
                                              </span>
                                            </div>
                                            <div className="flex flex-wrap gap-1 mt-2">
                                              {topic.keywords.slice(0, 5).map((keyword, ki) => (
                                                <span key={ki} className="text-xs bg-white px-2 py-1 rounded border border-gray-200">
                                                  {keyword}
                                                </span>
                                              ))}
                                            </div>
                                          </div>
                                          <div className="text-right ml-4">
                                            <div className="text-lg font-bold text-purple-600">{topic.relevance}%</div>
                                            <div className="text-xs text-gray-500">relevância</div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </CardContent>
                                </Card>
                              )}

                              {/* Detected Keywords */}
                              {call.detectedKeywords && call.detectedKeywords.length > 0 && (
                                <Card>
                                  <CardContent className="p-6">
                                    <div className="flex items-center space-x-2 mb-4">
                                      <Tag className="w-5 h-5 text-blue-500" />
                                      <h4 className="font-semibold text-gray-900">Palavras-Chave Identificadas</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      {/* Positive Keywords */}
                                      <div>
                                        <h5 className="text-sm font-semibold text-green-700 mb-2">✓ Positivas</h5>
                                        <div className="space-y-2">
                                          {call.detectedKeywords
                                            .filter(kw => kw.type === 'positive')
                                            .slice(0, 5)
                                            .map((keyword, index) => (
                                              <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
                                                <span className="text-sm font-medium text-green-900">{keyword.word}</span>
                                                <Badge className="bg-green-100 text-green-800">
                                                  {keyword.count}x
                                                </Badge>
                                              </div>
                                            ))}
                                        </div>
                                      </div>

                                      {/* Negative Keywords */}
                                      <div>
                                        <h5 className="text-sm font-semibold text-red-700 mb-2">✗ Negativas</h5>
                                        <div className="space-y-2">
                                          {call.detectedKeywords
                                            .filter(kw => kw.type === 'negative')
                                            .slice(0, 5)
                                            .map((keyword, index) => (
                                              <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded">
                                                <span className="text-sm font-medium text-red-900">{keyword.word}</span>
                                                <Badge className="bg-red-100 text-red-800">
                                                  {keyword.count}x
                                                </Badge>
                                              </div>
                                            ))}
                                        </div>
                                      </div>

                                      {/* Neutral Keywords */}
                                      <div>
                                        <h5 className="text-sm font-semibold text-gray-700 mb-2">○ Neutras</h5>
                                        <div className="space-y-2">
                                          {call.detectedKeywords
                                            .filter(kw => kw.type === 'neutral')
                                            .slice(0, 5)
                                            .map((keyword, index) => (
                                              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                <span className="text-sm font-medium text-gray-900">{keyword.word}</span>
                                                <Badge className="bg-gray-100 text-gray-800">
                                                  {keyword.count}x
                                                </Badge>
                                              </div>
                                            ))}
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              )}
                            </TabsContent>

                            {/* TRANSCRIPTION TAB */}
                            <TabsContent value="transcription">
                              <div className="bg-white p-6 rounded-xl border border-gray-200">
                                <div className="flex items-center space-x-2 mb-3">
                                  <FileText className="w-5 h-5 text-brand-green" />
                                  <h4 className="font-semibold text-brand-dark">Transcrição Completa</h4>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg border max-h-[500px] overflow-y-auto">
                                  <pre className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                                    {call.transcription || 'Transcrição não disponível'}
                                  </pre>
                                </div>
                              </div>
                            </TabsContent>
                          </Tabs>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
