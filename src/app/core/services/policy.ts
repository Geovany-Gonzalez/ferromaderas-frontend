import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Policy {
  title: string;
  content: string[];
  icon: string;
}

@Injectable({
  providedIn: 'root'
})
export class PolicyService {

  private policies = new BehaviorSubject<Policy[]>([
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
  ]);

  getPolicies() {
    return this.policies.asObservable();
  }

  updatePolicies(policies: Policy[]) {
    this.policies.next(policies);
  }

}