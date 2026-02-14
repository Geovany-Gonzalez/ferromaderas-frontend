export type QuotationStatus =
  | 'nueva'
  | 'en_seguimiento'
  | 'confirmada'
  | 'cerrada'
  | 'cancelada';

export interface Quotation {
  id: string;
  fechaHora: string; // DD/MM/YYYY o formato legible
  cliente: string;
  telefono: string;
  total: number;
  direccion: string;
  estado: QuotationStatus;
}
