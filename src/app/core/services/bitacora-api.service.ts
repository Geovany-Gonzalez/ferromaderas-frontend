import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface BitacoraRow {
  id: string;
  fecha: string;
  modulo: string;
  accion: string;
  usuarioId: string | null;
  usuarioNombre?: string | null;
  detalles: Record<string, unknown> | null;
  ip: string | null;
}

export interface BitacoraListResponse {
  items: BitacoraRow[];
  total: number;
  page: number;
  pageSize: number;
}

export interface BitacoraListParams {
  page?: number;
  pageSize?: number;
  modulo?: string;
  modulos?: string[];
  desde?: string;
  hasta?: string;
}

@Injectable({ providedIn: 'root' })
export class BitacoraApiService {
  private readonly api = `${environment.apiUrl}/bitacora`;

  constructor(private readonly http: HttpClient) {}

  list(params: BitacoraListParams = {}): Observable<BitacoraListResponse> {
    let hp = new HttpParams();
    if (params.page != null) hp = hp.set('page', String(params.page));
    if (params.pageSize != null) hp = hp.set('pageSize', String(params.pageSize));
    if (params.modulo?.trim()) hp = hp.set('modulo', params.modulo.trim());
    if (params.modulos?.length) hp = hp.set('modulos', params.modulos.join(','));
    if (params.desde) hp = hp.set('desde', params.desde);
    if (params.hasta) hp = hp.set('hasta', params.hasta);
    return this.http.get<BitacoraListResponse>(this.api, { params: hp });
  }
}
