import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product } from '../models/product.model';

export interface BulkImportResult {
  created: number;
  updated: number;
  deleted: number;
  errors: string[];
}

@Injectable({ providedIn: 'root' })
export class ProductsApiService {
  private readonly api = `${environment.apiUrl}/products`;

  constructor(private readonly http: HttpClient) {}

  /** Catálogo público (solo activos) */
  getCatalog(): Observable<Product[]> {
    return this.http
      .get<Record<string, unknown>[]>(`${this.api}/catalog`)
      .pipe(map((list) => list.map((p) => this.mapToProduct(p))));
  }

  /** Admin: todos los productos */
  getAll(): Observable<Product[]> {
    return this.http
      .get<Record<string, unknown>[]>(this.api)
      .pipe(map((list) => list.map((p) => this.mapToProduct(p))));
  }

  getById(id: string): Observable<Product | null> {
    return this.http
      .get<Record<string, unknown>>(`${this.api}/${id}`)
      .pipe(
        map((p) => this.mapToProduct(p)),
        catchError(() => of(null))
      );
  }

  create(data: Omit<Product, 'id'>): Observable<Product> {
    return this.http
      .post<Record<string, unknown>>(this.api, this.toApi(data))
      .pipe(map((p) => this.mapToProduct(p)));
  }

  update(id: string, data: Partial<Product>): Observable<Product> {
    return this.http
      .put<Record<string, unknown>>(`${this.api}/${id}`, this.toApi(data))
      .pipe(map((p) => this.mapToProduct(p)));
  }

  setActive(id: string, active: boolean): Observable<Product> {
    return this.http
      .patch<Record<string, unknown>>(`${this.api}/${id}/active`, { active })
      .pipe(map((p) => this.mapToProduct(p)));
  }

  bulkImport(
    items: { code: string; name: string; stock?: number }[],
    sync: boolean
  ): Observable<BulkImportResult> {
    return this.http.post<BulkImportResult>(`${this.api}/bulk`, {
      items,
      sync,
    });
  }

  private mapToProduct(p: Record<string, unknown>): Product {
    return {
      id: String(p['id'] ?? ''),
      code: String(p['code'] ?? ''),
      name: String(p['name'] ?? ''),
      price: Number(p['price'] ?? 0),
      imageUrl: String(p['imageUrl'] ?? ''),
      categoryId: (p['categoryId'] as string) || '',
      featured: Boolean(p['featured']),
      active: p['active'] !== false,
      pendingConfig: Boolean(p['pendingConfig']),
      stock: Number(p['stock'] ?? 0),
    };
  }

  private toApi(p: Partial<Product>): Record<string, unknown> {
    return {
      code: p.code,
      name: p.name,
      price: p.price ?? 0,
      imageUrl: p.imageUrl,
      categoryId: p.categoryId || null,
      active: p.active,
      featured: p.featured,
      pendingConfig: p.pendingConfig,
      stock: p.stock ?? 0,
    };
  }
}
