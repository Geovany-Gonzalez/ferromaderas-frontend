import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type MessageType = 'success' | 'error' | 'info';

export interface ToastState {
  visible: boolean;
  message: string;
  type: MessageType;
}

export interface ConfirmState {
  visible: boolean;
  title: string;
  message: string;
  resolve: ((value: boolean) => void) | null;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private toast$ = new BehaviorSubject<ToastState>({ visible: false, message: '', type: 'info' });
  private confirm$ = new BehaviorSubject<ConfirmState>({ visible: false, title: '', message: '', resolve: null });

  get toastState$() {
    return this.toast$.asObservable();
  }

  get confirmState$() {
    return this.confirm$.asObservable();
  }

  showMessage(message: string, type: MessageType = 'info'): void {
    this.toast$.next({ visible: true, message, type });
    setTimeout(() => {
      this.toast$.next({ visible: false, message: '', type: 'info' });
    }, 5000);
  }

  closeToast(): void {
    this.toast$.next({ visible: false, message: '', type: 'info' });
  }

  confirm(title: string, message: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.confirm$.next({ visible: true, title, message, resolve });
    });
  }

  confirmAccept(): void {
    const state = this.confirm$.value;
    if (state.resolve) state.resolve(true);
    this.confirm$.next({ visible: false, title: '', message: '', resolve: null });
  }

  confirmCancel(): void {
    const state = this.confirm$.value;
    if (state.resolve) state.resolve(false);
    this.confirm$.next({ visible: false, title: '', message: '', resolve: null });
  }
}
