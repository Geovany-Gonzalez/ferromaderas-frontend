/**
 * Entorno por defecto (desarrollo).
 * Se reemplaza por environment.prod.ts o environment.qa.ts según la configuración de build.
 */
export const environment = {
  production: false,
  /** ID del contenedor GTM. Vacío en desarrollo para no enviar datos a analytics. */
  gtmId: '',
  /** URL base de la API NestJS (feromaderas-api) */
  apiUrl: 'http://localhost:3001/api',
};
