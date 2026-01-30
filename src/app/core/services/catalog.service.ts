import { Injectable } from '@angular/core';
import { Category } from '../models/category.model';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly categories: Category[] = [
    { id: 'cat1', name: 'PVC', imageUrl: 'https://placehold.co/120x120' },
    { id: 'cat2', name: 'Cemento', imageUrl: 'https://placehold.co/120x120' },
    { id: 'cat3', name: 'Pintura', imageUrl: 'https://placehold.co/120x120' },
  ];

  private readonly products: Product[] = [
    { id: 'p1', code: '001', name: 'Cemento Stark 4200 psi', price: 68, imageUrl: 'https://placehold.co/240x180', featured: true },
    { id: 'p2', code: '002', name: 'Cal hidratada Horcalsa', price: 40, imageUrl: 'https://placehold.co/240x180', featured: true },
    { id: 'p3', code: '003', name: 'Lámina acanalada c28 12 pies', price: 100, imageUrl: 'https://placehold.co/240x180', featured: true },
    { id: 'p4', code: '004', name: 'Monocapa mixto listón blanco', price: 75, imageUrl: 'https://placehold.co/240x180', featured: true },
    { id: 'p5', code: '005', name: 'Quintal hierro 3/8 comercial', price: 385, imageUrl: 'https://placehold.co/240x180', featured: true },
    { id: 'p6', code: '006', name: 'Tabla de 1x2x12', price: 105, imageUrl: 'https://placehold.co/240x180', featured: true },
  ];

  getCategories(): Category[] {
    return this.categories;
  }

  getFeaturedProducts(limit = 6): Product[] {
    return this.products.filter(p => p.featured).slice(0, limit);
  }
}
