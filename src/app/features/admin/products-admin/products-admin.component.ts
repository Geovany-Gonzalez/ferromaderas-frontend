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
  bulkPreview: { code: string; name: string; stock: number; status: 'nuevo' | 'actualizado' }[] = [];
  bulkDeleted: { id: string; code: string; name: string; stock: number }[] = [];
  bulkPreviewFilter: 'todos' | 'nuevos' | 'actualizados' | 'eliminados' = 'todos';
  bulkSyncMode = false;
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

  get bulkStats(): { nuevos: number; actualizados: number; eliminados: number } {
    return {
      nuevos: this.bulkPreview.filter((i) => i.status === 'nuevo').length,
      actualizados: this.bulkPreview.filter((i) => i.status === 'actualizado').length,
      eliminados: this.bulkDeleted.length,
    };
  }

  get filteredBulkItems(): { code: string; name: string; stock: number; status: 'nuevo' | 'actualizado' }[] {
    if (this.bulkPreviewFilter === 'nuevos') return this.bulkPreview.filter((i) => i.status === 'nuevo');
    if (this.bulkPreviewFilter === 'actualizados') return this.bulkPreview.filter((i) => i.status === 'actualizado');
    if (this.bulkPreviewFilter === 'eliminados') return [];
    return this.bulkPreview;
  }

  /** Items a mostrar en la tabla: del Excel (nuevos/actualizados) o eliminados (no están en Excel). */
  get bulkTableRows(): { code: string; name: string; stock: number; status?: 'nuevo' | 'actualizado' | 'eliminado' }[] {
    if (this.bulkPreviewFilter === 'eliminados') {
      return this.bulkDeleted.map((d) => ({ ...d, status: 'eliminado' as const }));
    }
    return this.filteredBulkItems;
  }

  openBulkImport(): void {
    this.showBulkImport = true;
    this.bulkFile = null;
    this.bulkPreview = [];
    this.bulkDeleted = [];
    this.bulkPreviewFilter = 'todos';
    this.bulkSyncMode = false;
    this.bulkParseError = '';
  }

  closeBulkImport(): void {
    this.showBulkImport = false;
    this.bulkFile = null;
    this.bulkPreview = [];
    this.bulkDeleted = [];
    this.bulkParseError = '';
  }

  bulkParseError = '';

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
    this.bulkParseError = '';
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const data = e.target?.result;
        if (!data) {
          this.bulkParseError = 'No se pudo leer el archivo.';
          return;
        }
        const wb = XLSX.read(data, { type: 'binary' });
        const firstSheet = wb.SheetNames[0];
        const ws = wb.Sheets[firstSheet];
        const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 }) as (string | number)[][];
        const items = this.parseExcelRows(rows);
        this.classifyBulkItems(items);
        if (items.length === 0) {
          this.bulkParseError = 'No se encontraron productos. Verifica que el Excel tenga columnas "Código" y "Descripción".';
        } else {
          this.notification.showMessage(`Se detectaron ${items.length} producto(s) en el archivo.`, 'success');
        }
      } catch (err) {
        this.bulkParseError = 'No se pudo leer el archivo. Revisa que sea un Excel válido.';
        this.notification.showMessage(this.bulkParseError, 'error');
        this.bulkFile = null;
      }
    };
    reader.readAsBinaryString(file);
    input.value = '';
  }

  /** Compatible con Dichara: busca la fila con Código y Descripción (puede no ser la primera). Incluye Teórico (existencia). */
  private parseExcelRows(rows: (string | number)[][]): { code: string; name: string; stock: number }[] {
    if (!rows?.length) return [];

    let headerRowIdx = -1;
    for (let i = 0; i < Math.min(15, rows.length); i++) {
      const row = rows[i] ?? [];
      const str = row.map((c) => String(c ?? '').toLowerCase()).join(' ');
      if (/c[oó]digo/.test(str) && /descripci[oó]n/.test(str)) {
        headerRowIdx = i;
        break;
      }
    }

    if (headerRowIdx < 0) return [];

    const header = (rows[headerRowIdx] ?? []).map((c) => String(c ?? '').toLowerCase().trim());
    const codeIdx = header.findIndex((h) => /c[oó]digo|code/.test(h));
    const descIdx = header.findIndex((h) => /descripci[oó]n|nombre|name|producto/.test(h));
    const stockIdx = header.findIndex((h) => /te[oó]rico|existencia|inventario|stock/.test(h));
    const fallbackCode = codeIdx >= 0 ? codeIdx : 0;
    const fallbackDesc = descIdx >= 0 ? descIdx : 1;

    const items: { code: string; name: string; stock: number }[] = [];
    for (let i = headerRowIdx + 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.every((c) => c === '' || c == null)) continue;
      const code = String(row[codeIdx] ?? row[fallbackCode] ?? '').trim();
      const name = String(row[descIdx] ?? row[fallbackDesc] ?? row[0] ?? '').trim();
      const rawStock = row[stockIdx] ?? row[stockIdx >= 0 ? stockIdx : -1];
      const stock = typeof rawStock === 'number' ? Math.max(0, rawStock) : parseInt(String(rawStock ?? '0'), 10) || 0;
      if (code || name) items.push({ code: code || `item-${i + 1}`, name: name || code, stock });
    }
    return items;
  }

  /** Clasifica items del Excel: nuevos (crear), actualizados (ya existen), y productos eliminados (en sistema pero no en Excel). */
  private classifyBulkItems(items: { code: string; name: string; stock: number }[]): void {
    const existingByCode = new Map(this.products.map((p) => [p.code.trim().toLowerCase(), p]));
    const excelCodes = new Set(items.map((i) => i.code.trim().toLowerCase()));

    this.bulkPreview = items.map((item) => {
      const key = item.code.trim().toLowerCase();
      const exists = existingByCode.has(key);
      return { ...item, status: (exists ? 'actualizado' : 'nuevo') as 'nuevo' | 'actualizado' };
    });

    this.bulkDeleted = this.products
      .filter((p) => !excelCodes.has(p.code.trim().toLowerCase()))
      .map((p) => ({ id: p.id, code: p.code, name: p.name, stock: p.stock ?? 0 }));
    // Por defecto sincronizar: eliminar los que no están en el archivo
    this.bulkSyncMode = this.bulkDeleted.length > 0;
  }

  async confirmBulkImport(): Promise<void> {
    if (this.bulkPreview.length === 0) {
      this.notification.showMessage('No hay datos para importar.', 'error');
      return;
    }
    if (this.bulkSyncMode && this.bulkDeleted.length > 0) {
      const ok = await this.notification.confirm(
        'Sincronizar',
        `Se eliminarán ${this.bulkDeleted.length} producto(s) que no están en el archivo. ¿Continuar?`
      );
      if (!ok) return;
    }
    this.bulkLoading = true;
    let deleted = 0;
    if (this.bulkSyncMode && this.bulkDeleted.length > 0) {
      deleted = this.catalogService.removeProductsNotInExcel(
        this.bulkPreview.map((i) => i.code.trim().toLowerCase())
      );
    }
    const result = this.catalogService.addProductsFromBulkImport(
      this.bulkPreview.map((i) => ({ code: i.code, name: i.name, stock: i.stock }))
    );
    this.bulkLoading = false;
    this.loadProducts();
    this.closeBulkImport();
    let msg = `Se crearon ${result.created} producto(s) pendientes de configurar.`;
    if (result.updated) msg += ` Se actualizó existencia de ${result.updated} producto(s).`;
    if (deleted) msg += ` Se eliminaron ${deleted} producto(s) que no estaban en el archivo.`;
    if (result.skipped) msg += ` ${result.skipped} omitido(s) (código ya existe).`;
    if (result.errors.length) msg += ` Advertencias: ${result.errors.slice(0, 3).join('; ')}`;
    this.notification.showMessage(msg, result.created > 0 || deleted > 0 ? 'success' : 'info');
    if (result.created > 0) this.viewMode = 'pendientes';
  }
}
