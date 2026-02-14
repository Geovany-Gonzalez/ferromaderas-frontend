import { Component, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService, CartLine } from '../../../core/services/cart.service';
import { CatalogService } from '../../../core/services/catalog.service';
import { NotificationService } from '../../../core/services/notification.service';

/** Número de WhatsApp para recibir cotizaciones: +502 58226530 */
const WHATSAPP_NUMBER = '50258226530';

/** Payload compacto con claves mínimas (URL más corta = más fácil que WhatsApp la detecte como link). */
type CompactLine = { p: string; q: number; c?: string; n?: string; m?: string; r?: number; pr?: number };

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent implements OnInit {
  private cart = inject(CartService);
  private catalog = inject(CatalogService);
  private notification = inject(NotificationService);
  private route = inject(ActivatedRoute);

  items = this.cart.items;
  total = this.cart.total;
  isEmpty = computed(() => this.cart.items().length === 0);

  /** Vista de cotización compartida (cuando se abre un link con ?c=) */
  showQuoteView = false;
  quoteData: { id: string; lines: CartLine[]; total: number; nombre: string; telefono: string; direccion: string; nota: string } | null = null;

  showTrackingForm = false;
  trackingData = {
    nombre: '',
    telefono: '',
    direccion: '',
    nota: '',
  };

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const c = params['c'];
      if (c) {
        try {
          const data = JSON.parse(atob(c));
          const id = data.i ?? data.id;
          const rawLines = data.l ?? data.lines;
          if (id && rawLines?.length) {
            const lines = this.normalizeQuoteLines(rawLines);
            if (lines.length > 0) {
              const total = data.t ?? data.total ?? lines.reduce((acc, l) => acc + l.product.price * l.qty, 0);
              this.quoteData = {
                id,
                lines,
                total,
                nombre: data.o ?? data.nombre ?? '',
                telefono: data.tel ?? data.telefono ?? '',
                direccion: data.d ?? data.direccion ?? '',
                nota: data.x ?? data.nota ?? '',
              };
              this.showQuoteView = true;
            }
          }
        } catch {
          /* ignored */
        }
      }
    });
  }

  /** Convierte payload (compacto o legacy) a CartLine[]. */
  private normalizeQuoteLines(raw: unknown[]): CartLine[] {
    const first = raw[0];
    if (typeof first === 'object' && first !== null && 'product' in first && 'qty' in first) {
      return raw
        .filter((x): x is CartLine => typeof x === 'object' && x !== null && 'product' in x && typeof (x as CartLine).product?.id === 'string')
        .map((x) => ({ product: (x as CartLine).product, qty: (x as CartLine).qty }));
    }
    return this.resolveLinesFromCompact(raw as CompactLine[]);
  }

  private resolveLinesFromCompact(compactLines: CompactLine[]): CartLine[] {
    const result: CartLine[] = [];
    for (const cl of compactLines) {
      if (cl.q <= 0) continue;
      let product = this.catalog.getProductById(cl.p);
      const name = cl.m ?? cl.n;
      const price = cl.r ?? cl.pr;
      if (!product && cl.c != null && name != null && price != null) {
        product = {
          id: cl.p,
          code: cl.c,
          name: String(name),
          price: Number(price),
          imageUrl: '/assets/icons/logo.png',
          categoryId: '',
        };
      }
      if (product) result.push({ product, qty: cl.q });
    }
    return result;
  }

  closeQuoteView(): void {
    this.showQuoteView = false;
  }

  addQty(productId: string): void {
    this.cart.addQty(productId);
  }

  subtractQty(productId: string): void {
    this.cart.subtractQty(productId);
  }

  remove(productId: string): void {
    this.cart.remove(productId);
  }

  openTrackingForm(): void {
    this.showTrackingForm = true;
  }

  closeTrackingForm(): void {
    this.showTrackingForm = false;
  }

  /** Genera la cotización. Claves mínimas para URL corta (WhatsApp la detecta como link). */
  private buildQuoteUrl(): { id: string; url: string } {
    const lines = this.cart.items();
    const year = new Date().getFullYear();
    const id = `FM-${year}-${Date.now().toString(36).toUpperCase().slice(-4)}`;
    const compactLines: CompactLine[] = lines.map((l) => ({
      p: l.product.id,
      q: l.qty,
      c: l.product.code,
      m: l.product.name,
      r: l.product.price,
    }));
    const payload = {
      i: id,
      l: compactLines,
      t: this.cart.total(),
      o: this.trackingData.nombre,
      tel: this.trackingData.telefono,
      d: this.trackingData.direccion,
      x: this.trackingData.nota,
    };
    const base = window.location.origin + window.location.pathname;
    const url = `${base}?c=${btoa(JSON.stringify(payload))}`;
    return { id, url };
  }

  copyLink(): void {
    const { url } = this.buildQuoteUrl();
    navigator.clipboard.writeText(url).then(() => {
      this.notification.showMessage('Link copiado.', 'success');
    });
  }

  sendToWhatsApp(): void {
    const msg = this.buildWhatsAppMessage();
    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank');
  }

  private buildWhatsAppMessage(): string {
    const lines = this.cart.items();
    const { id, url } = this.buildQuoteUrl();

    // URL primero y sola = más probable que WhatsApp la detecte como link clicable
    let msg = `Ver cotización completa:\n${url}\n\n`;
    msg += 'Buen día estimado Ferromaderas,\n\n';
    msg += 'He generado la siguiente cotización:\n\n';
    msg += `*Cotización ${id}*\n\n`;
    msg += '*Productos:*\n';
    lines.forEach((l) => {
      const sub = l.product.price * l.qty;
      msg += `• ${l.product.code} - ${l.product.name}\n  ${l.qty} x Q${l.product.price} = Q${sub}\n`;
    });
    msg += `\n*Total: Q${this.cart.total()}*\n\n`;
    if (this.trackingData.nombre || this.trackingData.telefono || this.trackingData.direccion || this.trackingData.nota) {
      msg += '--- Datos para seguimiento ---\n';
      if (this.trackingData.nombre) msg += `Nombre: ${this.trackingData.nombre}\n`;
      msg += `Teléfono/WhatsApp: +502 ${this.trackingData.telefono || '—'}\n`;
      if (this.trackingData.direccion) msg += `Dirección: ${this.trackingData.direccion}\n`;
      if (this.trackingData.nota) msg += `Nota: ${this.trackingData.nota}\n`;
      msg += '\n';
    }
    msg += 'Quedo atento(a). Gracias.';
    return msg;
  }

  trackById(_index: number, line: CartLine): string {
    return line.product.id;
  }
}
