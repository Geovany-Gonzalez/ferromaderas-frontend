import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CatalogService } from '../../../core/services/catalog.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Category } from '../../../core/models/category.model';

type EstadoFilter = 'todos' | 'activo' | 'inactivo';

@Component({
  selector: 'app-categories-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './categories-admin.component.html',
  styleUrls: ['./categories-admin.component.scss'],
})
export class CategoriesAdminComponent implements OnInit {
  categories: Category[] = [];
  searchTerm = '';
  filterEstado: EstadoFilter = 'todos';

  constructor(
    private catalogService: CatalogService,
    private router: Router,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categories = this.catalogService.getAllCategories();
  }

  get filteredCategories(): Category[] {
    const term = this.searchTerm?.toLowerCase().trim() || '';
    let list = this.categories;
    if (this.filterEstado === 'activo') list = list.filter((c) => c.active !== false);
    if (this.filterEstado === 'inactivo') list = list.filter((c) => c.active === false);
    if (!term) return list;
    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        (c.description && c.description.toLowerCase().includes(term)) ||
        (c.slug && c.slug.toLowerCase().includes(term))
    );
  }

  categoryCode(index: number): string {
    return String(index + 1).padStart(3, '0');
  }

  getProductCount(category: Category): number {
    return this.catalogService.getProductsByCategory(category.id, false).length;
  }

  openCreateForm(): void {
    this.router.navigate(['/admin/categorias/crear']);
  }

  openEditForm(category: Category): void {
    this.router.navigate(['/admin/categorias/editar', category.id]);
  }

  setCategoryActive(category: Category, active: boolean): void {
    const action = active ? 'activar' : 'desactivar';
    let message = `¿Deseas ${action} la categoría "${category.name}"?`;
    if (!active) {
      message += '\n\nTen en cuenta que al desactivar una categoría, los productos que pertenecen a ella también se deshabilitarán.';
    }
    this.notification.confirm('Confirmar', message).then((ok) => {
      if (ok) {
        this.catalogService.updateCategory(category.id, { active });
        if (!active) {
          this.deactivateProductsInCategory(category.id);
        }
        this.loadCategories();
        this.notification.showMessage(`Categoría "${category.name}" ${active ? 'activada' : 'desactivada'}.`, 'success');
      }
    });
  }

  /** Deshabilita todos los productos de la categoría. */
  private deactivateProductsInCategory(categoryId: string): void {
    const products = this.catalogService.getProductsByCategory(categoryId, false);
    products.forEach((p) => this.catalogService.updateProduct(p.id, { active: false }));
  }

  trackById(_index: number, category: Category): string {
    return category.id;
  }
}
