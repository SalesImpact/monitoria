
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, VolumeX, RotateCcw, RotateCw, Loader2 } from 'lucide-react';

interface AudioPlayerProps {
  audioFile?: string | null;
  storedAudioUrl?: string | null;
  storedAudioFilename?: string | null;
}

export default function AudioPlayer({ 
  audioFile, 
  storedAudioUrl, 
  storedAudioFilename 
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar URL assinada do DigitalOcean Spaces
  useEffect(() => {
    const fetchSignedUrl = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Se já temos uma URL completa (não do Spaces), usar diretamente
        if (audioFile && (audioFile.startsWith('http://') || audioFile.startsWith('https://'))) {
          setAudioUrl(audioFile);
          setIsLoading(false);
          return;
        }

        // Se não temos nenhuma informação de áudio, não fazer nada
        if (!audioFile && !storedAudioUrl && !storedAudioFilename) {
          setIsLoading(false);
          setError('Nenhum arquivo de áudio disponível');
          return;
        }

        // Construir parâmetros para a API
        const params = new URLSearchParams();
        if (storedAudioFilename) {
          params.append('filename', storedAudioFilename);
        } else if (storedAudioUrl) {
          params.append('storedAudioUrl', storedAudioUrl);
        } else if (audioFile) {
          params.append('filename', audioFile);
        }

        const response = await fetch(`/api/audio/url?${params.toString()}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao buscar URL do áudio');
        }

        const data = await response.json();
        setAudioUrl(data.url);
      } catch (err: any) {
        console.error('Erro ao buscar URL do áudio:', err);
        setError(err.message || 'Erro ao carregar áudio');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSignedUrl();
  }, [audioFile, storedAudioUrl, storedAudioFilename]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);
    const handleError = () => {
      setError('Erro ao reproduzir áudio');
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [audioUrl]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((err) => {
        console.error('Erro ao reproduzir:', err);
        setError('Erro ao reproduzir áudio');
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = value[0];
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = value[0];
    setVolume(newVolume);
    audio.volume = newVolume;
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const skipBackward = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.currentTime = Math.max(0, audio.currentTime - 10);
  };

  const skipForward = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.currentTime = Math.min(duration, audio.currentTime + 10);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg border flex items-center justify-center space-x-2">
        <Loader2 className="w-5 h-5 animate-spin text-brand-green" />
        <span className="text-sm text-gray-600">Carregando áudio...</span>
      </div>
    );
  }

  if (error || !audioUrl) {
    return (
      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
        <p className="text-sm text-red-600">{error || 'Áudio não disponível'}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg border space-y-3">
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
      />
      
      {/* Time display and progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-600">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={1}
          onValueChange={handleTimeChange}
          className="w-full"
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={skipBackward}
            className="p-2"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={togglePlayPause}
            className="p-2"
            disabled={!audioUrl}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={skipForward}
            className="p-2"
          >
            <RotateCw className="w-4 h-4" />
          </Button>
        </div>

        {/* Volume controls */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMute}
            className="p-2"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>
          <div className="w-20">
            <Slider
              value={[isMuted ? 0 : volume]}
              max={1}
              step={0.1}
              onValueChange={handleVolumeChange}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
