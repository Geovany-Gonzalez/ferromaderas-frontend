import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import * as XLSX from 'xlsx';
import { CatalogService } from '../../../core/services/catalog.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-products-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './products-admin.component.html',
  styleUrl: './products-admin.component.scss',
})
export class ProductsAdminComponent implements OnInit {
  products: Product[] = [];
  searchTerm = '';
  filterEstado: 'todos' | 'activo' | 'inactivo' = 'todos';
  viewMode: 'todos' | 'pendientes' = 'todos';

  showBulkImport = false;
  bulkFile: File | null = null;
  bulkPreview: { code: string; name: string }[] = [];
  bulkLoading = false;

  constructor(
    private catalogService: CatalogService,
    private router: Router,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.products = this.catalogService.getProducts();
  }

  get pendingCount(): number {
    return this.catalogService.getPendingProducts().length;
  }

  get baseProducts(): Product[] {
    if (this.viewMode === 'pendientes') {
      return this.catalogService.getPendingProducts();
    }
    return this.products;
  }

  get filteredProducts(): Product[] {
    const term = this.searchTerm?.toLowerCase().trim() || '';
    let list = this.baseProducts;
    if (this.viewMode === 'todos') {
      if (this.filterEstado === 'activo') list = list.filter((p) => p.active !== false);
      if (this.filterEstado === 'inactivo') list = list.filter((p) => p.active === false);
    }
    if (!term) return list;
    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.code.toLowerCase().includes(term) ||
        (p.description && p.description.toLowerCase().includes(term))
    );
  }

  getCategoryName(categoryId: string): string {
    const cat = this.catalogService.getCategoryById(categoryId);
    return cat?.name ?? '—';
  }

  addProduct(): void {
    this.router.navigate(['/admin/productos/crear']);
  }

  editProduct(product: Product): void {
    this.router.navigate(['/admin/productos/editar', product.id]);
  }

  setProductActive(product: Product, active: boolean): void {
    const action = active ? 'activar' : 'desactivar';
    this.notification.confirm('Confirmar', `¿Deseas ${action} el producto "${product.name}"?`).then((ok) => {
      if (ok) {
        this.catalogService.updateProduct(product.id, { active });
        this.loadProducts();
        this.notification.showMessage(`Producto "${product.name}" ${active ? 'activado' : 'desactivado'}.`, 'success');
      }
    });
  }

  trackById(_index: number, product: Product): string {
    return product.id;
  }

  openBulkImport(): void {
    this.showBulkImport = true;
    this.bulkFile = null;
    this.bulkPreview = [];
  }

  closeBulkImport(): void {
    this.showBulkImport = false;
    this.bulkFile = null;
    this.bulkPreview = [];
  }

  onBulkFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'xlsx' && ext !== 'xls' && ext !== 'csv') {
      this.notification.showMessage('Formato no válido. Usa Excel (.xlsx, .xls) o CSV.', 'error');
      input.value = '';
      return;
    }
    this.bulkFile = file;
    this.bulkPreview = [];
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const data = e.target?.result;
        if (!data) return;
        const wb = XLSX.read(data, { type: 'binary' });
        const firstSheet = wb.SheetNames[0];
        const ws = wb.Sheets[firstSheet];
        const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 }) as (string | number)[][];
        const items = this.parseExcelRows(rows);
        this.bulkPreview = items;
      } catch (err) {
        this.notification.showMessage('No se pudo leer el archivo. Revisa el formato.', 'error');
        this.bulkFile = null;
      }
    };
    reader.readAsBinaryString(file);
    input.value = '';
  }

  /** Busca columnas Código y Descripción (flexible en nombres). */
  private parseExcelRows(rows: (string | number)[][]): { code: string; name: string }[] {
    if (rows.length < 2) return [];
    const header = rows[0].map((c) => String(c ?? '').toLowerCase().trim());
    const codeIdx = header.findIndex((h) => /c[oó]digo|code/.test(h));
    const descIdx = header.findIndex((h) => /descripci[oó]n|nombre|name|producto/.test(h));
    const fallbackCode = codeIdx >= 0 ? codeIdx : 0;
    const fallbackDesc = descIdx >= 0 ? descIdx : 1;
    const items: { code: string; name: string }[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.every((c) => c === '' || c == null)) continue;
      const code = String(row[codeIdx] ?? row[fallbackCode] ?? '').trim();
      const name = String(row[descIdx] ?? row[fallbackDesc] ?? row[0] ?? '').trim();
      if (code || name) items.push({ code: code || String(i + 1), name: name || code });
    }
    return items;
  }

  confirmBulkImport(): void {
    if (this.bulkPreview.length === 0) {
      this.notification.showMessage('No hay datos para importar.', 'error');
      return;
    }
    this.bulkLoading = true;
    const result = this.catalogService.addProductsFromBulkImport(this.bulkPreview);
    this.bulkLoading = false;
    this.loadProducts();
    this.closeBulkImport();
    let msg = `Se crearon ${result.created} producto(s) pendientes de configurar.`;
    if (result.skipped) msg += ` ${result.skipped} omitido(s) (código ya existe).`;
    if (result.errors.length) msg += ` Advertencias: ${result.errors.slice(0, 3).join('; ')}`;
    this.notification.showMessage(msg, result.created > 0 ? 'success' : 'info');
    if (result.created > 0) this.viewMode = 'pendientes';
  }
}
