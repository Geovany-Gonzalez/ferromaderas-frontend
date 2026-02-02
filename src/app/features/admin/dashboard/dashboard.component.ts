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
  // Estadísticas principales
  totalVentas: string = '2.089.201';
  totalProductos: string = '104.475';

  // Configuración del gráfico de barras (Ventas por categoría)
  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar'> = {
    labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
    datasets: [
      {
        data: [380, 420, 390, 410, 380, 400],
        label: 'Entradas',
        backgroundColor: '#4ade80',
        borderColor: '#22c55e',
        borderWidth: 1,
      },
      {
        data: [280, 320, 290, 310, 280, 300],
        label: 'Canceladas',
        backgroundColor: '#f87171',
        borderColor: '#ef4444',
        borderWidth: 1,
      },
    ],
  };

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 500,
        ticks: {
          stepSize: 100,
        },
      },
    },
  };

  // Configuración del gráfico de líneas (Ventas del año)
  public lineChartType: ChartType = 'line';
  public lineChartData: ChartData<'line'> = {
    labels: [
      '1 ene 2022',
      '1 mar 2022',
      '1 may 2022',
      '1 jul 2022',
      '1 sep 2022',
      '1 nov 2022',
      '1 ene 2023',
      '1 mar 2023',
      '1 may 2023',
      '1 jul 2023',
      '1 sep 2023',
      '1 nov 2023',
    ],
    datasets: [
      {
        data: [120, 150, 180, 200, 190, 170, 160, 180, 220, 210, 190, 170],
        label: 'Ventas del año',
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Ventas del año',
        font: {
          size: 14,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 250,
        ticks: {
          stepSize: 50,
        },
      },
    },
  };

  // Configuración del gráfico de dona (Productos más vendidos)
  public doughnutChartType: ChartType = 'doughnut';
  public doughnutChartData: ChartData<'doughnut'> = {
    labels: ['Madera', 'Metal', 'Plástico', 'Otros'],
    datasets: [
      {
        data: [74.5, 15.2, 6.8, 3.5],
        backgroundColor: ['#f97316', '#06b6d4', '#8b5cf6', '#eab308'],
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
        labels: {
          usePointStyle: true,
          padding: 15,
        },
      },
      title: {
        display: true,
        text: 'Desde qué dispositivos ingresan los usuarios',
        font: {
          size: 12,
        },
      },
    },
  };

  ngOnInit(): void {
    // Aquí se pueden cargar datos desde un servicio
  }
}
