export interface Company {
  id?: string;
  account_id?: string;
  cep: string;
  city: string;
  complement: string | null;
  created_at?: string;
  email: string;
  delivery_fee_per_km: number | string;
  name: string;
  neighborhood: string;
  number: string;
  plan_id?: string;
  state?: string;
  street?: string;
  unique_url?: string;
  updated_at?: string | null;
  image_url?: string | null;
}
