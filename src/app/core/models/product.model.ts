export interface Product {
  id: string;
  code: string;
  name: string;
  price: number;     // GTQ
  imageUrl: string;
  categoryId: string;
  featured?: boolean;
  description?: string;
  active?: boolean;
  /** true = creado por carga masiva, falta foto, precio y categoría */
  pendingConfig?: boolean;
  /** Existencia / inventario teórico (Dichara) */
  stock?: number;
}
