import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss',
})
export class ChangePasswordComponent {
  token = '';
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  loading = false;
  error = '';
  success = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
  ) {
    this.token = this.route.snapshot.queryParams['token'] ?? '';
  }

  onSubmit(): void {
    this.error = '';
    if (!this.token?.trim()) {
      this.error = 'Enlace inválido. Falta el token.';
      return;
    }
    if (!this.currentPassword) {
      this.error = 'Ingresa tu contraseña actual (la que recibiste por correo).';
      return;
    }
    if (!this.newPassword || this.newPassword.length < 8) {
      this.error = 'La nueva contraseña debe tener al menos 8 caracteres.';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.error = 'Las contraseñas no coinciden.';
      return;
    }
    this.loading = true;
    this.http
      .post<{ message: string }>(`${environment.apiUrl}/auth/force-password-change`, {
        token: this.token,
        currentPassword: this.currentPassword,
        newPassword: this.newPassword,
      })
      .subscribe({
        next: () => {
          this.loading = false;
          this.success = true;
          setTimeout(() => {
            this.router.navigate(['/admin-login']);
          }, 2500);
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.error?.message || 'Error al cambiar contraseña. Verifica los datos.';
        },
      });
  }
}
