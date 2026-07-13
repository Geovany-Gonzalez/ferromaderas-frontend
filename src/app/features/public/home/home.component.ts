import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CatalogService } from '../../../core/services/catalog.service';
import { CartService } from '../../../core/services/cart.service';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { ProductRecommendationsComponent } from '../../../shared/components/product-recommendations/product-recommendations.component';
import { Product } from '../../../core/models/product.model';
import { AnalyticsService } from '../../../core/services/analytics.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ProductCardComponent, ProductRecommendationsComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  private catalog = inject(CatalogService);
  private cart = inject(CartService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private analytics = inject(AnalyticsService);

  featured: Product[] = [];
  searchQuery = '';

  ngOnInit(): void {
    this.catalog.loadCatalog().subscribe(() => {
      this.featured = this.catalog.getFeaturedProducts();
      this.cdr.markForCheck();
    });
    this.catalog.loadCategories().subscribe();
  }

  submitSearch(): void {
    const q = this.searchQuery?.trim() ?? '';
    if (q) {
      this.analytics.search(q);
    }
    void this.router.navigate(['/buscar'], {
      queryParams: q ? { q } : {},
    });
  }

  onAdd(p: Product){ this.cart.addOne(p); }
  trackById(_: number, p: Product){ return p.id; }

}
