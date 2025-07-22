import { inject, Injectable, signal } from '@angular/core';
import { iFood } from '@shared/interfaces/food/food.interface';
import { BaseSupabaseService } from '../../services/base/base-supabase.service';
import { iExtra } from '@shared/interfaces/extra/extra.interface';
import { iCartItem } from '@shared/interfaces/cart/cart.interface';
import { getImageUrl } from '@shared/utils/get-image/get-image.utits';
import { iCategoryGroup } from '@shared/interfaces/group/group-food.interface';
import { FoodExtrasService } from '../../services/food/food-extras.service';
import { eCategoryLevel } from 'src/app/pages/admin/register-product/shared/enums/category-level.enum';
import { eCategoryFilterKey } from 'src/app/pages/admin/register-product/shared/enums/category-filter-key.enum';

@Injectable({
  providedIn: 'root',
})
export class FoodApi extends BaseSupabaseService {
  protected override table = 'foods';

  private foodExtrasService = inject(FoodExtrasService)

  async getFoodsGroupedByCategoryId(
    categoryId: string
  ): Promise<iCategoryGroup | null> {
    const { data: categories } = await this.supabaseService.supabase
      .from('categories')
      .select(
        `
          id,
          name,
          subcategories (
            id,
            name,
            foods (
              *,
              image_url
            )
          )
  `
      )
      .eq('id', categoryId)
      .single();

    if (!categories) return null;

    const categoryGroup: iCategoryGroup = {
      id: categories.id,
      name: categories.name,
      subcategories: categories.subcategories.map((subcat) => ({
        id: subcat.id,
        name: subcat.name,
        foods: (subcat.foods || []).map((food) => ({
          ...food,
          image_url: getImageUrl(food.image_url),
        })),
      })),
    };

    categoryGroup.subcategories.sort((a, b) => a.name.localeCompare(b.name));

    return categoryGroup;
  }

  async getFoodById(id: string): Promise<iFood | null> {
    const food = await this.getById<iFood>(id);
    if (!food) return null;

    return {
      ...food,
      image_url: getImageUrl(food.image_url as string),
    };
  }

  async createFoodWithExtras(
    foodData: iFood,
  ): Promise<iFood> {
    const food = await this.insert<iFood>(foodData);

    // if (extraIds.length > 0) {
    //   const foodExtras = extraIds.map((extraId) => ({
    //     food_id: food.id,
    //     extra_id: extraId,
    //   }));

    //   await this.foodExtrasService.insert(foodExtras, { wrapInArray: false });
    // }

    return food;
  }

  async updateFoodWithExtras(
    foodId: any,
    foodData: iFood,
  ): Promise<iFood> {

    const updatedFood = await this.update<iFood>(foodId, foodData);

    await this.foodExtrasService.deleteByFilter({ food_id: foodId });

    // if (extraIds.length > 0) {
    //   const foodExtras = extraIds.map((extraId) => ({
    //     food_id: foodId,
    //     extra_id: extraId,
    //   }));

    //   await this.foodExtrasService.insert(foodExtras, { wrapInArray: false });
    // }

    return updatedFood as any;
  }

  async getByIdFromView(id: string): Promise<any | null> {
    const { data, error } = await this.supabaseService.supabase
      .from('food_edit_view')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  }

  async getFoodsByContainer(
    companyId: string,
    containerId: string,
    query: string,
    level: eCategoryLevel
  ): Promise<any[]> {
    const filterKey = level === eCategoryLevel.Category ? eCategoryFilterKey.Category : eCategoryFilterKey.Subcategory;
    const filters = { company_id: companyId, [filterKey]: containerId };

    let foods = await this.search<any>(query, ['name', 'description'], filters);

    // Formata imagem apenas para subcategoria (conforme seu código)
    if (filterKey === eCategoryFilterKey.Subcategory) {
      foods = foods.map(food => ({ ...food, image_url: getImageUrl(food.image_url || '') }));
    }

    return foods;
  }
}
