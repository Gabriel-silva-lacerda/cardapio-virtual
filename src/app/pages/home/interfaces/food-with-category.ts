import { iFood } from "@shared/interfaces/food.interface";

export interface iFoodWithCategory extends iFood {
  categories?: { name: string };
}
