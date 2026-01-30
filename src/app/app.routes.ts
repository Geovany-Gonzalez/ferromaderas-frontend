import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { HomeComponent } from './features/public/home/home.component';
import { AdminLoginComponent } from './features/admin/admin-login/admin-login.component';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'catalogo', loadComponent: () => import('./features/public/home/home.component').then(m => m.HomeComponent) }, // placeholder
      { path: 'ubicacion', loadComponent: () => import('./features/public/home/home.component').then(m => m.HomeComponent) }, // placeholder
      { path: 'carrito', loadComponent: () => import('./features/public/home/home.component').then(m => m.HomeComponent) }, // placeholder
      { path: 'politicas', loadComponent: () => import('./features/public/home/home.component').then(m => m.HomeComponent) }, // placeholder
    ]
  },

  { path: 'admin-login', component: AdminLoginComponent },

  { path: '**', redirectTo: '' },
];
