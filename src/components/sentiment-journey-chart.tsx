'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

interface SentimentJourneyPoint {
  timestamp: number;
  sentiment: string;
  intensity: number;
  speaker: string;
  text?: string;
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SentimentJourneyChartProps {
  journey: SentimentJourneyPoint[];
  duration: string;
}

export default function SentimentJourneyChart({ journey, duration }: SentimentJourneyChartProps) {
  const sentimentColors: { [key: string]: string } = {
    'entusiasmado': '#10b981',
    'positivo': '#60a5fa',
    'neutro': '#94a3b8',
    'negativo': '#fb923c',
    'frustrado': '#ef4444',
    'confiante': '#8b5cf6',
    'inseguro': '#f59e0b',
  };

  const data = {
    labels: journey.map(point => {
      const minutes = Math.floor(point.timestamp / 60);
      const seconds = point.timestamp % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }),
    datasets: [
      {
        label: 'Cliente',
        data: journey
          .filter(point => point.speaker === 'client')
          .map((point, index) => ({
            x: journey.findIndex(p => p === point),
            y: point.intensity,
          })),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        pointBackgroundColor: journey
          .filter(point => point.speaker === 'client')
          .map(point => sentimentColors[point.sentiment] || '#94a3b8'),
        pointRadius: 6,
        pointHoverRadius: 8,
        fill: false,
        tension: 0.4,
      },
      {
        label: 'SDR',
        data: journey
          .filter(point => point.speaker === 'sdr')
          .map((point, index) => ({
            x: journey.findIndex(p => p === point),
            y: point.intensity,
          })),
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        pointBackgroundColor: journey
          .filter(point => point.speaker === 'sdr')
          .map(point => sentimentColors[point.sentiment] || '#94a3b8'),
        pointRadius: 6,
        pointHoverRadius: 8,
        fill: false,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            family: 'Inter, sans-serif',
          },
        },
      },
      title: {
        display: true,
        text: 'Evolução do Sentimento ao Longo da Ligação',
        font: {
          size: 16,
          weight: 'bold' as const,
          family: 'Inter, sans-serif',
        },
        padding: {
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 13,
          weight: 'bold' as const,
        },
        bodyFont: {
          size: 12,
        },
        callbacks: {
          label: function(context: any) {
            const point = journey[context.dataIndex];
            return [
              `${context.dataset.label}: ${point.sentiment}`,
              `Intensidade: ${point.intensity}%`,
              point.text ? `"${point.text.substring(0, 50)}..."` : '',
            ];
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Tempo da Ligação',
          font: {
            size: 13,
            weight: 'bold' as const,
          },
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 10,
          },
        },
      },
      y: {
        title: {
          display: true,
          text: 'Intensidade Emocional',
          font: {
            size: 13,
            weight: 'bold' as const,
          },
        },
        min: 0,
        max: 100,
        ticks: {
          callback: function(value: any) {
            return value + '%';
          },
          font: {
            size: 10,
          },
        },
      },
    },
  };

  return (
    <div className="w-full h-[400px] p-4 bg-white rounded-lg border border-gray-200">
      <Line data={data} options={options} />
      
      {/* Legenda de cores de sentimento */}
      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        {Object.entries(sentimentColors).map(([sentiment, color]) => (
          <div key={sentiment} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: color }}
            />
            <span className="text-xs text-gray-600 capitalize">
              {sentiment}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
