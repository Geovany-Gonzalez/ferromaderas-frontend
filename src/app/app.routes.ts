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
        path: 'categoria/:slug',
        loadComponent: () =>
          import('./features/public/category-detail/category-detail.component').then(m => m.CategoryDetailComponent),
      },
      {
        path: 'ubicacion',
        loadComponent: () =>
          import('./features/public/location/location.component').then(m => m.LocationComponent),
      },
      {
        path: 'politicas',
        loadComponent: () =>
          import('./features/public/policies/policies.component').then(m => m.PoliciesComponent),
      },
    ],
  },
  {
    path: 'admin-login',
    loadComponent: () =>
      import('./features/admin/admin-login/admin-login.component').then(m => m.AdminLoginComponent),
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./layouts/admin-layout/admin-layout').then(m => m.AdminLayout),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'categorias',
        loadComponent: () =>
          import('./features/admin/categories-admin/categories-admin.component').then(m => m.CategoriesAdminComponent),
      },
      // Rutas futuras para otras secciones administrativas
      // {
      //   path: 'productos',
      //   loadComponent: () => import('./features/admin/productos/productos.component').then(m => m.ProductosComponent),
      // },
    ],
  },
  { path: '**', redirectTo: '' },
];
