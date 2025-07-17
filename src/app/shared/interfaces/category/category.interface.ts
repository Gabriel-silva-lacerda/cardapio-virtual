export interface iCategory {
  id?: string;
  name: string;
  icon?: string;
  created_at?: string;
  updated_at?: string;
  company_id?: string | null;
  has_subcategory?: boolean;
}

export interface iCompanyCategory {
  id: string;
  name: string;
  icon: string;
  type_category: string | null;
}

export interface iCategoryExtra {
  id: string;
  name: string;
  price: number;
  company_id?: string | null;
}

export interface iCompanyWithCategories {
  company_categories: iCompanyCategory[];
}
