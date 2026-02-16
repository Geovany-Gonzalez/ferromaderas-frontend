import { environment } from '../../../environments/environment';

declare global {
  interface Window {
    dataLayer: unknown[];
  }
}

/**
 * Inyecta el script de Google Tag Manager si el entorno tiene gtmId configurado.
 * Se ejecuta al arrancar la aplicación.
 */
export function loadGtm(): void {
  const gtmId = environment.gtmId?.trim();
  if (!gtmId || typeof document === 'undefined') return;

  const dataLayerName = 'dataLayer';
  (window as Window).dataLayer = (window as Window).dataLayer || [];

  const script = document.createElement('script');
  script.textContent = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','${dataLayerName}','${gtmId}');`;
  document.head.insertBefore(script, document.head.firstChild);

  const noscript = document.createElement('noscript');
  const iframe = document.createElement('iframe');
  iframe.src = `https://www.googletagmanager.com/ns.html?id=${gtmId}`;
  iframe.height = '0';
  iframe.width = '0';
  iframe.style.cssText = 'display:none;visibility:hidden';
  noscript.appendChild(iframe);
  document.body.insertBefore(noscript, document.body.firstChild);
}
