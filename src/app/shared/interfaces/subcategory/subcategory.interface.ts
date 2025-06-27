import { iFood } from "../food/food.interface";

export interface iSubcategory {
  id: string;
  name: string;
  category_id: string;
  created_at: string;
  company_id: string;
}

export interface iSubcategoryWithFoods {
  id: string;
  name: string;
  foods: iFood[] | null;
}
