
'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

interface Call {
  id: string;
  transcription?: string | null;
}

interface WordCloudSectionProps {
  calls: Call[];
}

// Palavras comuns em português para filtrar (stopwords)
const STOPWORDS = new Set([
  'a', 'o', 'e', 'de', 'da', 'do', 'em', 'para', 'com', 'um', 'uma', 'os', 'as',
  'dos', 'das', 'ao', 'aos', 'à', 'às', 'por', 'na', 'no', 'nas', 'nos', 'é', 'ou',
  'que', 'se', 'vai', 'ter', 'mais', 'mas', 'já', 'eu', 'tu', 'ele', 'ela', 'nós',
  'vós', 'eles', 'elas', 'ser', 'estar', 'ter', 'haver', 'fazer', 'ir', 'poder',
  'dizer', 'quando', 'onde', 'como', 'porque', 'qual', 'quem', 'muito', 'bem',
  'mesmo', 'outro', 'outro', 'aqui', 'ali', 'lá', 'então', 'tá', 'né', 'sim', 'não',
  'você', 'aí', 'assim', 'também', 'só', 'ainda', 'coisa', 'coisas', 'tô', 'tá',
  'pra', 'pro', 'essa', 'esse', 'isso', 'aquilo', 'esse', 'essa', 'esses', 'essas',
  'seu', 'sua', 'seus', 'suas', 'meu', 'minha', 'meus', 'minhas', 'alô', 'oi',
  'tchau', 'obrigado', 'obrigada', 'ok', 'beleza'
]);

// Cores vibrantes para as palavras
const COLORS = [
  'text-blue-600',
  'text-green-600',
  'text-purple-600',
  'text-pink-600',
  'text-indigo-600',
  'text-cyan-600',
  'text-teal-600',
  'text-orange-600',
  'text-red-500',
  'text-yellow-600',
  'text-emerald-600',
  'text-fuchsia-600',
];

export default function WordCloudSection({ calls }: WordCloudSectionProps) {
  // Extrair e processar palavras-chave das transcrições
  const wordFrequencies = useMemo(() => {
    const allText = calls
      .map(call => call.transcription)
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"]/g, ' '); // Remove pontuação

    // Contar frequência das palavras
    const wordCount: Record<string, number> = {};
    
    allText.split(/\s+/).forEach(word => {
      // Filtrar palavras muito curtas, números e stopwords
      if (word.length > 3 && !STOPWORDS.has(word) && !/^\d+$/.test(word)) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });

    // Ordenar por frequência e pegar as top 30
    return Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 30)
      .map(([word, count]) => ({ word, count }));
  }, [calls]);

  // Calcular tamanhos relativos
  const maxCount = Math.max(...wordFrequencies.map(w => w.count), 1);
  const minCount = Math.min(...wordFrequencies.map(w => w.count), 1);

  const getWordStyle = (count: number, index: number) => {
    // Calcular tamanho baseado na frequência (de 14px a 48px)
    const minSize = 14;
    const maxSize = 48;
    const range = maxCount - minCount;
    const normalized = range > 0 ? (count - minCount) / range : 0.5;
    const fontSize = Math.floor(minSize + (maxSize - minSize) * normalized);

    // Selecionar cor da lista
    const color = COLORS[index % COLORS.length];

    // Peso da fonte baseado na frequência
    const fontWeight = count > maxCount * 0.7 ? 'font-bold' : count > maxCount * 0.4 ? 'font-semibold' : 'font-medium';

    return {
      fontSize: `${fontSize}px`,
      className: `${color} ${fontWeight} inline-block transition-all duration-300 hover:scale-110 cursor-default`,
      opacity: 0.7 + (normalized * 0.3), // Opacidade entre 0.7 e 1.0
    };
  };

  if (wordFrequencies.length === 0) {
    return (
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="text-brand-dark flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-brand-green" />
            Nuvem de Palavras
          </CardTitle>
          <CardDescription>
            Palavras mais frequentes nas transcrições das ligações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[200px] flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Nenhuma transcrição disponível</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-hover">
      <CardHeader>
        <CardTitle className="text-brand-dark flex items-center">
          <MessageSquare className="w-5 h-5 mr-2 text-brand-green" />
          Nuvem de Palavras
        </CardTitle>
        <CardDescription>
          Palavras-chave mais utilizadas nos roleplays de vendas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="min-h-[300px] p-8 bg-gradient-to-br from-white via-gray-50 to-blue-50 rounded-xl border-2 border-gray-100 flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
          {wordFrequencies.map(({ word, count }, index) => {
            const style = getWordStyle(count, index);
            return (
              <span
                key={word}
                className={style.className}
                style={{ 
                  fontSize: style.fontSize,
                  opacity: style.opacity,
                }}
                title={`${word}: ${count} ocorrências`}
              >
                {word}
              </span>
            );
          })}
        </div>
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Análise baseada em {calls.length} transcrições • {wordFrequencies.length} palavras-chave identificadas
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
