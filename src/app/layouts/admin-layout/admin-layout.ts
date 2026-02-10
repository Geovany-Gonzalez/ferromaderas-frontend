import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AdminHeaderComponent } from '../../shared/components/admin-header/admin-header.component';
import { AdminSidebarComponent } from '../../shared/components/admin-sidebar/admin-sidebar.component';
import { AppMessagesComponent } from '../../shared/components/app-messages/app-messages.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterModule, AdminHeaderComponent, AdminSidebarComponent, AppMessagesComponent],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayout {}
