/** Número de WhatsApp para contacto: +502 58226530 */
export const WHATSAPP_NUMBER = '50258226530';

/** Mensaje predeterminado para enlaces de contacto (footer, categorías, etc.) */
const CONTACT_MESSAGE = '¡Hola! Me gustaría obtener más información sobre los productos de Ferromaderas.';

/** URL para abrir WhatsApp con mensaje de consulta prellenado */
export const WHATSAPP_CONTACT_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(CONTACT_MESSAGE)}`;
