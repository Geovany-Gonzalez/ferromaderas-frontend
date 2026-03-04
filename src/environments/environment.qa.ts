/**
 * Entorno de QA/Calidad.
 * Reemplaza environment.ts cuando se compila con --configuration=qa
 */
export const environment = {
  production: false,
  /** ID del contenedor GTM para pruebas. Reemplazar GTM-YYYYYY por tu ID real. */
  gtmId: 'GTM-YYYYYY',
  /** URL base de la API en QA */
  apiUrl: 'http://localhost:3001/api',
};
