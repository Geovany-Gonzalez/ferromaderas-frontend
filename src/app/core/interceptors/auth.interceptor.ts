import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const notification = inject(NotificationService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== 401) {
        return throwError(() => err);
      }
      const url = req.url;
      const allowlisted =
        url.includes('/auth/login') ||
        url.includes('/auth/forgot-password') ||
        url.includes('/auth/force-password-change') ||
        url.includes('/auth/logout');
      if (allowlisted) {
        return throwError(() => err);
      }

      auth.clearSessionAfterUnauthorized();

      if (!url.includes('/auth/me')) {
        notification.showMessage('Sesión expirada o inválida. Inicia sesión de nuevo.', 'info');
      }

      const onAdmin =
        router.url.startsWith('/admin') && !router.url.startsWith('/admin-login');
      if (onAdmin) {
        void router.navigate(['/admin-login'], {
          queryParams: { returnUrl: router.url },
        });
      }

      return throwError(() => err);
    })
  );
};
