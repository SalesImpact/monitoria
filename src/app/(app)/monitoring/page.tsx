'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Loader2, ChevronLeft, ChevronRight, Search, Filter, FilterX, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import CallMonitoring from '@/components/call-monitoring';

interface CallFromAPI {
  id: number;
  date: string;
  userName: string | null;
  receiverPhone: string;
  status: string;
  callType: string | null;
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
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filtros e valores únicos
  const [filters, setFilters] = useState<{
    sdr?: string;
    result?: string;
    sentiment?: string;
    minDuration?: number;
  }>({
    minDuration: 30 // Default de 30 segundos
  });
  const [filterOptions, setFilterOptions] = useState<{
    sdrs: string[];
    results: string[];
    sentiments: string[];
  }>({
    sdrs: [],
    results: [],
    sentiments: []
  });

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    fetchCalls();
  }, [filter, currentPage, pageSize, filters, searchTerm]);

  const fetchFilterOptions = async () => {
    try {
      const response = await fetch('/api/calls/filters');
      if (response.ok) {
        const data = await response.json();
        setFilterOptions({
          sdrs: data.sdrs || [],
          results: data.results || [],
          sentiments: data.sentiments || []
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
      if (filters.minDuration !== undefined && filters.minDuration > 0) {
        params.append('minDuration', String(filters.minDuration));
      }
      
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

  // Aplicar busca local se houver searchTerm
  const filteredCalls = searchTerm 
    ? calls.filter((call) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          call.sdrName.toLowerCase().includes(searchLower) ||
          call.client.toLowerCase().includes(searchLower) ||
          call.prospectName.toLowerCase().includes(searchLower)
        );
      })
    : calls;

  const displayedTotal = searchTerm ? filteredCalls.length : total;
  const totalPages = Math.ceil(total / pageSize);

  // Contar filtros ativos
  const activeFiltersCount = [
    filter !== 'all',
    filters.sdr && filters.sdr !== 'all',
    filters.result && filters.result !== 'all',
    filters.sentiment && filters.sentiment !== 'all',
    filters.minDuration && filters.minDuration > 30,
    searchTerm && searchTerm.trim() !== ''
  ].filter(Boolean).length;

  const hasActiveFilters = activeFiltersCount > 0;

  // Função para limpar todos os filtros
  const clearAllFilters = () => {
    setFilter('all');
    setFilters({ minDuration: 30 });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark">Monitoria de Ligações</h1>
          <p className="text-gray-600 mt-1">
            Análise detalhada e reprodução das ligações gravadas
          </p>
        </div>
      </div>

      {/* Filtros Unificados */}
      <Card className={`border-gray-200 shadow-sm transition-all ${hasActiveFilters ? 'ring-2 ring-brand-green/20' : ''}`}>
        <CardContent className="p-4">
          {/* Header compacto */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Filter className={`w-4 h-4 ${hasActiveFilters ? 'text-brand-green' : 'text-gray-500'}`} />
              <span className="text-sm font-semibold text-brand-dark">Filtros</span>
              {hasActiveFilters && (
                <Badge variant="secondary" className="text-xs py-0 px-1.5">
                  {activeFiltersCount}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">
                {searchTerm ? 'Exibindo' : 'Total'}: <span className="font-semibold text-brand-green">{displayedTotal}</span>
              </span>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-7 px-2 text-xs text-gray-600 hover:text-brand-dark"
                >
                  <FilterX className="w-3 h-3 mr-1" />
                  Limpar
                </Button>
              )}
            </div>
          </div>

          {/* Filtros ativos como badges compactos */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-1.5 mb-3 pb-2 border-b border-gray-200">
              {filter !== 'all' && (
                <Badge variant="secondary" className="text-xs py-0.5 px-2 gap-1 h-6">
                  {filter === 'my-calls' ? 'Minhas Ligações' : 'Todas'}
                  <button
                    onClick={() => {
                      setFilter('all');
                      setCurrentPage(1);
                    }}
                    className="ml-0.5 hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </Badge>
              )}
              {filters.sdr && filters.sdr !== 'all' && (
                <Badge variant="secondary" className="text-xs py-0.5 px-2 gap-1 h-6">
                  {filters.sdr}
                  <button
                    onClick={() => {
                      setFilters(prev => ({ ...prev, sdr: undefined }));
                      setCurrentPage(1);
                    }}
                    className="ml-0.5 hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </Badge>
              )}
              {filters.result && filters.result !== 'all' && (
                <Badge variant="secondary" className="text-xs py-0.5 px-2 gap-1 h-6">
                  {getResultLabel(filters.result)}
                  <button
                    onClick={() => {
                      setFilters(prev => ({ ...prev, result: undefined }));
                      setCurrentPage(1);
                    }}
                    className="ml-0.5 hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </Badge>
              )}
              {filters.sentiment && filters.sentiment !== 'all' && (
                <Badge variant="secondary" className="text-xs py-0.5 px-2 gap-1 h-6">
                  {filters.sentiment.charAt(0).toUpperCase() + filters.sentiment.slice(1)}
                  <button
                    onClick={() => {
                      setFilters(prev => ({ ...prev, sentiment: undefined }));
                      setCurrentPage(1);
                    }}
                    className="ml-0.5 hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </Badge>
              )}
              {filters.minDuration && filters.minDuration > 30 && (
                <Badge variant="secondary" className="text-xs py-0.5 px-2 gap-1 h-6">
                  ≥{filters.minDuration}s
                  <button
                    onClick={() => {
                      setFilters(prev => ({ ...prev, minDuration: 30 }));
                      setCurrentPage(1);
                    }}
                    className="ml-0.5 hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </Badge>
              )}
              {searchTerm && searchTerm.trim() !== '' && (
                <Badge variant="secondary" className="text-xs py-0.5 px-2 gap-1 h-6 max-w-[150px] truncate">
                  "{searchTerm}"
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setCurrentPage(1);
                    }}
                    className="ml-0.5 hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </Badge>
              )}
            </div>
          )}
          
          {/* Grid compacto de filtros */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {/* Busca - ocupa 2 colunas */}
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
              <Input
                placeholder="Buscar SDR, cliente ou prospect..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8 h-9 text-sm border-gray-300 focus:border-brand-green focus:ring-brand-green"
              />
            </div>

            {/* Escopo */}
            <Select value={filter} onValueChange={(value: 'my-calls' | 'all') => {
              setFilter(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger className="h-9 text-sm border-gray-300">
                <SelectValue placeholder="Escopo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Ligações</SelectItem>
                <SelectItem value="my-calls">Minhas Ligações</SelectItem>
              </SelectContent>
            </Select>

            {/* SDR */}
            <Select 
              value={filters.sdr || 'all'} 
              onValueChange={(value) => {
                setFilters(prev => ({ ...prev, sdr: value }));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-9 text-sm border-gray-300">
                <SelectValue placeholder="SDR" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os SDRs</SelectItem>
                {filterOptions.sdrs.filter(sdr => sdr && sdr.trim() !== '').map((sdr) => (
                  <SelectItem key={sdr} value={sdr}>
                    {sdr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Resultado */}
            <Select 
              value={filters.result || 'all'} 
              onValueChange={(value) => {
                setFilters(prev => ({ ...prev, result: value }));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-9 text-sm border-gray-300">
                <SelectValue placeholder="Resultado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os resultados</SelectItem>
                {filterOptions.results.filter(result => result && result.trim() !== '').map((result) => (
                  <SelectItem key={result} value={result}>
                    {result === 'agendado' ? 'Agendado' : 
                     result === 'não_agendado' ? 'Não Agendado' : 
                     result === 'qualificação_sucesso' ? 'Qualificação Sucesso' : result}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Segunda linha compacta: Sentimento e Duração */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mt-2.5">
            <Select 
              value={filters.sentiment || 'all'} 
              onValueChange={(value) => {
                setFilters(prev => ({ ...prev, sentiment: value }));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-9 text-sm border-gray-300">
                <SelectValue placeholder="Sentimento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os sentimentos</SelectItem>
                {filterOptions.sentiments.filter(sentiment => sentiment && sentiment.trim() !== '').map((sentiment) => (
                  <SelectItem key={sentiment} value={sentiment}>
                    {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                value={filters.minDuration || 30}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  setFilters(prev => ({ ...prev, minDuration: value }));
                  setCurrentPage(1);
                }}
                className="h-9 text-sm border-gray-300 w-20"
                placeholder="30"
              />
              <span className="text-xs text-gray-600 whitespace-nowrap">seg mín</span>
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
              calls={filteredCalls}
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
