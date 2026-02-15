import { Injectable } from '@angular/core';

export interface ChatOption {
  id: string;
  text: string;
  response?: string;
  nextOptions?: ChatOption[];
}

const STORAGE_FAQ_KEY = 'ferromaderas_chatbot_faq_clicks';

@Injectable({ providedIn: 'root' })
export class ChatbotService {
  /** Preguntas predefinidas con flujos conversacionales */
  readonly welcomeMessage = '¡Hola! Soy el asistente de Ferromaderas. ¿En qué puedo ayudarte?';

  readonly initialOptions: ChatOption[] = [
    {
      id: 'horarios',
      text: '¿Cuáles son los horarios de atención?',
      response: 'Nuestro horario de atención es de Lunes a Viernes de 8:00 a 18:00 y Sábados de 8:00 a 12:00. ¿Necesitas más información?',
      nextOptions: [
        { id: 'horarios-detalle', text: '¿Atienden domingos?', response: 'No, los domingos estamos cerrados. Puedes contactarnos por WhatsApp para dejar tu pedido.' },
        { id: 'horarios-fin', text: 'Gracias, eso es todo', response: '¡De nada! Estamos para ayudarte cuando lo necesites.' },
      ],
    },
    {
      id: 'envios',
      text: '¿Hacen envíos a domicilio?',
      response: 'Sí, realizamos envíos a domicilio dentro de la zona de cobertura. ¿Qué más te gustaría saber?',
      nextOptions: [
        { id: 'envios-costo', text: '¿Cuál es el costo de envío?', response: 'El costo de envío depende de la zona y el pedido. Te daremos el monto al confirmar tu cotización.' },
        { id: 'envios-tiempo', text: '¿En cuánto tiempo llega?', response: 'Generalmente en 24-48 horas hábiles después de confirmar tu pedido.' },
        { id: 'envios-fin', text: 'Perfecto, gracias', response: '¡De nada! Cualquier duda estamos aquí.' },
      ],
    },
    {
      id: 'productos',
      text: '¿Qué productos ofrecen?',
      response: 'Ofrecemos cemento, tubos PVC, pintura, y más materiales de construcción. Puedes explorar nuestro catálogo en la página principal. ¿Quieres ver algo específico?',
      nextOptions: [
        { id: 'prod-cemento', text: 'Precios de cemento', response: 'Te invitamos a revisar nuestro catálogo de cementos o generar una cotización desde el carrito. Los precios varían según marca y cantidad.' },
        { id: 'prod-pvc', text: 'Tubos y accesorios PVC', response: 'Tenemos tubos PVC de diferentes medidas y accesorios. Revisa la categoría PVC en el menú o solicita una cotización.' },
        { id: 'prod-fin', text: 'Entendido', response: '¡Perfecto! Si necesitas cotizar, agrega productos al carrito y genera tu cotización.' },
      ],
    },
    {
      id: 'pago',
      text: '¿Qué métodos de pago aceptan?',
      response: 'Aceptamos efectivo, transferencia bancaria y tarjetas de crédito/débito. ¿Algo más?',
      nextOptions: [
        { id: 'pago-cuotas', text: '¿Puedo pagar a cuotas?', response: 'Sí, ofrecemos planes de pago según el monto. Consulta con nuestro equipo al confirmar tu pedido.' },
        { id: 'pago-fin', text: 'Gracias', response: '¡De nada! Estamos para servirte.' },
      ],
    },
    {
      id: 'ubicacion',
      text: '¿Dónde están ubicados?',
      response: 'Estamos en [dirección]. Puedes ver nuestra ubicación exacta en la sección "Ubicación" del menú. ¿Necesitas indicaciones?',
      nextOptions: [
        { id: 'ubica-mapa', text: '¿Tienen mapa o Waze?', response: 'Sí, en la página de Ubicación encontrarás un enlace a Google Maps para llegar fácilmente.' },
        { id: 'ubica-fin', text: 'Listo, gracias', response: '¡Nos vemos pronto!' },
      ],
    },
    {
      id: 'cotizacion',
      text: '¿Cómo obtengo una cotización?',
      response: 'Agrega los productos que necesitas al carrito, luego ve a "Ver carrito" y genera tu cotización. Te dará un link para enviar por WhatsApp o compartir. ¿Alguna duda del proceso?',
      nextOptions: [
        { id: 'coti-whatsapp', text: '¿Puedo cotizar por WhatsApp?', response: 'Sí, genera la cotización desde el carrito y se creará un enlace para enviar por WhatsApp. Nuestro equipo te atenderá.' },
        { id: 'coti-fin', text: 'Perfecto', response: '¡Genial! Cualquier duda estamos aquí.' },
      ],
    },
  ];

  /** Registrar que se hizo clic en una opción (para reporte FAQ) */
  recordClick(optionId: string, text: string): void {
    const raw = localStorage.getItem(STORAGE_FAQ_KEY);
    let clicks: { id: string; text: string; count: number }[] = [];
    if (raw) {
      try {
        clicks = JSON.parse(raw);
      } catch {
        clicks = [];
      }
    }
    const existing = clicks.find((c) => c.id === optionId);
    if (existing) {
      existing.count += 1;
    } else {
      clicks.push({ id: optionId, text, count: 1 });
    }
    localStorage.setItem(STORAGE_FAQ_KEY, JSON.stringify(clicks));
  }

  /** Obtener preguntas más frecuentes para reportes */
  getPreguntasFrecuentes(): { pregunta: string; veces: number }[] {
    const raw = localStorage.getItem(STORAGE_FAQ_KEY);
    if (!raw) return [];
    try {
      const clicks: { id: string; text: string; count: number }[] = JSON.parse(raw);
      return clicks
        .map((c) => ({ pregunta: c.text, veces: c.count }))
        .sort((a, b) => b.veces - a.veces)
        .slice(0, 10);
    } catch {
      return [];
    }
  }
}
