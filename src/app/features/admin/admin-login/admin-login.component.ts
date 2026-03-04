import { Component, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.scss',
})
export class AdminLoginComponent {
  /** Patrón básico de correo: algo@dominio.ext (evita "1", símbolos sueltos, etc.) */
  private static readonly EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  username = '';
  password = '';
  loading = false;
  error = '';

  showForgotPassword = false;
  forgotEmail = '';
  forgotLoading = false;
  forgotError = '';
  forgotSuccess = '';

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly ngZone: NgZone,
    private readonly cdr: ChangeDetectorRef
  ) {}

  onSubmit(): void {
    this.error = '';
    if (!this.username?.trim()) {
      this.error = 'Ingresa tu usuario';
      return;
    }
    if (!this.password) {
      this.error = 'Ingresa tu contraseña';
      return;
    }
    this.loading = true;
    this.auth.login(this.username.trim(), this.password).subscribe({
      next: () => {
        this.loading = false;
        let returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin/dashboard';
        if (!returnUrl.startsWith('/admin')) returnUrl = '/admin/dashboard';
        setTimeout(() => {
          this.router.navigateByUrl(returnUrl);
        }, 50);
      },
      error: (err) => {
        const setError = () => {
          this.loading = false;
          if (!err) {
            this.error = 'Error desconocido. Revisa la consola (F12).';
            this.cdr.detectChanges();
            return;
          }
          const msg = err?.error?.message ?? err?.message ?? '';
          const status = err?.status ?? err?.statusCode;
          const isTimeout = err?.name === 'TimeoutError' || /timeout/i.test(msg);
          if (isTimeout) {
            this.error = 'El servidor tardó demasiado en responder. Revisa tu conexión o intenta más tarde.';
          } else if (status === 0 || status === undefined) {
            this.error =
              'No se puede conectar con el servidor. ¿La API está corriendo en http://localhost:3001?';
          } else if (status === 503) {
            this.error =
              msg ||
              'La base de datos no está conectada. Revisa el .env del API (DATABASE_URL).';
          } else if (status === 401) {
            this.error = msg || 'Usuario o contraseña incorrectos.';
          } else {
            this.error = msg || 'Error al iniciar sesión. Intenta de nuevo.';
          }
          this.cdr.detectChanges();
        };
        this.ngZone.run(setError);
      },
    });
  }

  onForgotPassword(): void {
    this.forgotError = '';
    this.forgotSuccess = '';
    const email = this.forgotEmail?.trim() ?? '';
    if (!email) {
      this.forgotError = 'Ingresa tu correo electrónico.';
      return;
    }
    if (!AdminLoginComponent.EMAIL_REGEX.test(email)) {
      this.forgotError = 'El correo no tiene un formato válido. Ejemplo: nombre@correo.com';
      return;
    }
    this.forgotLoading = true;
    this.auth.forgotPassword(email).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.forgotLoading = false;
          this.forgotSuccess = 'Si el correo está registrado, recibirás un email con una contraseña temporal y un enlace para cambiarla. Revisa también la carpeta de spam.';
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          this.forgotLoading = false;
          this.forgotError = err?.error?.message || 'No se pudo enviar. Verifica el correo o contacta al administrador.';
          this.cdr.detectChanges();
        });
      },
    });
  }

  openForgotModal(): void {
    this.forgotError = '';
    this.forgotSuccess = '';
    this.showForgotPassword = true;
  }

  closeForgotModal(): void {
    this.showForgotPassword = false;
    this.forgotSuccess = '';
    this.forgotError = '';
    this.forgotEmail = '';
  }

  /** true si el correo tiene formato válido (algo@dominio.ext) */
  get isForgotEmailValid(): boolean {
    const e = this.forgotEmail?.trim() ?? '';
    return e.length > 0 && AdminLoginComponent.EMAIL_REGEX.test(e);
  }
}
