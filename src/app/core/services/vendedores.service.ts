import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Vendedor {
  id: string;
  nombre: string;
}

/**
 * Vendedores para asignar a cotizaciones. Se obtienen del backend: usuarios
 * activos con rol `vendedor`. Así la asignación siempre apunta a un usuario
 * real del sistema (no a datos ficticios locales).
 */
@Injectable({ providedIn: 'root' })
export class VendedoresService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/users/vendedores`;

  getAll(): Observable<Vendedor[]> {
    return this.http.get<Vendedor[]>(this.api);
  }
}
