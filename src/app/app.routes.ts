import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layouts/public-layout/public-layout.component').then(m => m.PublicLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/public/home/home.component').then(m => m.HomeComponent),
      },
      {
        path: 'categorias',
        loadComponent: () =>
          import('./features/public/categories/categories.component').then(m => m.CategoriesComponent),
      },
      {
        path: 'ubicacion',
        loadComponent: () =>
          import('./features/public/location/location.component').then(m => m.LocationComponent),
      },
    ],
  },
  {
    path: 'admin-login',
    loadComponent: () =>
      import('./features/admin/admin-login/admin-login.component').then(m => m.AdminLoginComponent),
  },
  { path: '**', redirectTo: '' },
];
