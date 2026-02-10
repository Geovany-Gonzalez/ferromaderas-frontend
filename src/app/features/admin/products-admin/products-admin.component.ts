import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CatalogService } from '../../../core/services/catalog.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-products-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './products-admin.component.html',
  styleUrl: './products-admin.component.scss',
})
export class ProductsAdminComponent implements OnInit {
  products: Product[] = [];
  searchTerm = '';
  filterEstado: 'todos' | 'activo' | 'inactivo' = 'todos';

  constructor(
    private catalogService: CatalogService,
    private router: Router,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.products = this.catalogService.getProducts();
  }

  get filteredProducts(): Product[] {
    const term = this.searchTerm?.toLowerCase().trim() || '';
    let list = this.products;
    if (this.filterEstado === 'activo') list = list.filter((p) => p.active !== false);
    if (this.filterEstado === 'inactivo') list = list.filter((p) => p.active === false);
    if (!term) return list;
    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.code.toLowerCase().includes(term) ||
        (p.description && p.description.toLowerCase().includes(term))
    );
  }

  getCategoryName(categoryId: string): string {
    const cat = this.catalogService.getCategoryById(categoryId);
    return cat?.name ?? '—';
  }

  addProduct(): void {
    this.router.navigate(['/admin/productos/crear']);
  }

  editProduct(product: Product): void {
    this.router.navigate(['/admin/productos/editar', product.id]);
  }

  setProductActive(product: Product, active: boolean): void {
    const action = active ? 'activar' : 'desactivar';
    this.notification.confirm('Confirmar', `¿Deseas ${action} el producto "${product.name}"?`).then((ok) => {
      if (ok) {
        this.catalogService.updateProduct(product.id, { active });
        this.loadProducts();
        this.notification.showMessage(`Producto "${product.name}" ${active ? 'activado' : 'desactivado'}.`, 'success');
      }
    });
  }

  trackById(_index: number, product: Product): string {
    return product.id;
  }
}
