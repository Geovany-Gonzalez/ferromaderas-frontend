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
      {
        path: 'carrito',
        loadComponent: () =>
          import('./features/public/cart/cart.component').then(m => m.CartComponent),
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
        redirectTo: '/admin/dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'productos/crear',
        loadComponent: () =>
          import('./features/admin/product-form/product-form.component').then(m => m.ProductFormComponent),
      },
      {
        path: 'productos/editar/:id',
        loadComponent: () =>
          import('./features/admin/product-form/product-form.component').then(m => m.ProductFormComponent),
      },
      {
        path: 'productos',
        loadComponent: () =>
          import('./features/admin/products-admin/products-admin.component').then(m => m.ProductsAdminComponent),
      },
      {
        path: 'categorias/editar/:id',
        loadComponent: () =>
          import('./features/admin/category-form/category-form.component').then(m => m.CategoryFormComponent),
      },
      {
        path: 'categorias/crear',
        loadComponent: () =>
          import('./features/admin/category-form/category-form.component').then(m => m.CategoryFormComponent),
      },
      {
        path: 'categorias',
        loadComponent: () =>
          import('./features/admin/categories-admin/categories-admin.component').then(m => m.CategoriesAdminComponent),
      },
      {
        path: 'destacados',
        loadComponent: () =>
          import('./features/admin/featured-admin/featured-admin.component').then(m => m.FeaturedAdminComponent),
      },
      {
        path: 'cotizaciones',
        loadComponent: () =>
          import('./features/admin/quotations-admin/quotations-admin.component').then(m => m.QuotationsAdminComponent),
      },
      {
        path: 'politicas',
        loadComponent: () =>
          import('./features/admin/policies-admin/policies-admin').then(m => m.PoliciesAdminComponent),
      },
      {
        path: 'usuarios/crear',
        loadComponent: () =>
          import('./features/admin/users-admin/users-admin.component').then(m => m.UsersAdminComponent),
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./features/admin/user-list/user-list.component').then(m => m.UserListComponent),
      },
      // Rutas futuras para otras secciones administrativas
      // {
      //   path: 'productos',
      //   loadComponent: () => import('./features/admin/productos/productos.component').then(m => m.ProductosComponent),
      // },
    ],
  },
  { path: '**', redirectTo: '/' },
];
