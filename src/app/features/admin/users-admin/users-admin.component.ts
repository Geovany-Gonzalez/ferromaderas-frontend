import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { UsersService } from '../../../core/services/users.service';

export type UserRole = 'vendedor' | 'administrador';

export interface RolePermission {
  label: string;
  allowed: boolean;
}

@Component({
  selector: 'app-users-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users-admin.component.html',
  styleUrl: './users-admin.component.scss',
})
export class UsersAdminComponent {
  fullName = '';
  username = '';
  email = '';
  phone = '';
  role: UserRole = 'vendedor';
  status: 'activo' | 'inactivo' = 'activo';
  profileImage: string | null = null;
  temporaryPassword = '';
  showPassword = false;
  isEditingUser = false;
  editingUserId: string | null = null;

  roles: { value: UserRole; label: string }[] = [
    { value: 'vendedor', label: 'Vendedor' },
    { value: 'administrador', label: 'Administrador' },
  ];

  statusOptions: { value: 'activo' | 'inactivo'; label: string }[] = [
    { value: 'activo', label: 'Activo' },
    { value: 'inactivo', label: 'Inactivo' },
  ];

  /** Permisos por rol para la sección "Permisos visibles" */
  vendedorPermissions: RolePermission[] = [
    { label: 'Gestionar productos', allowed: false },
    { label: 'Gestionar categorías', allowed: false },
    { label: 'Gestionar destacados', allowed: false },
    { label: 'Ver cotizaciones y cambiar estado', allowed: true },
    { label: 'Crear usuarios / Resetear contraseñas', allowed: false },
  ];

  adminPermissions: RolePermission[] = [
    { label: 'Gestionar productos', allowed: true },
    { label: 'Gestionar categorías', allowed: true },
    { label: 'Gestionar destacados', allowed: true },
    { label: 'Ver cotizaciones y cambiar estado', allowed: true },
    { label: 'Crear usuarios / Resetear contraseñas', allowed: true },
  ];

  constructor(
    private router: Router,
    private notification: NotificationService,
    private usersService: UsersService
  ) {
    const state = this.router.getCurrentNavigation()?.extras?.state as {
      editingUser?: {
        id: string;
        nombre: string;
        username: string;
        email?: string;
        rol: UserRole;
        estado: 'activo' | 'inactivo';
      };
    } | undefined;
    if (state?.editingUser) {
      const u = state.editingUser;
      this.isEditingUser = true;
      this.editingUserId = u.id;
      this.fullName = u.nombre;
      this.username = u.username;
      this.email = u.email ?? '';
      this.role = u.rol;
      this.status = u.estado;
    }
  }

  onImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length && input.files[0]) {
      const file = input.files[0];
      const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowed.includes(file.type)) {
        this.notification.showMessage('Solo se permiten imágenes .jpg, .jpeg o .png', 'error');
        input.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) this.profileImage = e.target.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  generatePassword(): void {
    const length = 12;
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
    let pass = '';
    for (let i = 0; i < length; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.temporaryPassword = pass;
  }

  copyPassword(): void {
    if (!this.temporaryPassword) return;
    navigator.clipboard.writeText(this.temporaryPassword).then(() => {
      // Opcional: toast o mensaje "Copiado"
    });
  }

  regeneratePassword(): void {
    this.generatePassword();
  }

  save(): void {
    if (!this.fullName?.trim()) {
      this.notification.showMessage('El nombre completo es requerido.', 'error');
      return;
    }
    if (!this.username?.trim()) {
      this.notification.showMessage('El usuario es requerido.', 'error');
      return;
    }
    if (this.isEditingUser) {
      this.usersService
        .update(this.editingUserId!, {
          name: this.fullName,
          email: this.email?.trim() || undefined,
          phone: this.phone || undefined,
          role: this.role,
          status: this.status,
        })
        .subscribe({
          next: () => {
            this.notification.showMessage('Usuario actualizado.', 'success');
            this.router.navigate(['/admin/usuarios']);
          },
          error: (err) =>
            this.notification.showMessage(
              err?.error?.message || 'Error al actualizar',
              'error'
            ),
        });
    } else {
      if (!this.email?.trim()) {
        this.notification.showMessage('El correo es requerido.', 'error');
        return;
      }
      if (!this.temporaryPassword) {
        this.notification.showMessage(
          'Genere una contraseña temporal antes de guardar.',
          'error'
        );
        return;
      }
      this.usersService
        .create({
          username: this.username.trim(),
          email: this.email.trim(),
          password: this.temporaryPassword,
          name: this.fullName.trim(),
          phone: this.phone || undefined,
          role: this.role,
          status: this.status,
        })
        .subscribe({
          next: () => {
            this.notification.showMessage('Usuario creado.', 'success');
            this.router.navigate(['/admin/usuarios']);
          },
          error: (err) =>
            this.notification.showMessage(
              err?.error?.message || 'Error al crear usuario',
              'error'
            ),
        });
    }
  }

  cancel(): void {
    this.router.navigate(['/admin/usuarios']);
  }
}
