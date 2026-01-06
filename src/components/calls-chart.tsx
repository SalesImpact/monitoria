
'use client';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Cell } from 'recharts';

interface Call {
  id: string;
  sdrName: string;
  client: string;
  averageScore?: number | null;
  result: string;
}

interface CallsChartProps {
  calls: Call[];
}

export default function CallsChart({ calls }: CallsChartProps) {
  // Handle undefined or empty calls
  if (!calls || !Array.isArray(calls) || calls.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500">
        <div className="text-center">
          <p className="text-sm">Nenhum dado de performance disponível</p>
          <p className="text-xs mt-1">Aguardando análises de ligações</p>
        </div>
      </div>
    );
  }

  // Group calls by SDR and calculate averages
  const sdrData = calls.reduce((acc, call) => {
    if (!call.averageScore) return acc;
    
    if (!acc[call.sdrName]) {
      acc[call.sdrName] = {
        sdrName: call.sdrName,
        totalScore: 0,
        totalCalls: 0,
        successfulCalls: 0,
      };
    }
    
    acc[call.sdrName].totalScore += call.averageScore;
    acc[call.sdrName].totalCalls += 1;
    
    if (call.result === 'agendado' || call.result === 'qualificação_sucesso') {
      acc[call.sdrName].successfulCalls += 1;
    }
    
    return acc;
  }, {} as Record<string, any>);

  // Transform to chart data
  const chartData = Object.values(sdrData).map((sdr: any) => ({
    name: sdr.sdrName.split(' ')[0], // First name only for chart
    pontuacao: Number((sdr.totalScore / sdr.totalCalls).toFixed(1)),
    conversao: Number(((sdr.successfulCalls / sdr.totalCalls) * 100).toFixed(1)),
    calls: sdr.totalCalls,
  }));

  // Sort by score
  chartData.sort((a, b) => b.pontuacao - a.pontuacao);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-brand-dark">{label}</p>
          <div className="space-y-1 mt-2">
            <p className="text-sm" style={{ color: '#30E3CA' }}>
              Pontuação: <span className="font-medium">{payload[0]?.value}/5.0</span>
            </p>
            <p className="text-xs text-gray-500 pt-1">
              {payload[0]?.payload?.calls} ligações analisadas
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500">
        <div className="text-center">
          <p className="text-sm">Nenhum dado de performance disponível</p>
          <p className="text-xs mt-1">Aguardando análises de ligações</p>
        </div>
      </div>
    );
  }

  // Colors based on performance
  const getBarColor = (value: number) => {
    if (value >= 4) return '#10b981'; // green-500
    if (value >= 3) return '#f59e0b'; // amber-500
    return '#ef4444'; // red-500
  };

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <XAxis 
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: '#6b7280' }}
          />
          <YAxis 
            domain={[0, 5]}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: '#6b7280' }}
            label={{ 
              value: 'Pontuação Média', 
              angle: -90,
              position: 'insideLeft',
              style: { textAnchor: 'middle', fontSize: 12, fontWeight: 500, fill: '#374151' }
            }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(48, 227, 202, 0.1)' }} />
          <Bar 
            dataKey="pontuacao" 
            radius={[4, 4, 0, 0]}
            maxBarSize={60}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.pontuacao)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
