import { Injectable, signal } from '@angular/core';
import { iFood } from '@shared/interfaces/food/food.interface';
import { BaseSupabaseService } from '../base/base-supabase.service';
import { iFoodWithCategory } from 'src/app/pages/home/interfaces/food-with-category';
import { environment } from '@enviroment/environment.development';
import { iExtra } from '@shared/interfaces/extra/extra.interface';
import { iCartItem } from '@shared/interfaces/cart/cart.interface';
import { getImageUrl } from '@shared/utils/getImage/get-image.utits';

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
  ): Promise<{ [categoryName: string]: iFood[] }> {
    const data = await this.getAllByField<iFoodWithCategory>(
      'foods',
      'company_id',
      companyId,
      '*, categories(name)'
    );

    const groupedFoods: Record<string, iFood[]> = {};

    data.forEach((food) => {
      const categoryName = food.categories?.name || 'Outros';

      if (!groupedFoods[categoryName]) {
        groupedFoods[categoryName] = [];
      }

      groupedFoods[categoryName].push({
        ...food,
        image_url: getImageUrl(food.image_url as string),
      });
    });

    return groupedFoods;
  }

  async getFoods(): Promise<iFood[]> {
    const foods = await this.getAll<iFood>('foods',);

    const updatedFoods = foods.map((food) => ({
      ...food,
      image_url: getImageUrl(food.image_url as string)
    }));

    return updatedFoods;
  }

  async getFoodById(id: string): Promise<iFood | null> {
    const food = await this.getById<iFood>('foods', id);

    if (!food) return null;

    return {
      ...food,
      image_url: getImageUrl(food.image_url as string)
    };
  }

  async getFoodsByCategory(
    categoryId: string,
    companyId: string
  ): Promise<iFood[] | null> {
    const foods = await this.supabaseService.supabase
      .from('foods')
      .select('*')
      .eq('category_id', categoryId)
      .eq('company_id', companyId);

    if (!foods.data) return [];

    return foods.data.map((food) => ({
      ...food,
      image_url: getImageUrl(food.image_url as string)
    }));
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
