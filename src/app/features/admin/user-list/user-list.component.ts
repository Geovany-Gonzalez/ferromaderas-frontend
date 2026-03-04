import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../core/services/notification.service';
import {
  UsersService,
  type ListUser,
  type UserRole,
  type UserStatus,
} from '../../../core/services/users.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
})
export class UserListComponent implements OnInit {
  searchTerm = '';
  filterRol: UserRole | '' = '';
  filterEstado: UserStatus | '' = '';
  users: ListUser[] = [];
  loading = true;

  viewModalUser: ListUser | null = null;

  constructor(
    private router: Router,
    private notification: NotificationService,
    private usersService: UsersService
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

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.usersService
      .list({
        search: this.searchTerm || undefined,
        rol: this.filterRol || undefined,
        estado: this.filterEstado || undefined,
      })
      .subscribe({
        next: (data) => {
          this.users = data;
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          this.notification.showMessage(
            err?.error?.message || 'Error al cargar usuarios',
            'error'
          );
        },
      });
  }

  get filteredUsers(): ListUser[] {
    return this.users.filter((u) => {
      const matchSearch =
        !this.searchTerm ||
        u.username.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
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
    this.router.navigate(['/admin/usuarios/crear'], {
      state: {
        editingUser: {
          id: user.id,
          nombre: user.nombre,
          username: user.username,
          email: user.email,
          rol: user.rol,
          estado: user.estado,
        },
      },
    });
  }

  toggleEstado(user: ListUser): void {
    const accion = user.estado === 'activo' ? 'desactivar' : 'activar';
    this.notification
      .confirm('Confirmar', `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} a ${user.nombre}?`)
      .then((ok) => {
        if (!ok) return;
        const newStatus = user.estado === 'activo' ? 'inactivo' : 'activo';
        this.usersService.update(user.id, { status: newStatus }).subscribe({
          next: () => {
            user.estado = newStatus;
            this.notification.showMessage(
              `Estado de ${user.nombre} actualizado.`,
              'success'
            );
          },
          error: (err) =>
            this.notification.showMessage(
              err?.error?.message || 'Error al actualizar',
              'error'
            ),
        });
      });
  }

  rolLabel(rol: UserRole): string {
    return rol === 'administrador' ? 'Administrador' : 'Vendedor';
  }

  userTrackBy(_index: number, user: ListUser): string {
    return user.id;
  }
}
