import { Injectable, signal, computed } from '@angular/core';
import { Product } from '../models/product.model';

type CartLine = { product: Product; qty: number };

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly lines = signal<CartLine[]>([]);

  readonly count = computed(() =>
    this.lines().reduce((acc, l) => acc + l.qty, 0)
  );

  addOne(product: Product) {
    const curr = this.lines();
    const idx = curr.findIndex(l => l.product.id === product.id);
    if (idx >= 0) {
      const copy = [...curr];
      copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 };
      this.lines.set(copy);
      return;
    }
    this.lines.set([...curr, { product, qty: 1 }]);
  }
}
