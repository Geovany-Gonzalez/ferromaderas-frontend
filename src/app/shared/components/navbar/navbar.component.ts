import { Component, Input, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit, OnDestroy {
  @Input() cartCount = 0;
  menuOpen = false;
  private lastScrollPosition = 0;

  ngOnInit() {
    this.lastScrollPosition = window.pageYOffset;
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    if (this.menuOpen) {
      const currentScrollPosition = window.pageYOffset;
      // Si el usuario hace scroll (más de 10px), cerrar el menú
      if (Math.abs(currentScrollPosition - this.lastScrollPosition) > 10) {
        this.menuOpen = false;
      }
    }
    this.lastScrollPosition = window.pageYOffset;
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    this.lastScrollPosition = window.pageYOffset;
  }
}
