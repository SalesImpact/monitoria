declare module 'react-chartjs-2' {
  import type { ComponentType, ReactNode, CanvasHTMLAttributes } from 'react';
  import type { ChartData, ChartOptions, DefaultDataPoint, ChartType } from 'chart.js';

  export interface ChartProps<TType extends ChartType = ChartType, TData = DefaultDataPoint<TType>, TLabel = unknown> 
    extends CanvasHTMLAttributes<HTMLCanvasElement> {
    type: TType;
    data: ChartData<TType, TData, TLabel>;
    options?: ChartOptions<TType>;
    plugins?: any[];
    redraw?: boolean;
    datasetIdKey?: string;
    fallbackContent?: ReactNode;
    updateMode?: any;
  }

  export type TypedChartComponent<TDefaultType extends ChartType> = ComponentType<
    Omit<ChartProps<TDefaultType>, 'type'>
  >;

  export const Line: TypedChartComponent<'line'>;
  export const Bar: TypedChartComponent<'bar'>;
  export const Radar: TypedChartComponent<'radar'>;
  export const Doughnut: TypedChartComponent<'doughnut'>;
  export const PolarArea: TypedChartComponent<'polarArea'>;
  export const Bubble: TypedChartComponent<'bubble'>;
  export const Pie: TypedChartComponent<'pie'>;
  export const Scatter: TypedChartComponent<'scatter'>;
  export const Chart: ComponentType<ChartProps>;
  
  export function getDatasetAtEvent(chart: any, event: any): any[];
  export function getElementAtEvent(chart: any, event: any): any[];
  export function getElementsAtEvent(chart: any, event: any): any[];
}

