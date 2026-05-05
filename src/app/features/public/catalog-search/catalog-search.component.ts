import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CatalogService } from '../../../core/services/catalog.service';
import { CartService } from '../../../core/services/cart.service';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-catalog-search',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent],
  templateUrl: './catalog-search.component.html',
  styleUrl: './catalog-search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogSearchComponent implements OnInit {
  private catalog = inject(CatalogService);
  private cart = inject(CartService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  searchQuery = '';
  results: Product[] = [];
  loadError = false;
  loading = true;

  ngOnInit(): void {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (!this.loading && !this.loadError) {
        this.applyQueryFromRoute();
        this.cdr.markForCheck();
      }
    });

    this.catalog.loadCatalog().subscribe({
      next: () => {
        this.loading = false;
        this.applyQueryFromRoute();
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.loadError = true;
        this.results = [];
        this.cdr.markForCheck();
      },
    });
  }

  private applyQueryFromRoute(): void {
    const q = (this.route.snapshot.queryParamMap.get('q') || '').trim();
    this.searchQuery = q;
    this.results = this.filterProducts(q);
  }

  private filterProducts(term: string): Product[] {
    const all = this.catalog
      .getProducts()
      .filter((p) => p.active !== false);
    if (!term) return all;
    const t = term.toLowerCase();
    return all.filter(
      (p) =>
        p.name.toLowerCase().includes(t) ||
        p.code.toLowerCase().includes(t)
    );
  }

  submitSearch(): void {
    const q = this.searchQuery.trim();
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: q || null },
      queryParamsHandling: '',
    });
  }

  onAdd(p: Product): void {
    this.cart.addOne(p);
  }

  trackById(_: number, p: Product): string {
    return p.id;
  }
}
