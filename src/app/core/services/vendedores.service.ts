import { Injectable } from '@angular/core';

export interface Vendedor {
  id: string;
  nombre: string;
  username?: string;
}

/** Lista de vendedores para asignar a cotizaciones. Sincronizar con usuarios con rol vendedor cuando exista backend. */
const VENDEDORES_KEY = 'ferromaderas_vendedores';

@Injectable({ providedIn: 'root' })
export class VendedoresService {
  private vendedores: Vendedor[] = [];

  constructor() {
    this.load();
    if (this.vendedores.length === 0) {
      this.vendedores = this.getDefaultVendedores();
      this.save();
    }
  }

  private load(): void {
    const raw = localStorage.getItem(VENDEDORES_KEY);
    if (raw) {
      try {
        this.vendedores = JSON.parse(raw);
      } catch {
        this.vendedores = [];
      }
    }
  }

  private save(): void {
    localStorage.setItem(VENDEDORES_KEY, JSON.stringify(this.vendedores));
  }

  private getDefaultVendedores(): Vendedor[] {
    return [
      { id: '1', nombre: 'Juan Perez', username: 'juan1' },
      { id: '2', nombre: 'Pedro Catalan', username: 'pedro1' },
      { id: '3', nombre: 'María López', username: 'maria1' },
    ];
  }

  getAll(): Vendedor[] {
    return [...this.vendedores];
  }

  getById(id: string): Vendedor | undefined {
    return this.vendedores.find((v) => v.id === id);
  }
}
