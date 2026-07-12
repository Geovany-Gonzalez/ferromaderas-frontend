import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { AppMessagesComponent } from '../../shared/components/app-messages/app-messages.component';
import { ChatbotComponent } from '../../shared/components/chatbot/chatbot.component';
import { CartService } from '../../core/services/cart.service';
import { AnalyticsService } from '../../core/services/analytics.service';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, AppMessagesComponent, ChatbotComponent],
  templateUrl: './public-layout.component.html',
  styleUrl: './public-layout.component.scss',
})
export class PublicLayoutComponent implements OnInit, OnDestroy {
  private cart = inject(CartService);
  private router = inject(Router);
  private analytics = inject(AnalyticsService);
  private navSub?: Subscription;

  cartCount = this.cart.count;

  ngOnInit(): void {
    this.navSub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.analytics.pageView(e.urlAfterRedirects, document.title);
      });
  }

  ngOnDestroy(): void {
    this.navSub?.unsubscribe();
  }
}
