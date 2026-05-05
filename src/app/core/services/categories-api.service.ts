import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoriesApiService {
  private readonly api = `${environment.apiUrl}/categories`;

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Category[]> {
    return this.http.get<unknown>(this.api).pipe(
      map((raw) => {
        const list = Array.isArray(raw) ? raw : [];
        return list.map((c) =>
          this.mapToCategory(c as Record<string, unknown>)
        );
      })
    );
  }

  getById(id: string): Observable<Category | null> {
    return this.http
      .get<Record<string, unknown>>(`${this.api}/by-id/${id}`)
      .pipe(
        map((c) => this.mapToCategory(c)),
        catchError(() => of(null))
      );
  }

  getBySlug(slug: string): Observable<Category | null> {
    return this.http
      .get<Record<string, unknown>>(`${this.api}/slug/${slug}`)
      .pipe(
        map((c) => this.mapToCategory(c)),
        catchError(() => of(null))
      );
  }

  create(data: {
    name: string;
    slug: string;
    imageUrl?: string;
    description?: string;
    active?: boolean;
  }): Observable<Category> {
    return this.http
      .post<Record<string, unknown>>(this.api, data)
      .pipe(map((c) => this.mapToCategory(c)));
  }

  update(
    id: string,
    data: {
      name?: string;
      slug?: string;
      imageUrl?: string | null;
      description?: string | null;
      active?: boolean;
    }
  ): Observable<Category | null> {
    return this.http
      .put<Record<string, unknown>>(`${this.api}/${id}`, data)
      .pipe(
        map((c) => this.mapToCategory(c)),
        catchError(() => of(null))
      );
  }

  delete(id: string): Observable<boolean> {
    return this.http.delete(`${this.api}/${id}`).pipe(map(() => true));
  }

  private mapToCategory(c: Record<string, unknown>): Category {
    return {
      id: String(c['id'] ?? ''),
      name: String(c['name'] ?? ''),
      slug: String(c['slug'] ?? ''),
      imageUrl: String(c['imageUrl'] ?? ''),
      description: (c['description'] as string) || undefined,
      active: c['active'] !== false,
    };
  }
}
