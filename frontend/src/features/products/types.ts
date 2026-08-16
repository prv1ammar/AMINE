export interface Product {
  id: number;
  slug: string;
  name: string;
  shape: string;
  price_cents: number;
  delivery_price_cents: number;
  currency: string;
  tagline: string;
  description: string;
  image_placeholder: string;
  image_url: string | null;
  badge: string | null;
  is_bestseller: boolean;
  is_new: boolean;
  is_active: boolean;
  sort_order: number;
}

export interface ProductInput {
  slug: string;
  name: string;
  shape: string;
  price_cents: number;
  delivery_price_cents?: number;
  currency?: string;
  tagline?: string;
  description?: string;
  image_placeholder?: string;
  image_url?: string | null;
  badge?: string | null;
  is_bestseller?: boolean;
  is_new?: boolean;
  is_active?: boolean;
  sort_order?: number;
}

export function formatPrice(product: Pick<Product, "price_cents" | "currency">): string {
  const amount = product.price_cents / 100;
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: product.currency,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}
