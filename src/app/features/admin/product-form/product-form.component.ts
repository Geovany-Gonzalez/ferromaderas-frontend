import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CatalogService, FEATURED_LIMIT } from '../../../core/services/catalog.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Product } from '../../../core/models/product.model';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss',
})
export class ProductFormComponent implements OnInit {
  readonly FEATURED_LIMIT = FEATURED_LIMIT;
  isEditing = false;
  previewImage = '';
  productForm: Partial<Product> = {
    code: '',
    name: '',
    categoryId: '',
    price: 0,
    imageUrl: '',
    description: '',
    featured: false,
    active: true,
  };
  categories: Category[] = [];
  /** Si estamos editando, si el producto ya estaba en destacados al cargar. */
  private originalFeatured = false;

  constructor(
    private catalogService: CatalogService,
    private router: Router,
    private route: ActivatedRoute,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.categories = this.catalogService.getAllCategories().filter((c) => c.active !== false);
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const product = this.catalogService.getProducts().find((p) => p.id === id);
      if (product) {
        this.isEditing = true;
        this.originalFeatured = product.featured === true;
        this.productForm = { ...product };
        this.previewImage = product.imageUrl || '';
      }
    } else {
      this.productForm.code = this.catalogService.getNextProductCode();
    }
  }

  /** Permitir marcar como destacado solo si hay cupo o ya estaba destacado al editar. */
  get canMarkAsFeatured(): boolean {
    if (this.productForm.featured) return true;
    const count = this.catalogService.getFeaturedCount();
    if (this.isEditing && this.originalFeatured) return true;
    return count < FEATURED_LIMIT;
  }

  backToList(): void {
    this.router.navigate(['/admin/productos']);
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
          this.productForm.imageUrl = e.target.result as string;
          this.previewImage = e.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  saveProduct(): void {
    if (!this.isEditing) {
      this.productForm.code = this.catalogService.getNextProductCode();
    }
    if (!this.productForm.code?.trim()) {
      this.notification.showMessage('El código del producto es requerido', 'error');
      return;
    }
    if (!this.productForm.name?.trim()) {
      this.notification.showMessage('El nombre del producto es requerido', 'error');
      return;
    }
    if (!this.productForm.categoryId) {
      this.notification.showMessage('Debes seleccionar una categoría', 'error');
      return;
    }
    if (this.productForm.price == null || this.productForm.price <= 0) {
      this.notification.showMessage('El precio debe ser mayor a 0.', 'error');
      return;
    }
    if (!this.productForm.imageUrl?.trim()) {
      this.notification.showMessage('La imagen del producto es requerida', 'error');
      return;
    }
    if (this.productForm.featured) {
      const featuredCount = this.catalogService.getFeaturedCount();
      const wouldExceedLimit = featuredCount >= FEATURED_LIMIT && !(this.isEditing && this.originalFeatured);
      if (wouldExceedLimit) {
        this.notification.showMessage(
          `Ya hay ${FEATURED_LIMIT} productos destacados. Quita uno desde la página Destacados o desmarca este para poder guardar.`,
          'error'
        );
        return;
      }
    }
    if (this.isEditing && this.productForm.id) {
      this.catalogService.updateProduct(this.productForm.id, {
        code: this.productForm.code,
        name: this.productForm.name,
        categoryId: this.productForm.categoryId,
        price: Number(this.productForm.price),
        imageUrl: this.productForm.imageUrl,
        description: this.productForm.description,
        featured: this.productForm.featured,
        active: this.productForm.active,
      });
    } else {
      this.catalogService.addProduct({
        code: this.productForm.code!,
        name: this.productForm.name!,
        categoryId: this.productForm.categoryId!,
        price: Number(this.productForm.price),
        imageUrl: this.productForm.imageUrl!,
        description: this.productForm.description,
        featured: this.productForm.featured ?? false,
        active: this.productForm.active !== false,
      });
    }
    this.notification.showMessage(this.isEditing ? 'Producto actualizado.' : 'Producto creado.', 'success');
    this.router.navigate(['/admin/productos']);
  }
}
