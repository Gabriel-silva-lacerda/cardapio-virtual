import { Injectable, signal } from '@angular/core';
import { iFood } from '@shared/interfaces/food/food.interface';
import { BaseSupabaseService } from '../base/base-supabase.service';
import { iFoodWithCategory } from 'src/app/pages/home/interfaces/food-with-category';
import { environment } from '@enviroment/environment.development';
import { iExtra } from '@shared/interfaces/extra/extra.interface';
import { iCartItem } from '@shared/interfaces/cart/cart.interface';
import { getImageUrl } from '@shared/utils/getImage/get-image.utits';

interface SubcategoryGroup {
  id: string;
  name: string;
  foods: iFood[];
}

interface CategoryGroup {
  id: string;
  name: string;
  subcategories: Record<string, SubcategoryGroup>;
}

@Injectable({
  providedIn: 'root',
})
export class FoodService extends BaseSupabaseService {
  public selectedAdditions = signal<{ [key: string]: iExtra }>({});
  public observations = signal<string>('');
  public productCount = signal<number>(1);
  public totalAddition = signal<number>(0);

  async getAllFoodsGroupedByCategory(
    companyId: string
  ): Promise<Record<string, CategoryGroup>> {
    const { data, error } = await this.supabaseService.supabase
      .from('foods')
      .select('*, categories(id, name), subcategories(id, name)')
      .eq('company_id', companyId)
      .order('name', { ascending: true });

    if (error) throw error;

    const grouped: Record<string, CategoryGroup> = {};

    for (const food of data) {
      const category = food.categories || { id: '0', name: 'Outros' };
      const subcategory = food.subcategories || {
        id: '0',
        name: 'Sem Subcategoria',
      };

      if (!grouped[category.id]) {
        grouped[category.id] = {
          id: category.id,
          name: category.name,
          subcategories: {},
        };
      }

      if (!grouped[category.id].subcategories[subcategory.id]) {
        grouped[category.id].subcategories[subcategory.id] = {
          id: subcategory.id,
          name: subcategory.name,
          foods: [],
        };
      }

      grouped[category.id].subcategories[subcategory.id].foods.push({
        ...food,
        image_url: getImageUrl(food.image_url as string),
      });
    }

    return grouped;
  }

  async getFoodById(id: string): Promise<iFood | null> {
    const food = await this.getById<iFood>('foods', id);

    if (!food) return null;

    return {
      ...food,
      image_url: getImageUrl(food.image_url as string),
    };
  }

  async getFoodsByCategory(
    categoryId: string,
    companyId: string
  ): Promise<Record<string, iFood[]> | null> {
    const subcategories = await this.supabaseService.supabase
      .from('subcategories')
      .select('id, name')
      .eq('category_id', categoryId);

    if (!subcategories.data || subcategories.data.length === 0) return null;

    const subcategoryIds = subcategories.data.map((s) => s.id);

    const subcategoryNames = subcategories.data.reduce((acc, subcategory) => {
      acc[subcategory.id] = subcategory.name;
      return acc;
    }, {} as Record<string, string>);

    const foods = await this.supabaseService.supabase
      .from('foods')
      .select('*')
      .in('subcategory_id', subcategoryIds)
      .eq('company_id', companyId);

    if (!foods.data) return null;

    const groupedFoods: Record<string, iFood[]> = {};

    foods.data.forEach((food) => {
      const subcategoryId = food.subcategory_id as string;
      const subcategoryName = subcategoryNames[subcategoryId];

      if (!groupedFoods[subcategoryName]) {
        groupedFoods[subcategoryName] = [];
      }

      groupedFoods[subcategoryName].push({
        ...food,
        image_url: getImageUrl(food.image_url as string),
      });
    });

    return groupedFoods;
  }

  async createFoodWithExtras(
    foodData: iFood,
    extraIds: number[]
  ): Promise<iFood> {
    const food = await this.insert<iFood>('foods', foodData);

    if (extraIds.length > 0) {
      const foodExtras = extraIds.map((extraId) => ({
        food_id: food.id,
        extra_id: extraId,
      }));

      await this.insert('food_extras', foodExtras, { wrapInArray: false });
    }

    return food;
  }

  async updateFoodWithExtras(
    foodId: number,
    foodData: iFood,
    extraIds: number[]
  ): Promise<void> {
    await this.update<iFood>('foods', foodId, foodData);

    await this.deleteByFilter('food_extras', { food_id: foodId });

    if (extraIds.length > 0) {
      const foodExtras = extraIds.map((extraId) => ({
        food_id: foodId,
        extra_id: extraId,
      }));

      await this.insert('food_extras', foodExtras, { wrapInArray: false });
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
