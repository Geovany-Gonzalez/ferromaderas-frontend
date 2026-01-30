export interface Product {
  id: string;
  code: string;
  name: string;
  price: number;     // GTQ
  imageUrl: string;
  featured?: boolean;
}
