'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import CallMonitoring from '@/components/call-monitoring';

interface CallFromAPI {
  id: number;
  date: string;
  userName: string | null;
  receiverPhone: string;
  status: string;
  connectedDurationSeconds: number | null;
  callLink: string | null;
  storedAudioUrl: string | null;
  storedAudioFilename: string | null;
  averageScore: number | null;
  sentimentoGeral: string | null;
  sentimentoCliente: string | null;
  sentimentoSdr: string | null;
  resultado: string | null;
  projectName: string | null;
  meetimeUser: {
    id: number;
    name: string | null;
    email: string | null;
  } | null;
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
}

interface CallsResponse {
  calls: CallFromAPI[];
  total: number;
  hasAccounts: boolean;
  filter: string;
  limit: number;
  offset: number;
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
  storedAudioUrl?: string | null;
  storedAudioFilename?: string | null;
  transcription?: string | null;
  averageScore?: number | null;
  sdr: {
    name: string;
    email: string;
  };
  scores?: any;
  keywords: Array<{
    word: string;
  }>;
  sentimentAnalysis?: any;
  sentimentJourney?: any;
  detectedTopics?: any;
  detectedKeywords?: any;
}

function generateEmotionalTone(overall: string, client: string, sdr: string): string {
  const overallText = overall.toLowerCase();
  const clientText = client.toLowerCase();
  const sdrText = sdr.toLowerCase();
  
  const overallLabel = overallText === 'positivo' ? 'positivo' : 
                       overallText === 'negativo' ? 'negativo' : 
                       overallText === 'entusiasmado' ? 'entusiasmado' : 'neutro';
  
  const clientLabel = clientText === 'positivo' ? 'atitude positiva' :
                      clientText === 'negativo' ? 'atitude negativa' :
                      clientText === 'frustrado' ? 'frustração' :
                      clientText === 'entusiasmado' ? 'entusiasmo' : 'atitude neutra';
  
  const sdrLabel = sdrText === 'confiante' ? 'postura confiante' :
                   sdrText === 'positivo' ? 'postura positiva' :
                   sdrText === 'entusiasmado' ? 'postura entusiasmada' :
                   sdrText === 'inseguro' ? 'postura insegura' : 'postura neutra';
  
  return `Análise geral: ${overallLabel}. Cliente demonstrou ${clientLabel}, SDR apresentou ${sdrLabel}.`;
}

export default function MonitoringPage() {
  const { data: session } = useSession();
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'my-calls' | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [total, setTotal] = useState(0);
  const [hasAccounts, setHasAccounts] = useState(true);
  
  // Filtros e valores únicos
  const [filters, setFilters] = useState<{
    sdr?: string;
    result?: string;
    sentiment?: string;
    type?: string;
  }>({});
  const [filterOptions, setFilterOptions] = useState<{
    sdrs: string[];
    results: string[];
    sentiments: string[];
    types: string[];
  }>({
    sdrs: [],
    results: [],
    sentiments: [],
    types: []
  });

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    fetchCalls();
  }, [filter, currentPage, pageSize, filters]);

  const fetchFilterOptions = async () => {
    try {
      const response = await fetch('/api/calls/filters');
      if (response.ok) {
        const data = await response.json();
        setFilterOptions({
          sdrs: data.sdrs || [],
          results: data.results || [],
          sentiments: data.sentiments || [],
          types: data.types || []
        });
      }
    } catch (error) {
      console.error('Erro ao buscar opções de filtro:', error);
    }
  };

  const fetchCalls = async () => {
    try {
      setLoading(true);
      const offset = (currentPage - 1) * pageSize;
      
      // Construir query string com filtros
      const params = new URLSearchParams({
        filter: filter,
        limit: String(pageSize),
        offset: String(offset),
      });
      
      if (filters.sdr && filters.sdr !== 'all') params.append('sdr', filters.sdr);
      if (filters.result && filters.result !== 'all') params.append('result', filters.result);
      if (filters.sentiment && filters.sentiment !== 'all') params.append('sentiment', filters.sentiment);
      if (filters.type && filters.type !== 'all') params.append('type', filters.type);
      
      const response = await fetch(`/api/calls?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar ligações');
      }

      const data: CallsResponse = await response.json();
      setTotal(data.total);
      setHasAccounts(data.hasAccounts);

      // Converter dados da API para o formato esperado pelo componente
      const formattedCalls: Call[] = data.calls.map((call) => {
        const durationSeconds = call.connectedDurationSeconds || 0;
        const minutes = Math.floor(durationSeconds / 60);
        const seconds = durationSeconds % 60;
        const duration = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

        return {
          id: String(call.id),
          sdrName: call.meetimeUser?.name || call.userName || 'Usuário Desconhecido',
          client: call.projectName || 'N/A', // Cliente é o projeto da cadência
          prospectName: call.receiverPhone || 'N/A',
          date: new Date(call.date),
          duration: duration,
          callType: call.callType || 'call_real',
          result: call.resultado || '', // Usar resultado da tabela monitoria_call_scores
          audioFile: call.storedAudioUrl || call.callLink || null,
          storedAudioUrl: call.storedAudioUrl || null,
          storedAudioFilename: call.storedAudioFilename || null,
          transcription: null,
          averageScore: call.averageScore || null, // Usar average_score da tabela monitoria_call_scores
          sdr: {
            name: call.meetimeUser?.name || call.userName || 'Usuário Desconhecido',
            email: call.meetimeUser?.email || '',
          },
          scores: call.scores || null,
          keywords: [],
          sentimentAnalysis: (call.sentimentoGeral || call.sentimentoCliente || call.sentimentoSdr || call.scores) ? {
            overall: call.sentimentoGeral || 'neutro',
            client: call.sentimentoCliente || 'neutro',
            sdr: call.sentimentoSdr || 'neutro',
            confidence: call.averageScore ? Math.round((call.averageScore / 5) * 100) : 0,
            emotionalTone: generateEmotionalTone(
              call.sentimentoGeral || 'neutro',
              call.sentimentoCliente || 'neutro',
              call.sentimentoSdr || 'neutro'
            )
          } : undefined,
          sentimentJourney: undefined,
          detectedTopics: undefined,
          detectedKeywords: undefined,
        };
      });

      setCalls(formattedCalls);
    } catch (error) {
      console.error('Error fetching calls:', error);
      setCalls([]);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark">Monitoria de Ligações</h1>
          <p className="text-gray-600 mt-1">
            Análise detalhada e reprodução das ligações gravadas
          </p>
        </div>
      </div>

      {/* Filtro de Ligações */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Filtro:</span>
              <Select value={filter} onValueChange={(value: 'my-calls' | 'all') => {
                setFilter(value);
                setCurrentPage(1); // Resetar para primeira página ao mudar filtro
              }}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Ligações</SelectItem>
                  <SelectItem value="my-calls">Minhas Ligações</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Total: {total} ligações
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Componente de Monitoramento */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
          ) : (
            <>
            <CallMonitoring 
              calls={calls} 
              filterOptions={filterOptions}
              onFiltersChange={(newFilters) => {
                setFilters(newFilters);
                setCurrentPage(1); // Resetar página ao mudar filtros
              }}
            />

          {/* Paginação */}
          {totalPages > 1 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Itens por página:</span>
                    <Select
                      value={String(pageSize)}
                      onValueChange={(value) => {
                        setPageSize(Number(value));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      Página {currentPage} de {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1 || loading}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages || loading}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
