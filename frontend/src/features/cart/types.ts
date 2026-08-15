import type { Product } from "@/features/products/types";

export interface CartLine {
  product: Product;
  quantity: number;
}
