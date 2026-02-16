import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  /** Estadísticas del sitio web */
  visitasTotales = 12480;
  vistasPagina = 38420;
  paginasSesion = 3.1;
  rebotePorcentaje = 42;

  /** Páginas más visitadas */
  paginasMasVisitadas: { pagina: string; vistas: number }[] = [
    { pagina: 'Inicio', vistas: 8520 },
    { pagina: 'Categorías', vistas: 6120 },
    { pagina: 'Carrito', vistas: 3240 },
    { pagina: 'Ubicación', vistas: 2180 },
    { pagina: 'Políticas', vistas: 960 },
  ];

  /** Gráfico: Visitas por día (última semana) */
  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar'> = {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    datasets: [
      {
        data: [1420, 1680, 1520, 1890, 2100, 1840, 2030],
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
    labels: ['Móvil', 'Escritorio', 'Tablet'],
    datasets: [
      {
        data: [58, 35, 7],
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
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    datasets: [
      {
        data: [2800, 3200, 4100, 3800, 4500, 5200, 4800, 5100, 5900, 6200, 5800, 6700],
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

  ngOnInit(): void {
    // Conectar con analytics real cuando exista backend
  }
}
