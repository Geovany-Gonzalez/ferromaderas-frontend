import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

/** Eventos GTM documentados en ANALITICA-SITIO-WEB.md */
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private push(event: string, params: Record<string, unknown> = {}): void {
    if (environment.production === false && !environment.gtmId?.trim()) return;
    if (typeof window === 'undefined') return;
    const w = window as Window & { dataLayer?: unknown[] };
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({ event, ...params });
  }

  addToCart(productCode: string, productName: string, qty: number, value: number): void {
    this.selectItem(productCode, productName, value, qty);
    this.push('add_to_cart', {
      currency: 'GTQ',
      value,
      items: [{ item_id: productCode, item_name: productName, quantity: qty }],
    });
  }

  /** Evento GA4 estándar al elegir un producto del catálogo. */
  selectItem(
    productCode: string,
    productName: string,
    price: number,
    quantity = 1,
    categoryId?: string,
  ): void {
    this.push('select_item', {
      currency: 'GTQ',
      value: price * quantity,
      items: [
        {
          item_id: productCode,
          item_name: productName,
          price,
          quantity,
          ...(categoryId ? { item_category: categoryId } : {}),
        },
      ],
    });
  }

  search(searchTerm: string, resultsCount?: number): void {
    this.push('search', {
      search_term: searchTerm,
      ...(resultsCount != null ? { results_count: resultsCount } : {}),
    });
  }

  generateLead(quoteCode: string, value: number, source: 'whatsapp' | 'email' | 'share'): void {
    this.push('generate_lead', {
      currency: 'GTQ',
      value,
      quote_code: quoteCode,
      lead_source: source,
    });
  }

  chatbotOpen(): void {
    this.push('chatbot_open');
  }

  chatbotQuestion(questionId: string, questionText: string): void {
    this.push('chatbot_question', {
      question_id: questionId,
      question_text: questionText,
    });
  }

  beginCheckout(value: number, itemCount: number): void {
    this.push('begin_checkout', {
      currency: 'GTQ',
      value,
      item_count: itemCount,
    });
  }

  pageView(path: string, title: string): void {
    this.push('page_view', { page_path: path, page_title: title });
  }

  /** Evento GA4 al ver la ficha de un producto. */
  viewItem(
    productCode: string,
    productName: string,
    price: number,
    categoryId?: string,
  ): void {
    this.push('view_item', {
      currency: 'GTQ',
      value: price,
      items: [
        {
          item_id: productCode,
          item_name: productName,
          price,
          ...(categoryId ? { item_category: categoryId } : {}),
        },
      ],
    });
  }
}
