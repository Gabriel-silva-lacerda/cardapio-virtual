import { inject, Injectable, signal } from '@angular/core';
import { iFood } from '@shared/interfaces/food/food.interface';
import { BaseSupabaseService } from '../base/base-supabase.service';
import { iExtra } from '@shared/interfaces/extra/extra.interface';
import { iCartItem } from '@shared/interfaces/cart/cart.interface';
import { getImageUrl } from '@shared/utils/getImage/get-image.utits';
import { iCategoryGroup } from '@shared/interfaces/group/group-food.interface';
import { FoodExtrasService } from './food-extras.service';

@Injectable({
  providedIn: 'root',
})
export class FoodService extends BaseSupabaseService {
  protected override table = 'foods';

  private foodExtrasService = inject(FoodExtrasService)

  public selectedAdditions = signal<{ [key: string]: iExtra }>({});
  public observations = signal<string>('');
  public productCount = signal<number>(1);
  public totalAddition = signal<number>(0);

  async getAllFoodsGroupedByCategory(
    companyId: string
  ): Promise<Record<string, iCategoryGroup>> {
    const { data, error } = await this.supabaseService.supabase
      .from('foods_categories_view')
      .select('*')
      .eq('company_id', companyId)
      .order('subcategory_name', { ascending: true, nullsFirst: false });

    if (error) throw error;

    const grouped: Record<string, iCategoryGroup> = {};

    for (const food of data) {
      const categoryId = food.category_id || '0';
      const categoryName = food.category_name || 'Outros';
      const subcategoryId = food.subcategory_id || '0';
      const subcategoryName = food.subcategory_name || 'Sem Subcategoria';

      if (!grouped[categoryId]) {
        grouped[categoryId] = {
          id: categoryId,
          name: categoryName,
          subcategories: [],
        };
      }

      let subcategoryGroup = grouped[categoryId].subcategories.find(
        (sub) => sub.id === subcategoryId
      );

      if (!subcategoryGroup) {
        subcategoryGroup = {
          id: subcategoryId,
          name: subcategoryName,
          foods: [],
        };
        grouped[categoryId].subcategories.push(subcategoryGroup);
      }

      subcategoryGroup.foods.push({
        ...food,
        image_url: getImageUrl(food.image_url),
      });
    }
    for (const cat of Object.values(grouped)) {
      cat.subcategories.sort((a, b) => a.name.localeCompare(b.name));
    }

    return grouped;
  }

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
    extraIds: number[]
  ): Promise<iFood> {
    const food = await this.insert<iFood>(foodData);

    if (extraIds.length > 0) {
      const foodExtras = extraIds.map((extraId) => ({
        food_id: food.id,
        extra_id: extraId,
      }));

      await this.foodExtrasService.insert(foodExtras, { wrapInArray: false });
    }

    return food;
  }

  async updateFoodWithExtras(
    foodId: number,
    foodData: iFood,
    extraIds: number[]
  ): Promise<void> {
    await this.update<iFood>(foodId, foodData);

    await this.foodExtrasService.deleteByFilter({ food_id: foodId });

    if (extraIds.length > 0) {
      const foodExtras = extraIds.map((extraId) => ({
        food_id: foodId,
        extra_id: extraId,
      }));

      await this.foodExtrasService.insert(foodExtras, { wrapInArray: false });
    }
  }

  public resetFoodValues() {
    this.selectedAdditions.set({});
    this.observations.set('');
    this.productCount.set(1);
  }

  getFoodDetails(food: iFood, cartItem?: iCartItem) {
    if (!food) return null;

    return {
      id: food.id,
      name: food.name,
      description: food.description,
      price: food.price,
      imageUrl: food.image_url,
      quantity: cartItem ? cartItem.quantity : undefined,
      totalPrice: cartItem ? cartItem.totalPrice : undefined,
      day_of_week: food.day_of_week,
    };
  }
}
