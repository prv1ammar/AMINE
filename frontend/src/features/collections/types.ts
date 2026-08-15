import type { Product } from "@/features/products/types";

export interface Collection {
  id: number;
  slug: string;
  name: string;
  description: string;
  image_placeholder: string;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  product_count: number;
}

export interface CollectionWithProducts extends Collection {
  products: Product[];
}

export interface CollectionInput {
  slug: string;
  name: string;
  description?: string;
  image_placeholder?: string;
  image_url?: string | null;
  is_active?: boolean;
  sort_order?: number;
}
