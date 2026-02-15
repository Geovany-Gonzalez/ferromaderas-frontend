import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { QuotationsService } from '../../../core/services/quotations.service';
import { VendedoresService, Vendedor } from '../../../core/services/vendedores.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Quotation, QuotationStatus } from '../../../core/models/quotation.model';

@Component({
  selector: 'app-quotations-admin',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './quotations-admin.component.html',
  styleUrl: './quotations-admin.component.scss',
})
export class QuotationsAdminComponent implements OnInit {
  quotations: Quotation[] = [];
  vendedores: Vendedor[] = [];
  searchId = '';
  filterEstado: QuotationStatus | '' = '';
  fechaDesde = '';
  fechaHasta = '';
  filterVendedor = '';

  /** Modal ver detalle */
  viewModalQuotation: Quotation | null = null;

  /** Vendedor seleccionado para asignar (en modal o tabla) */
  assignVendedorId: string = '';

  statusOptions: { value: QuotationStatus | ''; label: string }[] = [
    { value: '', label: 'Estado' },
    { value: 'nueva', label: 'Nueva' },
    { value: 'en_seguimiento', label: 'En seguimiento' },
    { value: 'confirmada', label: 'Confirmada' },
    { value: 'cerrada', label: 'Cerrada' },
    { value: 'cancelada', label: 'Cancelada' },
  ];

  constructor(
    private quotationsService: QuotationsService,
    private vendedoresService: VendedoresService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.quotations = this.quotationsService.getAll();
    this.vendedores = this.vendedoresService.getAll();
  }

  get filteredQuotations(): Quotation[] {
    return this.quotations.filter((q) => {
      const matchId = !this.searchId || q.id.toLowerCase().includes(this.searchId.toLowerCase());
      const matchEstado = !this.filterEstado || q.estado === this.filterEstado;
      const matchVendedor = !this.filterVendedor || (q.vendedorId === this.filterVendedor);
      let matchFecha = true;
      if (this.fechaDesde || this.fechaHasta) {
        const d = this.parseFecha(q.fechaHora);
        if (this.fechaDesde && d < this.parseFecha(this.fechaDesde)) matchFecha = false;
        if (this.fechaHasta && d > this.parseFecha(this.fechaHasta)) matchFecha = false;
      }
      return matchId && matchEstado && matchVendedor && matchFecha;
    });
  }

  assignVendedor(q: Quotation, vendedorId: string): void {
    if (!vendedorId) return;
    const v = this.vendedores.find((x) => x.id === vendedorId);
    if (!v) return;
    this.quotationsService.assignVendedor(q.id, v.id, v.nombre);
    this.quotations = this.quotationsService.getAll();
    this.viewModalQuotation = this.quotations.find((x) => x.id === q.id) ?? null;
    this.notification.showMessage(`Vendedor ${v.nombre} asignado a cotización ${q.id}.`, 'success');
  }

  unassignVendedor(q: Quotation): void {
    this.quotationsService.unassignVendedor(q.id);
    this.quotations = this.quotationsService.getAll();
    this.viewModalQuotation = this.quotations.find((x) => x.id === q.id) ?? null;
    this.notification.showMessage(`Vendedor desasignado de cotización ${q.id}.`, 'success');
  }

  onAssignInModal(): void {
    if (!this.viewModalQuotation || !this.assignVendedorId) return;
    this.assignVendedor(this.viewModalQuotation, this.assignVendedorId);
    this.assignVendedorId = '';
  }

  /** Acepta DD/MM/YYYY o YYYY-MM-DD (del input type="date"). */
  private parseFecha(s: string): number {
    if (!s?.trim()) return 0;
    const sep = s.includes('-') ? '-' : '/';
    const parts = s.split(sep).map(Number);
    if (parts.length < 3) return 0;
    const [a, b, c] = parts;
    const isIso = sep === '-'; // YYYY-MM-DD
    const y = isIso ? a : c;
    const m = isIso ? b : b;
    const d = isIso ? c : a;
    return new Date(y, m - 1, d).getTime();
  }

  statusLabel(estado: QuotationStatus): string {
    const map: Record<QuotationStatus, string> = {
      nueva: 'Nueva',
      en_seguimiento: 'En seguimiento',
      confirmada: 'Confirmada',
      cerrada: 'Cerrada',
      cancelada: 'Cancelada',
    };
    return map[estado] ?? estado;
  }

  viewQuotation(q: Quotation): void {
    this.viewModalQuotation = q;
    this.assignVendedorId = q.vendedorId ?? '';
  }

  closeViewModal(): void {
    this.viewModalQuotation = null;
  }

  changeStatus(q: Quotation): void {
    const next = this.getNextStatus(q.estado);
    if (!next) return;
    this.quotationsService.updateStatus(q.id, next);
    this.quotations = this.quotationsService.getAll();
    this.notification.showMessage(`Cotización ${q.id} actualizada a ${this.statusLabel(next)}.`, 'success');
  }

  canChangeStatus(q: Quotation): boolean {
    return this.getNextStatus(q.estado) !== null;
  }

  private getNextStatus(estado: QuotationStatus): QuotationStatus | null {
    const flow: QuotationStatus[] = ['nueva', 'en_seguimiento', 'confirmada', 'cerrada'];
    const idx = flow.indexOf(estado);
    if (idx >= 0 && idx < flow.length - 1) return flow[idx + 1];
    if (estado === 'cancelada') return 'nueva';
    return null;
  }

  trackById(_i: number, q: Quotation): string {
    return q.id;
  }
}
