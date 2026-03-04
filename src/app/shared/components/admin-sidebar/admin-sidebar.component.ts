import { Component, OnInit, OnDestroy, HostListener, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface MenuItem {
  label: string;
  route: string;
  permission?: string;
  adminOnly?: boolean;
}

const ALL_MENU_ITEMS: MenuItem[] = [
  { label: 'Inicio', route: '/admin/dashboard' },
  { label: 'Productos', route: '/admin/productos', permission: 'manage_products' },
  { label: 'Categorías', route: '/admin/categorias', permission: 'manage_categories' },
  { label: 'Destacados', route: '/admin/destacados', permission: 'manage_featured' },
  { label: 'Cotizaciones', route: '/admin/cotizaciones', permission: 'view_quotes' },
  { label: 'Reportes', route: '/admin/reportes', permission: 'view_quotes' },
  { label: 'Políticas', route: '/admin/politicas', adminOnly: true },
  { label: 'Usuarios', route: '/admin/usuarios', permission: 'manage_users' },
];

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.scss',
})
export class AdminSidebarComponent implements OnInit, OnDestroy {
  isMenuOpen = false;
  private lastScrollTop = 0;

  userName = computed(() => this.auth.currentUser()?.name ?? 'Usuario');
  menuItems = computed(() => {
    const user = this.auth.currentUser();
    if (!user) return [];
    return ALL_MENU_ITEMS.filter((item) => {
      if (item.permission) return this.auth.hasPermission(item.permission);
      if (item.adminOnly) return this.auth.hasRole('administrador');
      return true;
    });
  });

  constructor(private readonly auth: AuthService) {}

  ngOnInit(): void {
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
