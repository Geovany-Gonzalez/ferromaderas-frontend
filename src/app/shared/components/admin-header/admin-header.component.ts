import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-header.component.html',
  styleUrl: './admin-header.component.scss',
})
export class AdminHeaderComponent {
  constructor(
    private router: Router,
    private readonly auth: AuthService
  ) {}

  goToPublicSite(): void {
    this.router.navigate(['/']);
  }

  logout(): void {
    this.auth.logout();
  }
}
