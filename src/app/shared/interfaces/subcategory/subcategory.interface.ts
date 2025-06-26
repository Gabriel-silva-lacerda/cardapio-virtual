import { iFood } from "../food/food.interface";

export interface iSubcategory {
  id: string;
  name: string;
  category_id: string;
}

export interface iSubcategoryWithFoods {
  id: string;
  name: string;
  foods: iFood[] | null;
}
