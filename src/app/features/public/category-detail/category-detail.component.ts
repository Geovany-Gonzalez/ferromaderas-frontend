import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private catalogService: CatalogService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.catalogService.loadCatalog().subscribe(() => {
      this.catalogService.loadCategories().subscribe(() => {
        this.route.params.subscribe((params) => {
          this.loadCategoryData(params['slug']);
        });
      });
    });
  }

  private loadCategoryData(slug: string): void {
    const foundCategory = this.catalogService.getCategoryBySlug(slug);

    if (!foundCategory) {
      this.router.navigate(['/categorias']);
      return;
    }

    this.category = foundCategory;
    this.products = this.catalogService.getProductsByCategory(this.category.id);
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
