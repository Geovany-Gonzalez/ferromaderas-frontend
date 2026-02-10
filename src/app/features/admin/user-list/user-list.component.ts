import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../core/services/notification.service';

export type UserRole = 'vendedor' | 'administrador';
export type UserStatus = 'activo' | 'inactivo';

export interface ListUser {
  id: string;
  username: string;
  nombre: string;
  rol: UserRole;
  ultimoAcceso: string;
  estado: UserStatus;
}

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
})
export class UserListComponent {
  searchTerm = '';
  filterRol: UserRole | '' = '';
  filterEstado: UserStatus | '' = '';

  /** Modal Ver usuario */
  viewModalUser: ListUser | null = null;
  /** Popup cambiar contraseña */
  passwordModalUser: ListUser | null = null;
  generatedPassword = '';
  showPasswordInModal = false;

  constructor(
    private router: Router,
    private notification: NotificationService
  ) {}

  roles: { value: UserRole | ''; label: string }[] = [
    { value: '', label: 'Rol' },
    { value: 'vendedor', label: 'Vendedor' },
    { value: 'administrador', label: 'Administrador' },
  ];

  statusOptions: { value: UserStatus | ''; label: string }[] = [
    { value: '', label: 'Estado' },
    { value: 'activo', label: 'Activo' },
    { value: 'inactivo', label: 'Inactivo' },
  ];

  /** Datos de ejemplo; reemplazar por llamada al servicio */
  users: ListUser[] = [
    { id: '1', username: 'juan1', nombre: 'Juan Perez', rol: 'administrador', ultimoAcceso: '25/01/2026', estado: 'activo' },
    { id: '2', username: 'pedro1', nombre: 'Pedro Catalan', rol: 'vendedor', ultimoAcceso: '22/02/2026', estado: 'activo' },
  ];

  get filteredUsers(): ListUser[] {
    return this.users.filter((u) => {
      const matchSearch = !this.searchTerm || u.username.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        u.nombre.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchRol = !this.filterRol || u.rol === this.filterRol;
      const matchEstado = !this.filterEstado || u.estado === this.filterEstado;
      return matchSearch && matchRol && matchEstado;
    });
  }

  viewUser(user: ListUser): void {
    this.viewModalUser = user;
  }

  closeViewModal(): void {
    this.viewModalUser = null;
  }

  editUser(user: ListUser): void {
    this.router.navigate(['/admin/usuarios/crear'], { state: { editingUser: user } });
  }

  toggleEstado(user: ListUser): void {
    const accion = user.estado === 'activo' ? 'desactivar' : 'activar';
    this.notification.confirm('Confirmar', `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} a ${user.nombre}?`).then((ok) => {
      if (ok) {
        user.estado = user.estado === 'activo' ? 'inactivo' : 'activo';
        this.notification.showMessage(`Estado de ${user.nombre} actualizado a ${user.estado === 'activo' ? 'Activo' : 'Inactivo'}.`, 'success');
      }
    });
  }

  changePassword(user: ListUser): void {
    this.passwordModalUser = user;
    this.generatedPassword = '';
    this.showPasswordInModal = false;
  }

  closePasswordModal(): void {
    this.passwordModalUser = null;
    this.generatedPassword = '';
  }

  generatePasswordForModal(): void {
    const length = 12;
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
    let pass = '';
    for (let i = 0; i < length; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.generatedPassword = pass;
  }

  copyPasswordModal(): void {
    if (!this.generatedPassword) return;
    navigator.clipboard.writeText(this.generatedPassword);
    this.notification.showMessage('Contraseña copiada al portapapeles.', 'success');
  }

  confirmPasswordChange(): void {
    if (!this.passwordModalUser || !this.generatedPassword) return;
    const msg = `¿Confirmar que desea guardar esta nueva contraseña para ${this.passwordModalUser.nombre}? El usuario deberá usarla en el próximo inicio de sesión.`;
    this.notification.confirm('Guardar contraseña', msg).then((ok) => {
      if (ok) {
        // TODO: enviar al backend para persistir (hashear y guardar).
        this.notification.showMessage('Contraseña actualizada. Conectar con el backend para persistir.', 'success');
        this.closePasswordModal();
      }
    });
  }

  rolLabel(rol: UserRole): string {
    return rol === 'administrador' ? 'Administrador' : 'Vendedor';
  }

  userTrackBy(_index: number, user: ListUser): string {
    return user.id;
  }
}
