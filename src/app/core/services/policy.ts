import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Policy {
  title: string;
  content: string[];
  icon: string;
}

export interface PolicyPage {
  title: string;
  subtitle: string;
  policies: Policy[];
}

const STORAGE_KEY = 'ferromaderas_policy_page';
/** Siempre mostramos exactamente 6 políticas en público y admin. */
const POLICY_COUNT = 6;

const DEFAULT_POLICY_PAGE: PolicyPage = {
  title: 'Políticas de compra',
  subtitle: 'Leé estas condiciones antes de confirmar tu pedido por WhatsApp.',
  policies: [
    {
      title: 'Precios y vigencia',
      icon: '/assets/icons/placeholder-price.png',
      content: [
        'Los precios pueden variar sin previo aviso.',
        'La cotización se confirma al finalizar por WhatsApp.'
      ]
    },
    {
      title: 'Envío y flete',
      icon: '/assets/icons/placeholder-delivery.png',
      content: [
        'El flete depende de zona/distancia/productos.',
        'Se confirma antes de cerrar el pedido.'
      ]
    },
    {
      title: 'Cambios y devoluciones',
      icon: '/assets/icons/placeholder-returns.png',
      content: [
        'No se aceptan cambios ni devoluciones tras la entrega.',
        'Aplica revisión al recibir.'
      ]
    },
    {
      title: 'Disponibilidad',
      icon: '/assets/icons/placeholder-stock.png',
      content: [
        'Productos sujetos a stock.',
        'Si se agota el producto, el vendedor por vía Whatsapp te ofrecerá la mejor alternativa.'
      ]
    },
    {
      title: 'Métodos de pago',
      icon: '/assets/icons/placeholder-payment.png',
      content: [
        'Los métodos de pago son únicamente los siguientes:',
        'Efectivo.',
        'Transferencia'
      ]
    },
    {
      title: 'Horarios',
      icon: '/assets/icons/placeholder-schedule.png',
      content: [
        'Lunes a sábado 7:30 am – 5:30 pm.',
        'Fuera de horario se atiende el siguiente día hábil.'
      ]
    }
  ]
};

@Injectable({
  providedIn: 'root'
})
export class PolicyService {

  private policyPage = new BehaviorSubject<PolicyPage>(this.loadFromStorage());

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e: StorageEvent) => {
        if (e.key === STORAGE_KEY && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue) as PolicyPage;
            if (parsed?.title != null && Array.isArray(parsed?.policies)) {
              this.policyPage.next(parsed);
            }
          } catch (_) {}
        }
      });
    }
  }

  /** Siempre devuelve exactamente POLICY_COUNT (6) políticas, fusionando con la estructura por defecto. */
  private loadFromStorage(): PolicyPage {
    const defaultCopy = () => JSON.parse(JSON.stringify(DEFAULT_POLICY_PAGE));
    const defaultPolicies = DEFAULT_POLICY_PAGE.policies;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PolicyPage;
        const title = parsed?.title != null ? parsed.title : DEFAULT_POLICY_PAGE.title;
        const subtitle = parsed?.subtitle != null ? parsed.subtitle : DEFAULT_POLICY_PAGE.subtitle;
        // Construir siempre 6 políticas: por índice se toma lo guardado o el valor por defecto
        const policies: Policy[] = [];
        for (let i = 0; i < POLICY_COUNT; i++) {
          const def = defaultPolicies[i];
          const stored = parsed?.policies?.[i];
          if (stored && typeof stored.title === 'string') {
            policies.push({
              title: stored.title,
              icon: typeof stored.icon === 'string' ? stored.icon : (def?.icon ?? ''),
              content: Array.isArray(stored.content) ? [...stored.content] : (def?.content ? [...def.content] : [])
            });
          } else {
            policies.push(JSON.parse(JSON.stringify(def)));
          }
        }
        return { title, subtitle, policies };
      }
    } catch (_) {}
    return defaultCopy();
  }

  getPolicyPage() {
    return this.policyPage.asObservable();
  }

  /** Devuelve siempre una copia de la página por defecto (para asegurar que el admin tenga qué editar). */
  getDefaultPolicyPage(): PolicyPage {
    return JSON.parse(JSON.stringify(DEFAULT_POLICY_PAGE));
  }

  /** Valor actual de políticas (misma fuente que el sitio público). Siempre máximo 6. */
  getPolicyPageSnapshot(): PolicyPage {
    const current = this.policyPage.getValue();
    if (!current?.policies?.length) {
      const fixed = this.loadFromStorage();
      if (!fixed.policies?.length) {
        const defaultPage = this.getDefaultPolicyPage();
        this.policyPage.next(defaultPage);
        return JSON.parse(JSON.stringify(defaultPage));
      }
      this.policyPage.next(fixed);
      return JSON.parse(JSON.stringify(fixed));
    }
    if (current.policies.length > POLICY_COUNT) {
      const fixed: PolicyPage = {
        title: current.title,
        subtitle: current.subtitle,
        policies: current.policies.slice(0, POLICY_COUNT)
      };
      this.policyPage.next(fixed);
      return JSON.parse(JSON.stringify(fixed));
    }
    return JSON.parse(JSON.stringify(current));
  }

  updatePolicyPage(policyPage: PolicyPage) {
    const copy = JSON.parse(JSON.stringify(policyPage));
    copy.policies = (copy.policies || []).slice(0, POLICY_COUNT);
    const defaultPolicies = DEFAULT_POLICY_PAGE.policies;
    while (copy.policies.length < POLICY_COUNT) {
      const idx = copy.policies.length;
      copy.policies.push(JSON.parse(JSON.stringify(defaultPolicies[idx] || defaultPolicies[0])));
    }
    const toEmit = JSON.parse(JSON.stringify(copy));
    this.policyPage.next(toEmit);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(copy));
    } catch (_) {}
  }

}