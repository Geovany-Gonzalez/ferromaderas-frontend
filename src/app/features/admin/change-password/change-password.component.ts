import { Component, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

/** Requisitos mínimos de contraseña */
const MIN_LENGTH = 8;

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
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
  ) {
    this.token = this.route.snapshot.queryParams['token'] ?? '';
  }

  /** Calcula fortaleza 0-4 para la barra visual */
  get passwordStrength(): number {
    const p = this.newPassword ?? '';
    if (!p) return 0;
    let score = 0;
    if (p.length >= MIN_LENGTH) score++;
    if (p.length >= 12) score++;
    if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score++;
    if (/\d/.test(p)) score++;
    if (/[^a-zA-Z0-9]/.test(p)) score++;
    return Math.min(score, 4);
  }

  get strengthLabel(): string {
    const s = this.passwordStrength;
    return ['Muy débil', 'Débil', 'Regular', 'Fuerte', 'Muy fuerte'][s];
  }

  get meetsMinLength(): boolean {
    return (this.newPassword?.length ?? 0) >= MIN_LENGTH;
  }

  get hasUpperAndLower(): boolean {
    const p = this.newPassword ?? '';
    return /[a-z]/.test(p) && /[A-Z]/.test(p);
  }

  get hasNumber(): boolean {
    return /\d/.test(this.newPassword ?? '');
  }

  get hasSpecialChar(): boolean {
    return /[^a-zA-Z0-9]/.test(this.newPassword ?? '');
  }

  get canSubmit(): boolean {
    return (
      this.meetsMinLength &&
      this.newPassword === this.confirmPassword &&
      this.currentPassword.length > 0
    );
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
          this.ngZone.run(() => {
            this.loading = false;
            this.success = true;
            this.error = '';
            this.cdr.detectChanges();
          });
          setTimeout(() => {
            this.router.navigate(['/admin-login']);
          }, 3000);
        },
        error: (err) => {
          this.ngZone.run(() => {
            this.loading = false;
            this.error = err?.error?.message || 'Error al cambiar contraseña. Verifica los datos.';
            this.cdr.detectChanges();
          });
        },
      });
  }
}
