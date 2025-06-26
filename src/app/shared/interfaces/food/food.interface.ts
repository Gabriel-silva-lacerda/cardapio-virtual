import { DayOfWeek } from '@shared/enums/day-of-week.enum';
import { iSubcategoryWithFoods } from '../subcategory/subcategory.interface';

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

export interface iFullMenu {
  category_id: string;
  category_name: string;
  category_icon: string;
  company_id: string;
  subcategories: iSubcategoryWithFoods[];
}
