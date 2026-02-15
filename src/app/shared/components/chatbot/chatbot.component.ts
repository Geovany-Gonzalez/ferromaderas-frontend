import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService, ChatOption } from '../../../core/services/chatbot.service';

interface ChatMessage {
  type: 'bot' | 'user';
  text: string;
  options?: ChatOption[];
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.scss',
})
export class ChatbotComponent {
  isOpen = false;
  messages: ChatMessage[] = [];
  customInput = '';

  constructor(private chatbot: ChatbotService) {
    this.resetConversation();
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen && this.messages.length === 0) {
      this.resetConversation();
    }
  }

  resetConversation(): void {
    this.messages = [
      {
        type: 'bot',
        text: this.chatbot.welcomeMessage,
        options: this.chatbot.initialOptions,
      },
    ];
  }

  selectOption(opt: ChatOption): void {
    this.chatbot.recordClick(opt.id, opt.text);

    this.messages.push({ type: 'user', text: opt.text });
    this.messages.push({
      type: 'bot',
      text: opt.response ?? 'Gracias por tu consulta. ¿Algo más?',
      options: opt.nextOptions,
    });
  }

  sendCustom(): void {
    const text = this.customInput.trim();
    if (!text) return;
    this.customInput = '';
    this.messages.push({ type: 'user', text });
    this.messages.push({
      type: 'bot',
      text: 'Gracias por tu mensaje. Un asesor te contactará pronto. Mientras tanto, ¿puedo ayudarte con alguna de las opciones anteriores?',
      options: this.chatbot.initialOptions,
    });
  }
}
