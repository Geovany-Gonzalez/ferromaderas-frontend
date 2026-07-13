import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { AnalyticsService } from '../../../core/services/analytics.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Output() add = new EventEmitter<Product>();

  private readonly analytics = inject(AnalyticsService);
  
  quantity = 1;

  openProduct(): void {
    this.analytics.selectItem(
      this.product.code,
      this.product.name,
      this.product.price,
      1,
      this.product.categoryId,
    );
  }

  increaseQuantity() {
    this.quantity++;
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart() {
    // Emitir el producto con la cantidad seleccionada
    for (let i = 0; i < this.quantity; i++) {
      this.add.emit(this.product);
    }
    // Resetear cantidad después de agregar
    this.quantity = 1;
  }
}
