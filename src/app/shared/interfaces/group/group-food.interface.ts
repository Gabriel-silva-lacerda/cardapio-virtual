import { iFood } from '../food/food.interface';

export interface iCategoryGroup {
  id: string;
  name: string;
  subcategories: iSubcategoryGroup[];
}

export interface iSubcategoryGroup {
  id: string;
  name: string;
  foods: iFoodWithCategorySubcategory[];
}

export interface iFoodWithCategorySubcategory extends iFood {
  category_name: string;
  subcategory_name: string;
}
