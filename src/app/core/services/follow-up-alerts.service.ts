import { Injectable, inject, signal, computed } from '@angular/core';
import { QuotesApiService, FollowUpAlertsResponse } from './quotes-api.service';
import { AuthService } from './auth.service';

/**
 * Estado compartido de alertas de seguimiento comercial.
 * Lo consumen el dashboard, el menú lateral y la pantalla de cotizaciones.
 */
@Injectable({ providedIn: 'root' })
export class FollowUpAlertsService {
  private readonly api = inject(QuotesApiService);
  private readonly auth = inject(AuthService);

  readonly data = signal<FollowUpAlertsResponse | null>(null);
  readonly loading = signal(false);

  readonly pendingCount = computed(
    () => this.data()?.resumen.totalPendientes ?? 0,
  );

  readonly hasAlerts = computed(() => this.pendingCount() > 0);

  /** Carga alertas si el usuario tiene permiso view_quotes. */
  refresh(): void {
    if (!this.auth.hasPermission('view_quotes')) {
      this.data.set(null);
      return;
    }
    this.loading.set(true);
    this.api.getFollowUpAlerts().subscribe({
      next: (res) => {
        this.data.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.data.set(null);
        this.loading.set(false);
      },
    });
  }
}
