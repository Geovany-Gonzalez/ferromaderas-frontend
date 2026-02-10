import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CatalogService } from '../../../core/services/catalog.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './category-form.component.html',
  styleUrl: './category-form.component.scss',
})
export class CategoryFormComponent implements OnInit {
  isEditing = false;
  previewImage = '';
  categoryForm: Partial<Category> = {
    name: '',
    description: '',
    imageUrl: '',
    active: true,
  };

  constructor(
    private catalogService: CatalogService,
    private router: Router,
    private route: ActivatedRoute,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const category = this.catalogService.getCategoryById(id);
      if (category) {
        this.isEditing = true;
        this.categoryForm = { ...category };
        this.previewImage = category.imageUrl || '';
      }
    }
  }

  backToList(): void {
    this.router.navigate(['/admin/categorias']);
  }

  onImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length && input.files[0]) {
      const file = input.files[0];
      const allowedFormats = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedFormats.includes(file.type)) {
        this.notification.showMessage('Formato de imagen no permitido. Solo se aceptan archivos .png, .jpg o .jpeg', 'error');
        input.value = '';
        return;
      }
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        this.notification.showMessage('La imagen es demasiado grande. El tamaño máximo permitido es 5MB', 'error');
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
      this.notification.showMessage('El nombre de la categoría es requerido', 'error');
      return;
    }
    if (!this.categoryForm.imageUrl?.trim()) {
      this.notification.showMessage('La imagen de la categoría es requerida', 'error');
      return;
    }
    if (this.isEditing && this.categoryForm.id) {
      this.catalogService.updateCategory(this.categoryForm.id, {
        name: this.categoryForm.name,
        description: this.categoryForm.description,
        imageUrl: this.categoryForm.imageUrl,
        slug: this.catalogService.generateSlug(this.categoryForm.name),
        active: this.categoryForm.active,
      });
    } else {
      this.catalogService.addCategory({
        name: this.categoryForm.name!,
        description: this.categoryForm.description,
        imageUrl: this.categoryForm.imageUrl!,
        slug: this.catalogService.generateSlug(this.categoryForm.name!),
        active: this.categoryForm.active ?? true,
      });
    }
    this.notification.showMessage(this.isEditing ? 'Categoría actualizada.' : 'Categoría creada.', 'success');
    this.router.navigate(['/admin/categorias']);
  }
}
