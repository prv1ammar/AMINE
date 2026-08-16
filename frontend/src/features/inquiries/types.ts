export const INQUIRY_SUBJECTS = [
  "Commander un modèle",
  "Question sur un produit",
  "Suivi de commande",
  "Retour ou échange",
  "Autre",
] as const;

export type InquirySubject = (typeof INQUIRY_SUBJECTS)[number];

export interface CartItemInput {
  product_id: number;
  quantity: number;
}

export interface CartItemSnapshot extends CartItemInput {
  slug: string;
  name: string;
  price_cents: number;
  line_total_cents: number;
}

export interface InquiryCreate {
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  subject: InquirySubject;
  message: string;
  product_slug?: string | null;
  items?: CartItemInput[] | null;
}

export const INQUIRY_STATUSES = ["new", "contacted", "closed"] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export interface Inquiry extends InquiryCreate {
  id: number;
  items?: CartItemSnapshot[] | null;
  delivery_cents?: number | null;
  total_cents?: number | null;
  status: InquiryStatus;
  created_at: string;
  updated_at: string;
}
