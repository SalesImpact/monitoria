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
  projectName: string | null;
  meetimeUser: {
    id: number;
    name: string | null;
    email: string | null;
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

export default function MonitoringPage() {
  const { data: session } = useSession();
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'my-calls' | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [total, setTotal] = useState(0);
  const [hasAccounts, setHasAccounts] = useState(true);

  useEffect(() => {
    fetchCalls();
  }, [filter, currentPage, pageSize]);

  const fetchCalls = async () => {
    try {
      setLoading(true);
      const offset = (currentPage - 1) * pageSize;
      const response = await fetch(`/api/calls?filter=${filter}&limit=${pageSize}&offset=${offset}`);
      
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
          callType: 'call_real',
          result: '', // Deixar em branco por enquanto
          audioFile: call.storedAudioUrl || call.callLink || null,
          storedAudioUrl: call.storedAudioUrl || null,
          storedAudioFilename: call.storedAudioFilename || null,
          transcription: null,
          averageScore: null,
          sdr: {
            name: call.meetimeUser?.name || call.userName || 'Usuário Desconhecido',
            email: call.meetimeUser?.email || '',
          },
          scores: null,
          keywords: [],
          sentimentAnalysis: undefined, // Deixar em branco por enquanto
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
          <CallMonitoring calls={calls} />

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
