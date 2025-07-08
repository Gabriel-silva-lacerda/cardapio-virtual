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

export interface IFoodAdmin extends iFood {
  food_extra_ids: string[];

  category: {
    id: string;
    name: string;
  };

  company: {
    id: string;
    categories: iCompanyCategory[];
  };

  extras: iCategoryExtra[];
  subcategories: iSubcategory[];
}

