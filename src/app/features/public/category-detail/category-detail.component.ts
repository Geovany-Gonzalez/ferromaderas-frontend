import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, map, of, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CatalogService } from '../../../core/services/catalog.service';
import { WHATSAPP_CONTACT_URL } from '../../../core/constants/whatsapp';
import { CartService } from '../../../core/services/cart.service';
import { Category } from '../../../core/models/category.model';
import { Product } from '../../../core/models/product.model';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-category-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent],
  templateUrl: './category-detail.component.html',
  styleUrls: ['./category-detail.component.scss']
})
export class CategoryDetailComponent implements OnInit {
  readonly whatsAppUrl = WHATSAPP_CONTACT_URL;
  category: Category | null = null;
  products: Product[] = [];
  searchTerm: string = '';

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private catalogService = inject(CatalogService);
  private cartService = inject(CartService);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const slug = params.get('slug');
          if (!slug) {
            void this.router.navigate(['/categorias']);
            return of(null);
          }
          return forkJoin([
            this.catalogService.loadCatalog(),
            this.catalogService.loadCategories(),
          ]).pipe(map(() => slug));
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((slug) => {
        if (slug === null) return;
        this.loadCategoryData(slug);
      });
  }

  private loadCategoryData(slug: string): void {
    const foundCategory = this.catalogService.getCategoryBySlug(slug);

    if (!foundCategory) {
      void this.router.navigate(['/categorias']);
      return;
    }

    this.category = foundCategory;
    this.products = this.catalogService.getProductsByCategory(foundCategory.id);
  }

  onAddToCart(product: Product): void {
    this.cartService.addOne(product);
  }

  get filteredProducts(): Product[] {
    if (!this.searchTerm) {
      return this.products;
    }
    
    const term = this.searchTerm.toLowerCase();
    return this.products.filter(p => 
      p.name.toLowerCase().includes(term) ||
      p.code.toLowerCase().includes(term)
    );
  }

  trackById(index: number, product: Product): string {
    return product.id;
  }
}
