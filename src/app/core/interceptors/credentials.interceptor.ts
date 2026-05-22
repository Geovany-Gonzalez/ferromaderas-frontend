import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/**
 * Envía cookies HttpOnly (JWT) en peticiones al API.
 * Con apiUrl relativo `/api` (proxy local o rewrite en Vercel) el navegador trata el alcance como mismo sitio.
 */
export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  const root = environment.apiUrl.replace(/\/$/, '');
  const hitsApi =
    req.url.startsWith(root + '/') ||
    req.url === root ||
    (req.url.startsWith('http') && req.url.startsWith(root));
  if (!hitsApi) {
    return next(req);
  }
  return next(req.clone({ withCredentials: true }));
};
