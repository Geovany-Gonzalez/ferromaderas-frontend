import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export type SecurityControlEstado = 'activo' | 'pendiente' | 'desarrollo';

export interface SecurityControl {
  id: string;
  titulo: string;
  descripcion: string;
  estado: SecurityControlEstado;
  detalle: string;
}

export interface SecurityMatrixRole {
  slug: string;
  name: string;
  permissions: string[];
}

export interface SecurityMatrixPermission {
  slug: string;
  name: string;
}

export interface SecurityOverview {
  sesion: {
    usuario: string;
    rol: string;
    permisos: string[];
    permisosCount: number;
  };
  matriz: {
    permissions: SecurityMatrixPermission[];
    roles: SecurityMatrixRole[];
  };
  controles: SecurityControl[];
  rutasProtegidas: Array<{
    ruta: string;
    guard: string;
    permiso: string;
  }>;
  generadoEn: string;
}

@Injectable({ providedIn: 'root' })
export class SecurityService {
  private readonly api = `${environment.apiUrl}/auth`;

  constructor(private readonly http: HttpClient) {}

  getOverview(): Observable<SecurityOverview | null> {
    return this.http
      .get<SecurityOverview>(`${this.api}/security-overview`)
      .pipe(catchError(() => of(null)));
  }
}
