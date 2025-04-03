export interface Company {
  id?: string;
  account_id?: string;
  // full_name: string;
  cep: string;
  city: string;
  complement: string | null;
  created_at?: string;
  email: string;

  name: string;
  neighborhood: string;
  number: string;
  plan_id?: string;
  state?: string;
  street?: string;
  unique_url?: string;
  updated_at?: string | null;
}
