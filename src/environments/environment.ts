/**
 * Entorno por defecto (desarrollo).
 * Se reemplaza por environment.prod.ts o environment.qa.ts según la configuración de build.
 */
export const environment = {
  production: false,
  /** ID del contenedor GTM. Vacío en desarrollo para no enviar datos a analytics. */
  gtmId: '',
  /**
   * Misma ruta que en producción (Vercel rewrite → Railway).
   * En local, `ng serve` usa proxy.conf.json → http://127.0.0.1:3001
   */
  apiUrl: '/api',
};
