import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatalogService } from '../../../core/services/catalog.service';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-categories-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories-admin.component.html',
  styleUrls: ['./categories-admin.component.scss']
})
export class CategoriesAdminComponent implements OnInit {
  categories: Category[] = [];
  showModal = false;
  isEditing = false;
  previewImage: string = '';
  
  categoryForm: Partial<Category> = {
    name: '',
    description: '',
    imageUrl: '',
    active: true
  };

  constructor(private catalogService: CatalogService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categories = this.catalogService.getAllCategories();
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.categoryForm = {
      name: '',
      description: '',
      imageUrl: '',
      active: true
    };
    this.previewImage = '';
    this.showModal = true;
  }

  openEditModal(category: Category): void {
    this.isEditing = true;
    this.categoryForm = { ...category };
    this.previewImage = category.imageUrl;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.categoryForm = {
      name: '',
      description: '',
      imageUrl: '',
      active: true
    };
    this.previewImage = '';
  }

  onImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validar formato de archivo
      const allowedFormats = ['image/webp', 'image/jpeg', 'image/jpg'];
      if (!allowedFormats.includes(file.type)) {
        alert('Formato de imagen no permitido. Solo se aceptan archivos WebP (.webp) o JPG (.jpg, .jpeg)');
        input.value = ''; // Limpiar el input
        return;
      }
      
      // Validar tamaño (opcional: máximo 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('La imagen es demasiado grande. El tamaño máximo permitido es 5MB');
        input.value = '';
        return;
      }
      
      const reader = new FileReader();
      
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          this.categoryForm.imageUrl = e.target.result as string;
          this.previewImage = e.target.result as string;
        }
      };
      
      reader.readAsDataURL(file);
    }
  }

  saveCategory(): void {
    if (!this.categoryForm.name?.trim()) {
      alert('El nombre de la categoría es requerido');
      return;
    }

    if (!this.categoryForm.imageUrl?.trim()) {
      alert('La imagen de la categoría es requerida');
      return;
    }

    if (this.isEditing && this.categoryForm.id) {
      // Actualizar categoría existente
      this.catalogService.updateCategory(this.categoryForm.id, {
        name: this.categoryForm.name,
        description: this.categoryForm.description,
        imageUrl: this.categoryForm.imageUrl,
        slug: this.catalogService.generateSlug(this.categoryForm.name),
        active: this.categoryForm.active
      });
    } else {
      // Crear nueva categoría
      this.catalogService.addCategory({
        name: this.categoryForm.name!,
        description: this.categoryForm.description,
        imageUrl: this.categoryForm.imageUrl!,
        slug: this.catalogService.generateSlug(this.categoryForm.name!),
        active: this.categoryForm.active ?? true
      });
    }

    this.loadCategories();
    this.closeModal();
  }

  deleteCategory(category: Category): void {
    const confirmDelete = confirm(
      `¿Estás seguro de que deseas eliminar la categoría "${category.name}"?\n\n` +
      'Si hay productos asociados, la categoría se marcará como inactiva en lugar de eliminarse.'
    );

    if (confirmDelete) {
      this.catalogService.deleteCategory(category.id);
      this.loadCategories();
    }
  }

  toggleCategoryStatus(category: Category): void {
    this.catalogService.updateCategory(category.id, {
      active: !category.active
    });
    this.loadCategories();
  }

  trackById(index: number, category: Category): string {
    return category.id;
  }
}
