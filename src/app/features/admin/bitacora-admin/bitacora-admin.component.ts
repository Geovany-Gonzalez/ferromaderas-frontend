import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  BitacoraApiService,
  BitacoraListResponse,
  BitacoraRow,
} from '../../../core/services/bitacora-api.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-bitacora-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './bitacora-admin.component.html',
  styleUrl: './bitacora-admin.component.scss',
})
export class BitacoraAdminComponent implements OnInit {
  rows: BitacoraRow[] = [];
  total = 0;
  page = 1;
  pageSize = 25;
  loading = false;

  filterModulo = '';
  filterDesde = '';
  filterHasta = '';

  detalleExpandido: Record<string, boolean> = {};

  constructor(
    private readonly bitacoraApi: BitacoraApiService,
    private readonly notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.bitacoraApi
      .list({
        page: this.page,
        pageSize: this.pageSize,
        modulo: this.filterModulo || undefined,
        desde: this.filterDesde || undefined,
        hasta: this.filterHasta || undefined,
      })
      .subscribe({
        next: (res: BitacoraListResponse) => {
          this.rows = res.items;
          this.total = res.total;
          this.page = res.page;
          this.pageSize = res.pageSize;
          this.loading = false;
        },
        error: (err: { status?: number }) => {
          this.loading = false;
          if (err?.status === 403) {
            this.notification.showMessage(
              'No tenés permiso para ver la bitácora. Pedí el permiso «Ver bitácora» al administrador.',
              'error'
            );
          } else {
            this.notification.showMessage('No se pudo cargar la bitácora.', 'error');
          }
        },
      });
  }

  aplicarFiltros(): void {
    this.page = 1;
    this.load();
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
      this.load();
    }
  }

  nextPage(): void {
    if (this.page * this.pageSize < this.total) {
      this.page++;
      this.load();
    }
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  toggleDetalle(id: string): void {
    this.detalleExpandido[id] = !this.detalleExpandido[id];
  }

  detallesJson(d: Record<string, unknown> | null): string {
    if (!d || Object.keys(d).length === 0) return '—';
    try {
      return JSON.stringify(d, null, 2);
    } catch {
      return '—';
    }
  }

  formatFecha(iso: string): string {
    try {
      const d = new Date(iso);
      return d.toLocaleString('es-GT', {
        dateStyle: 'short',
        timeStyle: 'medium',
      });
    } catch {
      return iso;
    }
  }
}
