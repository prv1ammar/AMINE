export interface Stat {
  id: number;
  value: string;
  label: string;
  body: string;
  is_active: boolean;
  sort_order: number;
}

export interface StatInput {
  value: string;
  label?: string;
  body?: string;
  is_active?: boolean;
  sort_order?: number;
}
