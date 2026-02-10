import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService, ToastState, ConfirmState } from '../../../core/services/notification.service';

@Component({
  selector: 'app-app-messages',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-messages.component.html',
  styleUrl: './app-messages.component.scss',
})
export class AppMessagesComponent implements OnInit, OnDestroy {
  toast: ToastState = { visible: false, message: '', type: 'info' };
  confirm: ConfirmState = { visible: false, title: '', message: '', resolve: null };
  private subToast?: Subscription;
  private subConfirm?: Subscription;

  constructor(private notification: NotificationService) {}

  ngOnInit(): void {
    this.subToast = this.notification.toastState$.subscribe((t) => (this.toast = t));
    this.subConfirm = this.notification.confirmState$.subscribe((c) => (this.confirm = c));
  }

  ngOnDestroy(): void {
    this.subToast?.unsubscribe();
    this.subConfirm?.unsubscribe();
  }

  closeToast(): void {
    this.notification.closeToast();
  }

  onConfirmAccept(): void {
    this.notification.confirmAccept();
  }

  onConfirmCancel(): void {
    this.notification.confirmCancel();
  }
}
