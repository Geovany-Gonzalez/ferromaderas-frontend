import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Quotation } from '../models/quotation.model';
import { QuotesApiService, Quote } from './quotes-api.service';

/**
 * Servicio de cotizaciones del panel administrativo.
 * Consume el API real (`/api/quotes`) y adapta la respuesta al modelo Quotation
 * que utiliza la vista.
 */
@Injectable({ providedIn: 'root' })
export class QuotationsService {
  private readonly api = inject(QuotesApiService);

  private toQuotation(q: Quote): Quotation {
    return {
      id: q.id,
      codigo: q.codigo,
      fechaHora: this.formatFecha(q.createdAt),
      cliente: q.clienteNombre?.trim() || '—',
      telefono: q.clienteTelefono ?? '',
      total: q.total,
      direccion: q.clienteDireccion ?? '',
      estado: q.estado,
      vendedorId: q.vendedorId,
      vendedorNombre: q.vendedorNombre,
    };
  }

  private formatFecha(iso: string): string {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
  }

  getAll(): Observable<Quotation[]> {
    return this.api.list().pipe(map((list) => list.map((q) => this.toQuotation(q))));
  }

  getById(id: string): Observable<Quotation> {
    return this.api.getById(id).pipe(map((q) => this.toQuotation(q)));
  }

  updateStatus(id: string, estado: Quotation['estado']): Observable<Quotation> {
    return this.api.updateStatus(id, estado).pipe(map((q) => this.toQuotation(q)));
  }

  assignVendedor(id: string, vendedorId: string, vendedorNombre: string): Observable<Quotation> {
    return this.api
      .assignVendedor(id, vendedorId, vendedorNombre)
      .pipe(map((q) => this.toQuotation(q)));
  }

  unassignVendedor(id: string): Observable<Quotation> {
    return this.api.assignVendedor(id, null, null).pipe(map((q) => this.toQuotation(q)));
  }
}
