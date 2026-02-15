import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WHATSAPP_CONTACT_URL } from '../../../core/constants/whatsapp';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  whatsAppUrl = WHATSAPP_CONTACT_URL;
}
