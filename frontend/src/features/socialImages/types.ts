export interface SocialImage {
  id: number;
  caption: string;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface SocialImageInput {
  caption?: string;
  image_url?: string | null;
  is_active?: boolean;
  sort_order?: number;
}
