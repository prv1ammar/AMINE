export interface LookbookEntry {
  id: number;
  eyebrow: string;
  title: string;
  body: string;
  image_placeholder: string;
  image_url: string | null;
  link_url: string;
  is_active: boolean;
  sort_order: number;
}

export interface LookbookEntryInput {
  eyebrow?: string;
  title: string;
  body?: string;
  image_placeholder?: string;
  image_url?: string | null;
  link_url?: string;
  is_active?: boolean;
  sort_order?: number;
}
