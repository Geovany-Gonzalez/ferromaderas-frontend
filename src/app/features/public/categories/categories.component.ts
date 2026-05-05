import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { CatalogService } from '../../../core/services/catalog.service';
import { Category } from '../../../core/models/category.model';
import { WHATSAPP_CONTACT_URL } from '../../../core/constants/whatsapp';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {
  readonly whatsAppUrl = WHATSAPP_CONTACT_URL;
  readonly categoryPlaceholderImg = '/assets/icons/logo.png';

  categories: Category[] = [];
  searchTerm = '';
  loading = true;
  loadError = false;

  constructor(
    private catalogService: CatalogService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.catalogService
      .loadCategories()
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: () => {
          this.categories = this.catalogService.getCategories();
          this.loadError = this.catalogService.didLastCategoriesLoadFail();
        },
      });
  }

  get displayedCategories(): Category[] {
    const q = this.searchTerm.trim().toLowerCase();
    const list = this.categories;
    if (!q) return list;
    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q)
    );
  }

  categoryImageUrl(category: Category): string {
    const u = category.imageUrl?.trim();
    return u ? u : this.categoryPlaceholderImg;
  }

  trackById(index: number, category: Category): string {
    return category.id;
  }

  onCategoryClick(category: Category): void {
    this.router.navigate(['/categoria', category.slug]);
  }
}
