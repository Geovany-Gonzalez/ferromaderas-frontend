import { Injectable, signal, computed, inject } from '@angular/core';
import { Product } from '../models/product.model';
import { AnalyticsService } from './analytics.service';

export type CartLine = { product: Product; qty: number };

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly analytics = inject(AnalyticsService);
  private readonly lines = signal<CartLine[]>([]);

  readonly count = computed(() =>
    this.lines().reduce((acc, l) => acc + l.qty, 0)
  );

  readonly items = computed(() => [...this.lines()]);

  readonly total = computed(() =>
    this.lines().reduce((acc, l) => acc + l.product.price * l.qty, 0)
  );

  addOne(product: Product): void {
    const curr = this.lines();
    const idx = curr.findIndex(l => l.product.id === product.id);
    if (idx >= 0) {
      const copy = [...curr];
      copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 };
      this.lines.set(copy);
    } else {
      this.lines.set([...curr, { product, qty: 1 }]);
    }
    this.analytics.addToCart(product.code, product.name, 1, product.price);
    this.analytics.selectItem(
      product.code,
      product.name,
      product.price,
      1,
      product.categoryId || undefined,
    );
  }

  addQty(productId: string): void {
    const curr = this.lines();
    const idx = curr.findIndex(l => l.product.id === productId);
    if (idx < 0) return;
    const copy = [...curr];
    copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 };
    this.lines.set(copy);
  }

  subtractQty(productId: string): void {
    const curr = this.lines();
    const idx = curr.findIndex(l => l.product.id === productId);
    if (idx < 0) return;
    const copy = [...curr];
    if (copy[idx].qty <= 1) {
      copy.splice(idx, 1);
    } else {
      copy[idx] = { ...copy[idx], qty: copy[idx].qty - 1 };
    }
    this.lines.set(copy);
  }

  remove(productId: string): void {
    this.lines.set(this.lines().filter(l => l.product.id !== productId));
  }

  clear(): void {
    this.lines.set([]);
  }
}
