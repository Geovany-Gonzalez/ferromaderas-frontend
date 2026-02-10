import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';

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
  phone = '';
  role: UserRole = 'vendedor';
  status: 'activo' | 'inactivo' = 'activo';
  profileImage: string | null = null;
  /** Contraseña en claro solo en memoria; el backend debe hashearla antes de guardar (ej. bcrypt). */
  temporaryPassword = '';
  showPassword = false;
  /** true cuando se llega desde "Editar" en el listado */
  isEditingUser = false;

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
    private notification: NotificationService
  ) {
    const state = this.router.getCurrentNavigation()?.extras?.state as { editingUser?: { nombre: string; username: string; rol: UserRole; estado: 'activo' | 'inactivo' } } | undefined;
    if (state?.editingUser) {
      const u = state.editingUser;
      this.isEditingUser = true;
      this.fullName = u.nombre;
      this.username = u.username;
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
      this.notification.showMessage('El username es requerido.', 'error');
      return;
    }
    if (!this.isEditingUser && !this.temporaryPassword) {
      this.notification.showMessage('Genere una contraseña temporal antes de guardar.', 'error');
      return;
    }
    // TODO: enviar al backend; el backend debe hashear la contraseña (ej. bcrypt) antes de guardar.
    const message = this.isEditingUser ? 'Usuario actualizado.' : 'Usuario creado.';
    this.notification.showMessage(message, 'success');
    this.router.navigate(['/admin/usuarios']);
  }

  cancel(): void {
    this.router.navigate(['/admin/usuarios']);
  }
}
