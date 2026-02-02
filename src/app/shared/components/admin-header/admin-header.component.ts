import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-header.component.html',
  styleUrl: './admin-header.component.scss',
})
export class AdminHeaderComponent {
  constructor(private router: Router) {}

  goToPublicSite(): void {
    // Redirige al sitio público
    this.router.navigate(['/']);
  }

  logout(): void {
    // Aquí se implementará la lógica de logout
    this.router.navigate(['/admin-login']);
  }
}
