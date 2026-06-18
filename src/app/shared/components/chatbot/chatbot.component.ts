import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ChatbotService,
  ChatFaq,
} from '../../../core/services/chatbot.service';

interface ChatMessage {
  type: 'bot' | 'user';
  text: string;
  /** Preguntas rápidas a mostrar debajo de un mensaje del bot. */
  suggestions?: ChatFaq[];
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.scss',
})
export class ChatbotComponent implements OnInit {
  isOpen = false;
  messages: ChatMessage[] = [];
  customInput = '';
  /** true mientras esperamos la respuesta del backend (muestra "escribiendo..."). */
  loading = false;
  /** true cuando todavía no conocemos el nombre del visitante (muestra el paso de nombre). */
  askingName = false;
  nameInput = '';

  private faqs: ChatFaq[] = [];

  constructor(private readonly chatbot: ChatbotService) {}

  ngOnInit(): void {
    this.resetConversation();
    // Cargar las preguntas prelistadas desde el backend.
    this.chatbot.getFaqs().subscribe((faqs) => {
      this.faqs = faqs.length
        ? faqs
        : this.chatbot.initialOptions.map((o) => ({
            id: o.id,
            question: o.text,
            answer: '',
          }));
      // Refrescar las sugerencias del mensaje de bienvenida (salvo si estamos pidiendo el nombre).
      if (!this.askingName && this.messages.length && this.messages[0].type === 'bot') {
        this.messages[0].suggestions = this.faqs.slice(0, 6);
      }
    });
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen && this.messages.length === 0) {
      this.resetConversation();
    }
  }

  resetConversation(): void {
    const name = this.chatbot.getName();
    // Si todavía no sabemos el nombre, mostramos el paso para pedirlo (sin costo de IA).
    this.askingName = !name;

    const greeting = name
      ? `¡Hola, ${name}! Soy el asistente de Ferromaderas. Elegí una pregunta o escribime tu consulta.`
      : this.chatbot.welcomeMessage;

    this.messages = [
      {
        type: 'bot',
        text: greeting,
        suggestions: this.askingName ? undefined : this.faqs.slice(0, 6),
      },
    ];
  }

  /** Guarda el nombre ingresado (o lo omite) y continúa la conversación. */
  submitName(skip = false): void {
    if (!skip) {
      const name = this.nameInput.trim();
      if (name) this.chatbot.setName(name);
    }
    this.nameInput = '';
    this.askingName = false;

    const name = this.chatbot.getName();
    const text = name
      ? `¡Gusto en conocerte, ${name}! ¿En qué puedo ayudarte?`
      : 'Perfecto. ¿En qué puedo ayudarte?';
    this.messages.push({
      type: 'bot',
      text,
      suggestions: this.faqs.slice(0, 6),
    });
  }

  /** Clic en una pregunta prelistada: se envía como mensaje normal. */
  selectFaq(faq: ChatFaq): void {
    this.chatbot.recordClick(faq.id, faq.question);
    this.send(faq.question);
  }

  /** Envío de texto libre. */
  sendCustom(): void {
    const text = this.customInput.trim();
    if (!text) return;
    this.customInput = '';
    this.send(text);
  }

  private send(text: string): void {
    if (this.loading) return;
    this.messages.push({ type: 'user', text });
    this.loading = true;

    this.chatbot.sendMessage(text).subscribe({
      next: (res) => {
        this.loading = false;
        this.messages.push({
          type: 'bot',
          text: res.answer,
          suggestions: res.suggestions?.length
            ? res.suggestions
            : this.faqs.slice(0, 6),
        });
      },
      error: () => {
        this.loading = false;
        this.messages.push({
          type: 'bot',
          text: 'Ocurrió un problema al responder. Intentá de nuevo en un momento o escribinos por WhatsApp.',
          suggestions: this.faqs.slice(0, 6),
        });
      },
    });
  }
}
