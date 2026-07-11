import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { QuotationStatus } from '../models/quotation.model';

export interface QuoteItemInput {
  productoId?: string;
  codigo: string;
  nombre: string;
  precioUnitario: number;
  cantidad: number;
}

export interface CreateQuoteInput {
  clienteNombre?: string;
  clienteTelefono?: string;
  clienteDireccion?: string;
  clienteNota?: string;
  items: QuoteItemInput[];
}

export interface QuoteItem {
  id: string;
  productoId?: string;
  codigo: string;
  nombre: string;
  precioUnitario: number;
  cantidad: number;
  subtotal: number;
}

export interface Quote {
  id: string;
  codigo: string;
  estado: QuotationStatus;
  clienteNombre?: string;
  clienteTelefono?: string;
  clienteDireccion?: string;
  clienteNota?: string;
  total: number;
  vendedorId?: string;
  vendedorNombre?: string;
  createdAt: string;
  updatedAt: string;
  items?: QuoteItem[];
}

@Injectable({ providedIn: 'root' })
export class QuotesApiService {
  private readonly api = `${environment.apiUrl}/quotes`;

  constructor(private readonly http: HttpClient) {}

  /** Público: crea la cotización desde el carrito. */
  create(input: CreateQuoteInput): Observable<Quote> {
    return this.http.post<Quote>(this.api, input);
  }

  /** Público: obtiene una cotización por su código (enlace compartible). */
  getByCodigo(codigo: string): Observable<Quote> {
    return this.http.get<Quote>(`${this.api}/public/${encodeURIComponent(codigo)}`);
  }

  /** Admin: listado completo para el panel. */
  list(): Observable<Quote[]> {
    return this.http.get<Quote[]>(this.api);
  }

  /** Admin: detalle con items. */
  getById(id: string): Observable<Quote> {
    return this.http.get<Quote>(`${this.api}/${id}`);
  }

  /** Admin: cambia el estado de seguimiento. */
  updateStatus(id: string, estado: QuotationStatus): Observable<Quote> {
    return this.http.patch<Quote>(`${this.api}/${id}/status`, { estado });
  }

  /** Admin: asigna (o quita, con null) el vendedor responsable. */
  assignVendedor(
    id: string,
    vendedorId: string | null,
    vendedorNombre: string | null,
  ): Observable<Quote> {
    return this.http.patch<Quote>(`${this.api}/${id}/vendedor`, {
      vendedorId,
      vendedorNombre,
    });
  }
}
