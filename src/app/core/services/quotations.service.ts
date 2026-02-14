import { Injectable } from '@angular/core';
import { Quotation } from '../models/quotation.model';

const STORAGE_KEY = 'ferromaderas_quotations';

@Injectable({ providedIn: 'root' })
export class QuotationsService {
  private quotations: Quotation[] = [];

  constructor() {
    this.load();
    if (this.quotations.length === 0) {
      this.quotations = this.getDefaultData();
      this.save();
    }
  }

  private load(): void {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        this.quotations = JSON.parse(raw);
      } catch {
        this.quotations = [];
      }
    }
  }

  private save(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.quotations));
  }

  private getDefaultData(): Quotation[] {
    return [
      { id: '001', fechaHora: '10/01/2026', cliente: 'Juan Perez', telefono: '55852563', total: 1540, direccion: 'El bosque 11-14', estado: 'nueva' },
      { id: '002', fechaHora: '02/02/2026', cliente: 'Raul Molina', telefono: '56987852', total: 150, direccion: 'San Lorenzo 10-1', estado: 'en_seguimiento' },
      { id: '003', fechaHora: '10/02/2026', cliente: 'Karla Ramos', telefono: '87569875', total: 3000, direccion: 'Cerro corado 3-20', estado: 'confirmada' },
      { id: '004', fechaHora: '20/02/2026', cliente: 'Melany Díaz', telefono: '56987852', total: 1120, direccion: 'Colonia Lupita 20-1', estado: 'cerrada' },
      { id: '005', fechaHora: '21/02/2026', cliente: 'Javier Mileni', telefono: '69854258', total: 1520, direccion: 'Llano de ánimas 20-1', estado: 'cancelada' },
    ];
  }

  getAll(): Quotation[] {
    return [...this.quotations];
  }

  getById(id: string): Quotation | undefined {
    return this.quotations.find((q) => q.id === id);
  }

  updateStatus(id: string, estado: Quotation['estado']): Quotation | null {
    const idx = this.quotations.findIndex((q) => q.id === id);
    if (idx < 0) return null;
    this.quotations[idx] = { ...this.quotations[idx], estado };
    this.save();
    return this.quotations[idx];
  }

  add(quotation: Omit<Quotation, 'id'>): Quotation {
    const next = String(this.quotations.length + 1).padStart(3, '0');
    const q: Quotation = { ...quotation, id: next };
    this.quotations.unshift(q);
    this.save();
    return q;
  }
}
