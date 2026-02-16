import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app';
import { routes } from './app/app.routes';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { loadGtm } from './app/core/gtm/gtm-loader';

loadGtm();

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideCharts(withDefaultRegisterables()),
  ],
});
