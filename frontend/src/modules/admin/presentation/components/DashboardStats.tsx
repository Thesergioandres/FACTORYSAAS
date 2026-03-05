import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend);

type UsageMetric = {
  label: string;
  value: number;
};

type DashboardStatsProps = {
  salesTrend: number[];
  usageMetrics: UsageMetric[];
};

const fallbackSales = [0, 0, 0, 0, 0, 0, 0];

export function DashboardStats({ salesTrend, usageMetrics }: DashboardStatsProps) {
  const salesData = salesTrend.length ? salesTrend.slice(0, 7) : fallbackSales;
  const salesLabels = salesData.map((_value, index) => `D${index + 1}`);

  const salesChart = {
    labels: salesLabels,
    datasets: [
      {
        label: 'Ventas de la Semana',
        data: salesData,
        borderColor: 'var(--primary)',
        backgroundColor: 'rgba(0, 240, 255, 0.25)',
        pointRadius: 3,
        tension: 0.35
      }
    ]
  };

  const usageChart = {
    labels: usageMetrics.map((metric) => metric.label),
    datasets: [
      {
        label: 'Métricas de Uso',
        data: usageMetrics.map((metric) => metric.value),
        backgroundColor: 'rgba(138, 43, 226, 0.55)',
        borderColor: 'var(--secondary)',
        borderWidth: 1
      }
    ]
  };

  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#dbe3ff'
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#9fb0d1' },
        grid: { color: 'rgba(148, 163, 184, 0.1)' }
      },
      y: {
        ticks: { color: '#9fb0d1' },
        grid: { color: 'rgba(148, 163, 184, 0.1)' }
      }
    }
  } as const;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="app-card">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Ventas de la Semana</h3>
            <p className="text-sm text-muted">Tendencia de los ultimos 7 dias.</p>
          </div>
        </div>
        <div className="mt-4 h-64">
          <Line data={salesChart} options={baseOptions} />
        </div>
      </div>

      <div className="app-card">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Métricas de Uso</h3>
            <p className="text-sm text-muted">Actividad operativa del dia.</p>
          </div>
        </div>
        <div className="mt-4 h-64">
          <Bar data={usageChart} options={baseOptions} />
        </div>
      </div>
    </div>
  );
}
