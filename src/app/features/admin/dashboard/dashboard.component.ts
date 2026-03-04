import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

import { StatisticsService } from '../../../core/services/statistics.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  /** Estadísticas del sitio web */
  visitasTotales = 0;
  vistasPagina = 0;
  paginasSesion = 0;
  rebotePorcentaje = 0;

  /** Páginas más visitadas */
  paginasMasVisitadas: { pagina: string; vistas: number }[] = [];

  loading = true;
  error: string | null = null;

  /** Gráfico: Visitas por día (última semana) */
  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Visitas',
        backgroundColor: '#1e3a8a',
        borderColor: '#1e40af',
        borderWidth: 1,
      },
    ],
  };

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Visitas por día (última semana)',
        font: { size: 14 },
      },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  /** Gráfico: Dispositivos */
  public doughnutChartType: ChartType = 'doughnut';
  public doughnutChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: ['#1e3a8a', '#3b82f6', '#93c5fd'],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  public doughnutChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'right',
        labels: { usePointStyle: true, padding: 15 },
      },
      title: {
        display: true,
        text: 'Dispositivos de acceso',
        font: { size: 12 },
      },
    },
  };

  /** Gráfico: Tráfico por mes */
  public lineChartType: ChartType = 'line';
  public lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Visitas',
        borderColor: '#1e3a8a',
        backgroundColor: 'rgba(30, 58, 138, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Tráfico mensual',
        font: { size: 14 },
      },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  constructor(private readonly statistics: StatisticsService) {}

  ngOnInit(): void {
    this.statistics.getDashboard().subscribe({
      next: (data) => this.applyDashboardData(data),
      error: (err) => {
        this.error = 'No se pudieron cargar las estadísticas.';
        this.loading = false;
        console.error('Dashboard stats error:', err);
      },
    });
  }

  private applyDashboardData(data: {
    visitasTotales: number;
    vistasPagina: number;
    paginasSesion: number;
    rebotePorcentaje: number;
    paginasMasVisitadas: { pagina: string; vistas: number }[];
    visitasPorDia: { date: string; visits: number }[];
    dispositivos: { device: string; percentage: number }[];
    traficoMensual: { month: string; visits: number }[];
  }): void {
    this.visitasTotales = data.visitasTotales;
    this.vistasPagina = data.vistasPagina;
    this.paginasSesion = data.paginasSesion;
    this.rebotePorcentaje = data.rebotePorcentaje;
    this.paginasMasVisitadas = data.paginasMasVisitadas;

    this.barChartData = {
      ...this.barChartData,
      labels: data.visitasPorDia.map((d) =>
        /^\d{8}$/.test(d.date)
          ? this.formatDateLabel(d.date)
          : d.date,
      ),
      datasets: [
        {
          ...this.barChartData.datasets[0],
          data: data.visitasPorDia.map((d) => d.visits),
        },
      ],
    };

    this.doughnutChartData = {
      ...this.doughnutChartData,
      labels: data.dispositivos.map((d) => d.device),
      datasets: [
        {
          ...this.doughnutChartData.datasets[0],
          data: data.dispositivos.map((d) => d.percentage),
        },
      ],
    };

    this.lineChartData = {
      ...this.lineChartData,
      labels: data.traficoMensual.map((d) => d.month),
      datasets: [
        {
          ...this.lineChartData.datasets[0],
          data: data.traficoMensual.map((d) => d.visits),
        },
      ],
    };

    this.loading = false;
  }

  private formatDateLabel(yyyymmdd: string): string {
    const y = parseInt(yyyymmdd.slice(0, 4), 10);
    const m = parseInt(yyyymmdd.slice(4, 6), 10) - 1;
    const d = parseInt(yyyymmdd.slice(6, 8), 10);
    const date = new Date(y, m, d);
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return `${days[date.getDay()]} ${d}`;
  }
}
