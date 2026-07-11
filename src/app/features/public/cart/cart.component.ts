import { Component, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { CartService, CartLine } from '../../../core/services/cart.service';
import { CatalogService } from '../../../core/services/catalog.service';
import { NotificationService } from '../../../core/services/notification.service';
import { QuotesApiService, Quote, CreateQuoteInput } from '../../../core/services/quotes-api.service';

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
  private quotesApi = inject(QuotesApiService);

  items = this.cart.items;
  total = this.cart.total;
  isEmpty = computed(() => this.cart.items().length === 0);

  /** Cotización ya guardada en el backend (evita crear duplicados al reenviar). */
  private savedQuote: Quote | null = null;

  /** Vista de cotización compartida (cuando se abre un link con ?code= o ?c=) */
  showQuoteView = false;
  quoteData: { id: string; lines: CartLine[]; total: number; nombre: string; telefono: string; direccion: string; nota: string } | null = null;

  showTrackingForm = false;
  trackingData = {
    nombre: '',
    telefono: '',
    email: '',
    direccion: '',
    nota: '',
  };

  ngOnInit(): void {
    this.catalog.loadCatalog().subscribe();
    this.catalog.loadCategories().subscribe();
    this.route.queryParams.subscribe((params) => {
      // Enlace nuevo: ?code=FM-2026-XXXX → se consulta la cotización en el backend.
      const code = params['code'];
      if (code) {
        this.quotesApi.getByCodigo(code).subscribe({
          next: (q) => {
            this.quoteData = this.mapQuoteToView(q);
            this.showQuoteView = true;
          },
          error: () => {
            this.notification.showMessage('No se encontró la cotización solicitada.', 'error');
          },
        });
        return;
      }

      // Enlace anterior (compatibilidad): ?c=base64 con el detalle embebido.
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

  /** Convierte los items de una cotización del backend al formato de la vista. */
  private mapQuoteToView(q: Quote): { id: string; lines: CartLine[]; total: number; nombre: string; telefono: string; direccion: string; nota: string } {
    const lines: CartLine[] = (q.items ?? []).map((it) => {
      const existing = it.productoId ? this.catalog.getProductById(it.productoId) : undefined;
      return {
        product: {
          id: it.productoId ?? it.codigo,
          code: it.codigo,
          name: it.nombre,
          price: it.precioUnitario,
          imageUrl: existing?.imageUrl ?? '/assets/icons/logo.png',
          categoryId: existing?.categoryId ?? '',
        },
        qty: it.cantidad,
      };
    });
    return {
      id: q.codigo,
      lines,
      total: q.total,
      nombre: q.clienteNombre ?? '',
      telefono: q.clienteTelefono ?? '',
      direccion: q.clienteDireccion ?? '',
      nota: q.clienteNota ?? '',
    };
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
    this.savedQuote = null;
    this.cart.addQty(productId);
  }

  subtractQty(productId: string): void {
    this.savedQuote = null;
    this.cart.subtractQty(productId);
  }

  remove(productId: string): void {
    this.savedQuote = null;
    this.cart.remove(productId);
  }

  openTrackingForm(): void {
    this.showTrackingForm = true;
  }

  closeTrackingForm(): void {
    this.showTrackingForm = false;
  }

  /** Datos para crear la cotización en el backend a partir del carrito actual. */
  private buildCreateInput(): CreateQuoteInput {
    return {
      clienteNombre: this.trackingData.nombre || undefined,
      clienteTelefono: this.trackingData.telefono || undefined,
      clienteEmail: this.trackingData.email?.trim() || undefined,
      clienteDireccion: this.trackingData.direccion || undefined,
      clienteNota: this.trackingData.nota || undefined,
      items: this.cart.items().map((l) => ({
        productoId: l.product.id,
        codigo: l.product.code,
        nombre: l.product.name,
        precioUnitario: l.product.price,
        cantidad: l.qty,
      })),
    };
  }

  /**
   * Guarda la cotización en el backend una sola vez. Si el API falla (offline),
   * devuelve null y el flujo continúa con el enlace embebido (compatibilidad).
   */
  private ensureQuoteSaved(): Observable<Quote | null> {
    if (this.savedQuote) return of(this.savedQuote);
    if (this.cart.items().length === 0) return of(null);
    return this.quotesApi.create(this.buildCreateInput()).pipe(
      tap((q) => (this.savedQuote = q)),
      catchError(() => of(null)),
    );
  }

  /** Enlace de la cotización: usa el código del backend si existe, si no, el legacy base64. */
  private quoteLinkFor(q: Quote | null): { id: string; url: string } {
    const base = window.location.origin + window.location.pathname;
    if (q) {
      return { id: q.codigo, url: `${base}?code=${encodeURIComponent(q.codigo)}` };
    }
    return this.buildLegacyQuoteUrl();
  }

  /** Enlace embebido (base64) usado como respaldo cuando no hay conexión con el backend. */
  private buildLegacyQuoteUrl(): { id: string; url: string } {
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
    this.ensureQuoteSaved().subscribe((q) => {
      const { url } = this.quoteLinkFor(q);
      navigator.clipboard.writeText(url).then(() => {
        this.notification.showMessage('Link copiado.', 'success');
      });
    });
  }

  sendToWhatsApp(): void {
    this.ensureQuoteSaved().subscribe((q) => {
      const msg = this.buildWhatsAppMessage(q);
      const encoded = encodeURIComponent(msg);
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank');
    });
  }

  /** Formatea un monto en quetzales con separador de miles y 2 decimales (Q1,234.50). */
  private fmtQ(n: number): string {
    return `Q${n.toLocaleString('es-GT', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  private buildWhatsAppMessage(q: Quote | null): string {
    const lines = this.cart.items();
    const { id, url } = this.quoteLinkFor(q);
    const t = this.trackingData;

    const partes: string[] = [];
    partes.push('Buen día, estimado Ferromaderas.');
    partes.push('Le comparto una cotización generada desde su sitio web:');
    partes.push(`*Cotización ${id}*`);

    const productos = ['*Productos*'];
    lines.forEach((l) => {
      const sub = l.product.price * l.qty;
      productos.push(
        `• ${l.product.code} - ${l.product.name}\n   ${l.qty} x ${this.fmtQ(l.product.price)} = ${this.fmtQ(sub)}`,
      );
    });
    partes.push(productos.join('\n'));

    partes.push(`*Total: ${this.fmtQ(this.cart.total())}*`);

    if (t.nombre || t.telefono || t.email || t.direccion || t.nota) {
      const datos = ['*Mis datos*'];
      if (t.nombre) datos.push(`Nombre: ${t.nombre}`);
      if (t.telefono) datos.push(`Teléfono/WhatsApp: +502 ${t.telefono}`);
      if (t.email) datos.push(`Correo: ${t.email}`);
      if (t.direccion) datos.push(`Dirección: ${t.direccion}`);
      if (t.nota) datos.push(`Nota: ${t.nota}`);
      partes.push(datos.join('\n'));
    }

    partes.push(`Ver la cotización en línea:\n${url}`);
    partes.push('Quedo atento(a) a su confirmación. ¡Gracias!');

    return partes.join('\n\n');
  }

  trackById(_index: number, line: CartLine): string {
    return line.product.id;
  }
}
