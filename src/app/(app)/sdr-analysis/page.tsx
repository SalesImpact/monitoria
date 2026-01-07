'use client';

import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SDRAnalysisContent from '@/components/sdr-analysis-content';
import CriteriaAnalysisContent from '@/components/criteria-analysis-content';
import ObjectionsAnalysisContent from '@/components/objections-analysis-content';

export default function SDRAnalysisPage() {
  const [sdrData, setSdrData] = useState<any>(null);
  const [criteriaData, setCriteriaData] = useState<any>(null);
  const [objectionsData, setObjectionsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'por-sdr' | 'por-criterio' | 'por-objecoes'>('por-sdr');

  useEffect(() => {
    async function fetchAllData() {
      try {
        // Buscar dados de SDR
        const sdrResponse = await fetch('/api/sdr-data');
        const sdr = await sdrResponse.json();
        setSdrData(sdr);

        // Buscar dados de critérios
        const criteriaResponse = await fetch('/api/criteria-data');
        const criteria = await criteriaResponse.json();
        setCriteriaData(criteria);

        // Buscar dados de objeções
        const objectionsResponse = await fetch('/api/objections-data');
        const objections = await objectionsResponse.json();
        setObjectionsData(objections);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchAllData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-gray-500">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center mb-2">
          <Users className="w-8 h-8 text-gray-400 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Análise por SDR</h1>
        </div>
        <p className="text-gray-600">
          Visualize performance, critérios e objeções
        </p>
      </div>

      {/* Tabs */}
      <div className="space-y-6">
        <div className="flex border-b border-gray-200">
          <Button
            variant="ghost"
            className={`rounded-none border-b-2 ${
              activeTab === 'por-sdr'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('por-sdr')}
          >
            Por SDR
          </Button>
          <Button
            variant="ghost"
            className={`rounded-none border-b-2 ${
              activeTab === 'por-criterio'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('por-criterio')}
          >
            Por Critério
          </Button>
          <Button
            variant="ghost"
            className={`rounded-none border-b-2 ${
              activeTab === 'por-objecoes'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('por-objecoes')}
          >
            Por Objeções
          </Button>
        </div>

        {/* Tab: Por SDR */}
        {activeTab === 'por-sdr' && sdrData && <SDRAnalysisContent sdrs={sdrData.sdrs} />}

        {/* Tab: Por Critério */}
        {activeTab === 'por-criterio' && criteriaData && <CriteriaAnalysisContent calls={criteriaData.calls} sdrs={criteriaData.sdrs} />}

        {/* Tab: Por Objeções */}
        {activeTab === 'por-objecoes' && objectionsData && <ObjectionsAnalysisContent data={objectionsData} />}
      </div>
    </div>
  );
}
