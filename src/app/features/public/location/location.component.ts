import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-location',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss']
})
export class LocationComponent {
  // URL de Google Maps Directions con destino prellenado
  googleMapsUrl = 'https://maps.app.goo.gl/HfS4izeNGWyK8REo8';
  
  // URL del iframe embebido
  mapEmbedUrl: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {
    // 14°28'51.2"N 90°36'57.1"W = 14.480889, -90.615861
    // Iframe de mapa normal (no Street View) centrado en estas coordenadas
    const embedUrl = 'https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d241.26444652961332!2d-90.615861!3d14.480889!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMTTCsDI4JzUxLjIiTiA5MMKwMzYnNTcuMSJX!5e0!3m2!1ses!2sgt!4v1706000000000!5m2!1ses!2sgt';
    this.mapEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  openInGoogleMaps(): void {
    window.open(this.googleMapsUrl, '_blank');
  }
}
