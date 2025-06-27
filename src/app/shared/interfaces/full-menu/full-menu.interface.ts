import { iSubcategoryWithFoods } from "../subcategory/subcategory.interface";

export interface iFullMenu {
  category_id: string;
  category_name: string;
  category_icon: string;
  company_id: string;
  subcategories: iSubcategoryWithFoods[];
}
