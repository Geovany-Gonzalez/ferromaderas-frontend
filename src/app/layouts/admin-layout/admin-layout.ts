import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AdminHeaderComponent } from '../../shared/components/admin-header/admin-header.component';
import { AdminSidebarComponent } from '../../shared/components/admin-sidebar/admin-sidebar.component';
import { AppMessagesComponent } from '../../shared/components/app-messages/app-messages.component';
import { FollowUpAlertsService } from '../../core/services/follow-up-alerts.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterModule, AdminHeaderComponent, AdminSidebarComponent, AppMessagesComponent],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayout implements OnInit {
  private readonly followUpAlerts = inject(FollowUpAlertsService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    if (this.auth.hasRole('cliente')) {
      void this.router.navigate(['/mis-cotizaciones']);
      return;
    }
    this.followUpAlerts.refresh();
  }
}
