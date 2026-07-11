export type QuotationStatus =
  | 'nueva'
  | 'en_seguimiento'
  | 'confirmada'
  | 'cerrada'
  | 'cancelada';

export interface Quotation {
  /** Identificador interno (uuid del backend), usado para las acciones del API. */
  id: string;
  /** Código legible mostrado al usuario (FM-2026-XXXX). */
  codigo: string;
  fechaHora: string; // DD/MM/YYYY o formato legible
  cliente: string;
  telefono: string;
  total: number;
  direccion: string;
  estado: QuotationStatus;
  /** Vendedor asignado para dar seguimiento */
  vendedorId?: string;
  vendedorNombre?: string;
}
