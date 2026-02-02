import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface MenuItem {
  label: string;
  route: string;
  icon?: string;
}

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.scss',
})
export class AdminSidebarComponent implements OnInit, OnDestroy {
  userName: string = 'Usuario1';
  isMenuOpen: boolean = false;
  private lastScrollTop: number = 0;
  
  menuItems: MenuItem[] = [
    { label: 'Productos', route: '/admin/productos' },
    { label: 'Categorías', route: '/admin/categorias' },
    { label: 'Destacados', route: '/admin/destacados' },
    { label: 'Cotizaciones', route: '/admin/cotizaciones' },
    { label: 'Políticas', route: '/admin/politicas' },
    { label: 'Usuarios', route: '/admin/usuarios' },
  ];

  ngOnInit(): void {
    // Detectar si es mobile al cargar
    this.checkScreenSize();
  }

  ngOnDestroy(): void {
    // Cleanup si es necesario
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    this.lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (!this.isMenuOpen) return;

    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    const scrollDifference = Math.abs(currentScroll - this.lastScrollTop);
    
    // Cerrar menú si se hace scroll más del 10% de la altura de la ventana
    const scrollThreshold = window.innerHeight * 0.1;
    
    if (scrollDifference > scrollThreshold) {
      this.closeMenu();
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    // Cerrar menú automáticamente si la pantalla es grande
    if (window.innerWidth > 768 && this.isMenuOpen) {
      this.closeMenu();
    }
  }
}
