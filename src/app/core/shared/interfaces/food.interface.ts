export interface iFood {
  id: number;
  name: string;
  description?: string;
  price: number;
  category_id?: number;
  image_url?: string | null;
  created_at?: string;
}
