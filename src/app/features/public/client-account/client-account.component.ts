import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import {
  QuotesApiService,
  Quote,
  SeguimientoEntry,
} from '../../../core/services/quotes-api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { clientFacingHttpMessage } from '../../../core/http/client-facing-error';

type AuthMode = 'login' | 'register' | 'forgot';

@Component({
  selector: 'app-client-account',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './client-account.component.html',
  styleUrl: './client-account.component.scss',
})
export class ClientAccountComponent implements OnInit {
  private auth = inject(AuthService);
  private quotesApi = inject(QuotesApiService);
  private notification = inject(NotificationService);
  private router = inject(Router);

  mode: AuthMode = 'login';
  email = '';
  password = '';
  name = '';
  phone = '';
  forgotEmail = '';
  loading = false;
  forgotLoading = false;
  forgotSuccess = '';
  forgotError = '';
  quotes: Quote[] = [];
  selectedQuote: Quote | null = null;
  seguimiento: SeguimientoEntry[] = [];
  loadingSeguimiento = false;
  loadingQuotes = false;

  private static readonly EMAIL_REGEX =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  readonly statusLabels: Record<string, string> = {
    nueva: 'Nueva',
    en_seguimiento: 'En seguimiento',
    confirmada: 'Confirmada',
    cerrada: 'Cerrada',
    cancelada: 'Cancelada',
  };

  readonly statusClass: Record<string, string> = {
    nueva: 'status-nueva',
    en_seguimiento: 'status-seguimiento',
    confirmada: 'status-confirmada',
    cerrada: 'status-cerrada',
    cancelada: 'status-cancelada',
  };

  get isLoggedIn(): boolean {
    return this.auth.isAuthenticated() && this.auth.hasRole('cliente');
  }

  get userName(): string {
    return this.auth.currentUser()?.name?.trim() || 'Cliente';
  }

  ngOnInit(): void {
    if (this.isLoggedIn) {
      this.loadQuotes();
    }
  }

  setMode(next: AuthMode): void {
    this.mode = next;
    this.forgotError = '';
    this.forgotSuccess = '';
    if (next === 'forgot' && this.email.trim()) {
      this.forgotEmail = this.email.trim();
    }
  }

  submit(): void {
    if (this.mode === 'register') {
      this.register();
    } else {
      this.login();
    }
  }

  private login(): void {
    if (!ClientAccountComponent.EMAIL_REGEX.test(this.email.trim())) {
      this.notification.showMessage('Ingresá un correo válido.', 'error');
      return;
    }
    this.loading = true;
    this.auth.login(this.email.trim(), this.password).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.user.role !== 'cliente') {
          this.auth.logout();
          this.notification.showMessage(
            'Esta cuenta es de personal interno. Usá el acceso administrativo.',
            'error',
          );
          return;
        }
        this.loadQuotes();
        this.notification.showMessage(`Bienvenido, ${res.user.name}.`, 'success');
      },
      error: () => {
        this.loading = false;
        this.notification.showMessage('Correo o contraseña incorrectos.', 'error');
      },
    });
  }

  private register(): void {
    if (!this.name.trim()) {
      this.notification.showMessage('Ingresá tu nombre.', 'error');
      return;
    }
    if (!ClientAccountComponent.EMAIL_REGEX.test(this.email.trim())) {
      this.notification.showMessage('Ingresá un correo válido.', 'error');
      return;
    }
    if (this.password.length < 8) {
      this.notification.showMessage('La contraseña debe tener al menos 8 caracteres.', 'error');
      return;
    }
    this.loading = true;
    this.auth.registerClient(this.email, this.password, this.name, this.phone).subscribe({
      next: (res) => {
        this.loading = false;
        const linked =
          res.linkedQuotes > 0
            ? ` Se vincularon ${res.linkedQuotes} cotización(es) previa(s).`
            : '';
        this.notification.showMessage(`Cuenta creada.${linked}`, 'success');
        this.loadQuotes();
      },
      error: (err) => {
        this.loading = false;
        this.notification.showMessage(
          err?.error?.message ?? 'No se pudo crear la cuenta.',
          'error',
        );
      },
    });
  }

  submitForgot(): void {
    this.forgotError = '';
    this.forgotSuccess = '';
    const email = this.forgotEmail.trim().toLowerCase();
    if (!email) {
      this.forgotError = 'Ingresá tu correo electrónico.';
      return;
    }
    if (!ClientAccountComponent.EMAIL_REGEX.test(email)) {
      this.forgotError = 'El correo no tiene un formato válido.';
      return;
    }
    this.forgotLoading = true;
    this.auth.forgotPassword(email).subscribe({
      next: () => {
        this.forgotLoading = false;
        this.forgotSuccess =
          'Si el correo está registrado, recibirás una contraseña temporal y un enlace para cambiarla. Revisá también la carpeta de spam.';
      },
      error: (err) => {
        this.forgotLoading = false;
        this.forgotError = clientFacingHttpMessage(
          err,
          'No se pudo enviar el correo. Intentá de nuevo en unos minutos.',
        );
      },
    });
  }

  loadQuotes(): void {
    this.loadingQuotes = true;
    this.quotesApi.getMisCotizaciones().subscribe({
      next: (list) => {
        this.quotes = list;
        this.loadingQuotes = false;
      },
      error: () => {
        this.quotes = [];
        this.loadingQuotes = false;
        this.notification.showMessage('No se pudieron cargar tus cotizaciones.', 'error');
      },
    });
  }

  logout(): void {
    this.auth.logout();
    this.quotes = [];
    this.selectedQuote = null;
    this.seguimiento = [];
    this.mode = 'login';
  }

  openQuote(q: Quote): void {
    void this.router.navigate(['/carrito'], { queryParams: { code: q.codigo } });
  }

  viewSeguimiento(q: Quote): void {
    if (this.selectedQuote?.id === q.id) {
      this.selectedQuote = null;
      this.seguimiento = [];
      return;
    }
    this.selectedQuote = q;
    this.loadingSeguimiento = true;
    this.seguimiento = [];
    this.quotesApi.getSeguimientoHistorial(q.id).subscribe({
      next: (entries) => {
        this.seguimiento = entries;
        this.loadingSeguimiento = false;
      },
      error: () => {
        this.loadingSeguimiento = false;
        this.notification.showMessage('No se pudo cargar el historial de seguimiento.', 'error');
      },
    });
  }

  seguimientoLabel(entry: SeguimientoEntry): string {
    if (entry.estadoNuevo) {
      const prev = entry.estadoAnterior
        ? `${this.statusLabels[entry.estadoAnterior] ?? entry.estadoAnterior} → `
        : '';
      return `${prev}${this.statusLabels[entry.estadoNuevo] ?? entry.estadoNuevo}`;
    }
    if (entry.tipo === 'creacion') return 'Cotización creada';
    return entry.tipo;
  }
}
