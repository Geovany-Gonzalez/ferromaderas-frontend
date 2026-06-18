import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ChatbotAdminService,
  AdminFaq,
  ChatbotMetrics,
  ChatbotUsageDay,
  ConversationListItem,
  ConversationDetail,
  UpsertFaqPayload,
} from '../../../core/services/chatbot-admin.service';

type Tab = 'faqs' | 'metrics' | 'conversations';

interface FaqForm {
  question: string;
  answer: string;
  keywords: string;
  order: number;
  active: boolean;
}

@Component({
  selector: 'app-chatbot-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot-admin.component.html',
  styleUrl: './chatbot-admin.component.scss',
})
export class ChatbotAdminComponent implements OnInit {
  private readonly api = inject(ChatbotAdminService);

  tab: Tab = 'faqs';
  loading = false;
  feedback = '';

  // FAQs
  faqs: AdminFaq[] = [];
  editingId: string | null = null;
  form: FaqForm = this.emptyForm();

  // Métricas / consumo
  metrics: ChatbotMetrics | null = null;
  usage: ChatbotUsageDay[] = [];

  // Conversaciones
  conversations: ConversationListItem[] = [];
  selectedConversation: ConversationDetail | null = null;

  ngOnInit(): void {
    this.loadFaqs();
  }

  setTab(tab: Tab): void {
    this.tab = tab;
    this.feedback = '';
    if (tab === 'faqs' && !this.faqs.length) this.loadFaqs();
    if (tab === 'metrics') this.loadMetrics();
    if (tab === 'conversations') this.loadConversations();
  }

  // ----- FAQs -----

  private emptyForm(): FaqForm {
    return { question: '', answer: '', keywords: '', order: 0, active: true };
  }

  loadFaqs(): void {
    this.loading = true;
    this.api.listFaqs().subscribe({
      next: (list) => {
        this.faqs = list;
        this.loading = false;
      },
      error: () => {
        this.feedback = 'No se pudieron cargar las FAQs.';
        this.loading = false;
      },
    });
  }

  startCreate(): void {
    this.editingId = null;
    this.form = this.emptyForm();
  }

  startEdit(faq: AdminFaq): void {
    this.editingId = faq.id;
    this.form = {
      question: faq.question,
      answer: faq.answer,
      keywords: faq.keywords ?? '',
      order: faq.order,
      active: faq.active,
    };
  }

  cancelEdit(): void {
    this.editingId = null;
    this.form = this.emptyForm();
  }

  saveFaq(): void {
    const payload: UpsertFaqPayload = {
      question: this.form.question.trim(),
      answer: this.form.answer.trim(),
      keywords: this.form.keywords.trim() || undefined,
      order: Number(this.form.order) || 0,
      active: this.form.active,
    };
    if (!payload.question || !payload.answer) {
      this.feedback = 'La pregunta y la respuesta son obligatorias.';
      return;
    }

    this.loading = true;
    const req = this.editingId
      ? this.api.updateFaq(this.editingId, payload)
      : this.api.createFaq(payload);

    req.subscribe({
      next: () => {
        this.feedback = this.editingId ? 'FAQ actualizada.' : 'FAQ creada.';
        this.cancelEdit();
        this.loadFaqs();
      },
      error: () => {
        this.feedback = 'No se pudo guardar la FAQ.';
        this.loading = false;
      },
    });
  }

  toggleActive(faq: AdminFaq): void {
    this.api
      .updateFaq(faq.id, {
        question: faq.question,
        answer: faq.answer,
        keywords: faq.keywords ?? undefined,
        order: faq.order,
        active: !faq.active,
      })
      .subscribe({
        next: () => this.loadFaqs(),
        error: () => (this.feedback = 'No se pudo cambiar el estado.'),
      });
  }

  deleteFaq(faq: AdminFaq): void {
    if (!confirm(`¿Eliminar la FAQ "${faq.question}"?`)) return;
    this.api.deleteFaq(faq.id).subscribe({
      next: () => {
        this.feedback = 'FAQ eliminada.';
        this.loadFaqs();
      },
      error: () => (this.feedback = 'No se pudo eliminar la FAQ.'),
    });
  }

  // ----- Métricas / consumo -----

  loadMetrics(): void {
    this.loading = true;
    this.api.getMetrics().subscribe({
      next: (m) => {
        this.metrics = m;
        this.loading = false;
      },
      error: () => {
        this.feedback = 'No se pudieron cargar las métricas.';
        this.loading = false;
      },
    });
    this.api.getUsage().subscribe({
      next: (u) => (this.usage = u),
      error: () => {},
    });
  }

  totalEstimatedCost(): number {
    return this.usage.reduce((acc, d) => acc + d.estimatedCost, 0);
  }

  // ----- Conversaciones -----

  loadConversations(): void {
    this.loading = true;
    this.selectedConversation = null;
    this.api.listConversations(1, 30).subscribe({
      next: (res) => {
        this.conversations = res.items;
        this.loading = false;
      },
      error: () => {
        this.feedback = 'No se pudieron cargar las conversaciones.';
        this.loading = false;
      },
    });
  }

  openConversation(id: string): void {
    this.api.getConversation(id).subscribe({
      next: (c) => (this.selectedConversation = c),
      error: () => (this.feedback = 'No se pudo abrir la conversación.'),
    });
  }

  closeConversation(): void {
    this.selectedConversation = null;
  }
}
