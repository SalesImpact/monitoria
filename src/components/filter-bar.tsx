
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, FilterX } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

type SDRType = {
  id: string;
  name: string;
  email: string;
  status?: string;
  hireDate?: Date;
};

interface FilterBarProps {
  sdrs: SDRType[];
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  sdrId: string;
  result: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  minScore: string;
}

export default function FilterBar({ sdrs, onFilterChange }: FilterBarProps) {
  const [filters, setFilters] = useState<FilterState>({
    sdrId: 'all',
    result: 'all',
    dateFrom: undefined,
    dateTo: undefined,
    minScore: 'all',
  });

  const updateFilter = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const defaultFilters: FilterState = {
      sdrId: 'all',
      result: 'all',
      dateFrom: undefined,
      dateTo: undefined,
      minScore: 'all',
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-brand-dark">Filtros</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-gray-600 hover:text-brand-dark"
        >
          <FilterX className="w-4 h-4 mr-2" />
          Limpar Filtros
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* SDR Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">SDR</label>
          <Select
            value={filters.sdrId}
            onValueChange={(value) => updateFilter('sdrId', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos os SDRs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os SDRs</SelectItem>
              {sdrs.map((sdr) => (
                <SelectItem key={sdr.id} value={sdr.id}>
                  {sdr.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Result Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Resultado</label>
          <Select
            value={filters.result}
            onValueChange={(value) => updateFilter('result', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos os resultados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="agendado">Agendado</SelectItem>
              <SelectItem value="qualificação_sucesso">Qualificação Sucesso</SelectItem>
              <SelectItem value="não_qualificado">Não Qualificado</SelectItem>
              <SelectItem value="follow_up">Follow-up</SelectItem>
              <SelectItem value="não_atendeu">Não Atendeu</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date From */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Data Inicial</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !filters.dateFrom && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateFrom ? (
                  format(filters.dateFrom, 'dd/MM/yyyy', { locale: ptBR })
                ) : (
                  <span>Selecione</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={filters.dateFrom}
                onSelect={(date) => updateFilter('dateFrom', date)}
                initialFocus
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Date To */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Data Final</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !filters.dateTo && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateTo ? (
                  format(filters.dateTo, 'dd/MM/yyyy', { locale: ptBR })
                ) : (
                  <span>Selecione</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={filters.dateTo}
                onSelect={(date) => updateFilter('dateTo', date)}
                initialFocus
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Score Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Pontuação Mínima</label>
          <Select
            value={filters.minScore}
            onValueChange={(value) => updateFilter('minScore', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="4">4.0+</SelectItem>
              <SelectItem value="3">3.0+</SelectItem>
              <SelectItem value="2">2.0+</SelectItem>
              <SelectItem value="1">1.0+</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
