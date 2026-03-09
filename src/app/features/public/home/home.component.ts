import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../../core/services/catalog.service';
import { CartService } from '../../../core/services/cart.service';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  private catalog = inject(CatalogService);
  private cart = inject(CartService);

  featured: Product[] = [];

  ngOnInit(): void {
    this.catalog.loadCatalog().subscribe(() => {
      this.featured = this.catalog.getFeaturedProducts();
    });
    this.catalog.loadCategories().subscribe();
  }

  onAdd(p: Product){ this.cart.addOne(p); }
  trackById(_: number, p: Product){ return p.id; }

}
