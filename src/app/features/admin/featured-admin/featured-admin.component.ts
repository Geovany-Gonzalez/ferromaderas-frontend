import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatalogService, FEATURED_LIMIT } from '../../../core/services/catalog.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-featured-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './featured-admin.component.html',
  styleUrl: './featured-admin.component.scss',
})
export class FeaturedAdminComponent implements OnInit {
  readonly featuredLimit = FEATURED_LIMIT;
  featuredProducts: Product[] = [];
  searchTerm = '';

  constructor(
    private catalogService: CatalogService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadFeatured();
  }

  loadFeatured(): void {
    this.featuredProducts = this.catalogService.getFeaturedProducts(this.featuredLimit);
  }

  get featuredCount(): number {
    return this.catalogService.getFeaturedCount();
  }

  get atFeaturedLimit(): boolean {
    return this.featuredCount >= this.featuredLimit;
  }

  get nonFeaturedProducts(): Product[] {
    let list = this.catalogService.getNonFeaturedProducts();
    const term = this.searchTerm?.toLowerCase().trim() || '';
    if (term) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.code.toLowerCase().includes(term) ||
          (p.description && p.description.toLowerCase().includes(term))
      );
    }
    return list;
  }

  getCategoryName(categoryId: string): string {
    return this.catalogService.getCategoryById(categoryId)?.name ?? '—';
  }

  addToFeatured(product: Product): void {
    if (this.atFeaturedLimit) {
      this.notification.showMessage(
        `Has alcanzado el límite de ${this.featuredLimit} destacados. Quita uno para agregar otro.`,
        'error'
      );
      return;
    }
    this.catalogService.updateProduct(product.id, { featured: true });
    this.loadFeatured();
    this.notification.showMessage(`"${product.name}" agregado a destacados.`, 'success');
  }

  removeFromFeatured(product: Product): void {
    this.catalogService.updateProduct(product.id, { featured: false });
    this.loadFeatured();
    this.notification.showMessage(`"${product.name}" quitado de destacados.`, 'success');
  }

  trackById(_index: number, p: Product): string {
    return p.id;
  }
}
