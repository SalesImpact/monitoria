'use client';

import { useEffect, useState, useRef } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';

interface TranscriptionSegment {
  speaker?: string;
  text: string;
  start?: number;
  end?: number;
  timestamp?: number;
}

interface TranscriptionChatProps {
  callId: string;
  sdrName: string;
  prospectName: string;
}

export default function TranscriptionChat({ callId, sdrName, prospectName }: TranscriptionChatProps) {
  const [segments, setSegments] = useState<TranscriptionSegment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTranscription = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/calls/${callId}/transcription`);
        
        if (!response.ok) {
          throw new Error('Erro ao buscar transcrição');
        }

        const data = await response.json();

        if (data.transcriptionSegments && Array.isArray(data.transcriptionSegments)) {
          // Processar segments e garantir que tenham a estrutura correta
          const processedSegments = data.transcriptionSegments.map((seg: any) => ({
            speaker: seg.speaker || seg.speaker_label || seg.label || seg.role,
            text: seg.text || seg.content || seg.transcript || '',
            start: seg.start || seg.start_time || seg.timestamp,
            end: seg.end || seg.end_time,
            timestamp: seg.timestamp || seg.start || seg.start_time
          })).filter((seg: any) => seg.text && seg.text.trim() !== '');
          
          setSegments(processedSegments);
        } else if (data.transcriptionText) {
          // Se não houver segments, criar um segment único com o texto completo
          setSegments([{ text: data.transcriptionText }]);
        } else {
          setSegments([]);
        }
      } catch (err: any) {
        console.error('Erro ao buscar transcrição:', err);
        setError(err.message || 'Erro ao carregar transcrição');
      } finally {
        setIsLoading(false);
      }
    };

    if (callId) {
      fetchTranscription();
    }
  }, [callId]);

  useEffect(() => {
    // Scroll para o final quando os segments carregarem
    if (scrollRef.current && !isLoading) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [segments, isLoading]);

  const formatTime = (seconds?: number) => {
    if (!seconds && seconds !== 0) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSpeakerName = (speaker?: string): { name: string; isSDR: boolean } => {
    if (!speaker) return { name: 'Desconhecido', isSDR: false };
    
    const speakerLower = speaker.toLowerCase().trim();
    
    // Tentar identificar se é SDR ou cliente baseado no texto do speaker
    // Formatos comuns: "SPEAKER_00", "SPEAKER_01", "SDR", "CLIENT", "0", "1", etc.
    if (
      speakerLower === '0' || 
      speakerLower === 'speaker_0' || 
      speakerLower === 'speaker_00' ||
      speakerLower.includes('sdr') || 
      speakerLower.includes('vendedor') || 
      speakerLower.includes('vendedora') ||
      speakerLower.includes('agent')
    ) {
      return { name: sdrName, isSDR: true };
    }
    
    if (
      speakerLower === '1' || 
      speakerLower === 'speaker_1' || 
      speakerLower === 'speaker_01' ||
      speakerLower.includes('cliente') || 
      speakerLower.includes('prospect') || 
      speakerLower.includes('prospecto') ||
      speakerLower.includes('customer') ||
      speakerLower.includes('caller')
    ) {
      return { name: prospectName, isSDR: false };
    }
    
    // Se não conseguir identificar, assumir que é SDR se o nome contém algo relacionado
    // ou usar o nome do speaker diretamente
    return { name: speaker, isSDR: false };
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-brand-green mr-2" />
        <span className="text-gray-600">Carregando transcrição...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (segments.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Transcrição não disponível para esta ligação</p>
      </div>
    );
  }

  return (
    <div 
      ref={scrollRef}
      className="space-y-4 max-h-[600px] overflow-y-auto px-2 py-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
      style={{ scrollBehavior: 'smooth' }}
    >
      {segments.map((segment, index) => {
        const speakerInfo = getSpeakerName(segment.speaker);
        const isSDR = speakerInfo.isSDR;
        const showAvatar = index === 0 || 
          (index > 0 && segments[index - 1].speaker !== segment.speaker);

        return (
          <div
            key={index}
            className={`flex gap-3 ${isSDR ? 'flex-row' : 'flex-row-reverse'}`}
          >
            {showAvatar && (
              <Avatar className={`h-8 w-8 flex-shrink-0 ${isSDR ? 'order-1' : 'order-2'}`}>
                <AvatarFallback 
                  className={isSDR 
                    ? 'bg-brand-green text-white text-xs' 
                    : 'bg-blue-500 text-white text-xs'
                  }
                >
                  {getInitials(speakerInfo.name)}
                </AvatarFallback>
              </Avatar>
            )}
            {!showAvatar && <div className="w-8 flex-shrink-0" />}
            
            <div 
              className={`flex-1 space-y-1 ${isSDR ? 'order-2' : 'order-1'}`}
            >
              {showAvatar && (
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold ${
                    isSDR ? 'text-brand-green' : 'text-blue-600'
                  }`}>
                    {speakerInfo.name}
                  </span>
                  {(segment.start !== undefined || segment.timestamp !== undefined) && (
                    <span className="text-xs text-gray-400">
                      {formatTime(segment.start ?? segment.timestamp)}
                    </span>
                  )}
                </div>
              )}
              
              <div
                className={`rounded-lg px-4 py-2.5 shadow-sm ${
                  isSDR
                    ? 'bg-white text-gray-900 ml-0 border border-gray-200'
                    : 'bg-blue-50 text-gray-900 mr-0 border border-blue-200'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {segment.text}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

