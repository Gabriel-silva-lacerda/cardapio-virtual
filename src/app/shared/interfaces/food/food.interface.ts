import { DayOfWeek } from '@shared/enums/day-of-week.enum';
import { iSubcategory } from '../subcategory/subcategory.interface';
import { iCategoryExtra, iCompanyCategory } from '../category/category.interface';

export interface iFood {
  id?: string;
  name: string;
  description?: string;
  price: number;
  category_id?: number;
  image_url?: string | null;
  day_of_week: DayOfWeek;
  created_at?: string;
  company_id: string;
  subcategory_id?: string;
}

export interface IFoodAdmin {
  category_extras: iCategoryExtra[];
  category_id: string;
  category_name: string;
  company_categories: iCompanyCategory[];
  company_id: string;
  created_at: string;
  day_of_week: string | null;
  description: string | null;
  food_extra_ids: string[];
  id: string;
  image_url: string | null;
  name: string;
  price: number;
  subcategories: iSubcategory[];
  subcategory_id: string | null;
}
