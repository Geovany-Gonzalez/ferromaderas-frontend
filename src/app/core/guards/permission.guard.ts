import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export function permissionGuard(permission: string): boolean {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isAuthenticated()) {
    router.navigate(['/admin-login']);
    return false;
  }
  if (auth.hasPermission(permission)) return true;
  router.navigate(['/admin/dashboard']);
  return false;
}
