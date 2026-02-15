import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { AppMessagesComponent } from '../../shared/components/app-messages/app-messages.component';
import { ChatbotComponent } from '../../shared/components/chatbot/chatbot.component';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, AppMessagesComponent, ChatbotComponent],
  templateUrl: './public-layout.component.html',
  styleUrl: './public-layout.component.scss',
})
export class PublicLayoutComponent {
  private cart = inject(CartService);
  cartCount = this.cart.count; // signal
}
