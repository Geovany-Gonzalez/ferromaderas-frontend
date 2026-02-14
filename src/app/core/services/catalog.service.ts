import { Injectable } from '@angular/core';
import { Category } from '../models/category.model';
import { Product } from '../models/product.model';

/** Máximo de productos que pueden estar en destacados. */
export const FEATURED_LIMIT = 9;

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly CATEGORIES_KEY = 'ferromaderas_categories';
  private readonly PRODUCTS_KEY = 'ferromaderas_products';
  
  private categories: Category[] = [];
  private products: Product[] = [];

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    // Cargar categorías
    const savedCategories = localStorage.getItem(this.CATEGORIES_KEY);
    if (savedCategories) {
      this.categories = JSON.parse(savedCategories);
    } else {
      // Datos iniciales
      this.categories = [
        { 
          id: 'cat1', 
          name: 'PVC', 
          slug: 'pvc',
          imageUrl: 'https://placehold.co/120x120',
          description: 'Productos de PVC para construcción',
          active: true
        },
        { 
          id: 'cat2', 
          name: 'Cemento', 
          slug: 'cemento',
          imageUrl: 'https://placehold.co/120x120',
          description: 'Cementos de alta calidad',
          active: true
        },
        { 
          id: 'cat3', 
          name: 'Pintura', 
          slug: 'pintura',
          imageUrl: 'https://placehold.co/120x120',
          description: 'Pinturas para todo tipo de superficies',
          active: true
        },
      ];
      this.saveCategories();
    }

    // Cargar productos
    const savedProducts = localStorage.getItem(this.PRODUCTS_KEY);
    if (savedProducts) {
      this.products = JSON.parse(savedProducts);
      this.products = this.products.map(p => ({ ...p, active: p.active !== false }));
    } else {
      // Datos iniciales
      this.products = [
        { id: 'p1', code: '001', name: 'Cemento UGC progreso', categoryId: 'cat2', price: 82, imageUrl: 'https://placehold.co/240x180', featured: true, active: true },
        { id: 'p2', code: '002', name: 'Cemento La Cantera', categoryId: 'cat2', price: 78, imageUrl: 'https://placehold.co/240x180', featured: true, active: true },
        { id: 'p3', code: '003', name: 'Cemento El Nacional', categoryId: 'cat2', price: 72, imageUrl: 'https://placehold.co/240x180', featured: true, active: true },
        { id: 'p4', code: '004', name: 'Cemento Magacem', categoryId: 'cat2', price: 70, imageUrl: 'https://placehold.co/240x180', featured: true, active: true },
        { id: 'p5', code: '005', name: 'Tubo PVC 1/2 pulgada', categoryId: 'cat1', price: 15, imageUrl: 'https://placehold.co/240x180', featured: false, active: true },
        { id: 'p6', code: '006', name: 'Pintura látex blanca', categoryId: 'cat3', price: 105, imageUrl: 'https://placehold.co/240x180', featured: true, active: true },
      ];
      this.saveProducts();
    }
  }

  private saveCategories(): void {
    localStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(this.categories));
  }

  private saveProducts(): void {
    localStorage.setItem(this.PRODUCTS_KEY, JSON.stringify(this.products));
  }

  // Métodos de Categorías
  getCategories(): Category[] {
    return this.categories.filter(c => c.active !== false);
  }

  getAllCategories(): Category[] {
    return this.categories;
  }

  getCategoryById(id: string): Category | undefined {
    return this.categories.find(c => c.id === id);
  }

  getCategoryBySlug(slug: string): Category | undefined {
    return this.categories.find(c => c.slug === slug);
  }

  addCategory(category: Omit<Category, 'id'>): Category {
    const newCategory: Category = {
      ...category,
      id: this.generateId('cat'),
      active: category.active ?? true
    };
    this.categories.push(newCategory);
    this.saveCategories();
    return newCategory;
  }

  updateCategory(id: string, updates: Partial<Category>): Category | null {
    const index = this.categories.findIndex(c => c.id === id);
    if (index === -1) return null;
    
    this.categories[index] = { ...this.categories[index], ...updates };
    this.saveCategories();
    return this.categories[index];
  }

  deleteCategory(id: string): boolean {
    const index = this.categories.findIndex(c => c.id === id);
    if (index === -1) return false;
    // Siempre desactivar para mantener historial
    this.categories[index].active = false;
    this.saveCategories();
    return true;
  }

  // Métodos de Productos
  getProducts(): Product[] {
    return this.products;
  }

  getProductsByCategory(categoryId: string, activeOnly = true): Product[] {
    return this.products.filter(p =>
      p.categoryId === categoryId && (activeOnly ? p.active !== false : true)
    );
  }

  getProductsByCategorySlug(slug: string): Product[] {
    const category = this.getCategoryBySlug(slug);
    if (!category) return [];
    return this.getProductsByCategory(category.id);
  }

  getProductById(id: string): Product | undefined {
    return this.products.find(p => p.id === id);
  }

  getFeaturedProducts(limit = FEATURED_LIMIT): Product[] {
    return this.products.filter(p => p.featured && p.active !== false).slice(0, limit);
  }

  /** Cantidad actual de productos destacados (activos). */
  getFeaturedCount(): number {
    return this.products.filter(p => p.featured && p.active !== false).length;
  }

  /** Productos activos que no están en destacados (para agregar a destacados). */
  getNonFeaturedProducts(): Product[] {
    return this.products.filter(p => p.active !== false && !p.featured);
  }

  addProduct(product: Omit<Product, 'id'>): Product {
    const newProduct: Product = {
      ...product,
      id: this.generateId('p'),
      active: product.active !== false
    };
    this.products.push(newProduct);
    this.saveProducts();
    return newProduct;
  }

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    this.products[index] = { ...this.products[index], ...updates };
    this.saveProducts();
    return this.products[index];
  }

  deleteProduct(id: string): boolean {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return false;
    this.products[index].active = false;
    this.saveProducts();
    return true;
  }

  /** Genera el siguiente código interno de producto (secuencial: 001, 002, ...). */
  getNextProductCode(): string {
    const codes = this.products
      .map(p => parseInt(p.code, 10))
      .filter(n => !isNaN(n));
    const next = codes.length ? Math.max(...codes) + 1 : 1;
    return String(next).padStart(3, '0');
  }

  // Utilidades
  private generateId(prefix: string): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${prefix}${timestamp}${random}`;
  }

  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
