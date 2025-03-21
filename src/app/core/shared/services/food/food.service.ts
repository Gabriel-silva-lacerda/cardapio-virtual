import { Injectable, signal } from '@angular/core';
import { iFood } from '@shared/interfaces/food.interface';
import { environment } from 'src/environments/environment.development';
import { BaseSupabaseService } from '../base/base-supabase.service';
import { iExtra } from 'src/app/pages/selected-food/interfaces/extra.interface';
import { iCartItem } from '@shared/interfaces/cart.interface';

@Injectable({
  providedIn: 'root',
})
export class FoodService extends BaseSupabaseService {
  public selectedAdditions = signal<{ [key: number]: iExtra }>({});
  public observations = signal<string>('');
  public productCount = signal<number>(1);
  public totalAddition = signal<number>(0);

  async getAllFoodsGroupedByCategory(companyId: number): Promise<{ [categoryName: string]: iFood[] }> {
    const data = await this.getAllByField<iFood>('foods', 'company_id', companyId, '*, categories(name)');

    const groupedFoods: Record<string, iFood[]> = {};

    data.forEach((food: any) => {
      const categoryName = food.categories?.name || 'Outros';

      if (!groupedFoods[categoryName]) {
        groupedFoods[categoryName] = [];
      }

      groupedFoods[categoryName].push({
        ...food,
        image_url: food.image_url
          ? `${environment.SUPABASE_STORAGE}/${food.image_url}`
          : null,
      });
    });

    return groupedFoods;
  }

  async getFoodsByCompany(companyId: number): Promise<iFood[]> {
      const foods = await this.getAllByField<iFood>(
        'foods',
        'company_id',
        companyId
      );

      const updatedFoods = foods.map((food) => ({
        ...food,
        image_url: food.image_url
          ? `${environment.SUPABASE_STORAGE}/${food.image_url}`
          : null,
      }));

      return updatedFoods;
  }

  async getFoodById(id: string): Promise<iFood | null> {
    const food = await this.getById<iFood>('foods', id);

    if (!food) return null;

    return {
      ...food,
      image_url: food.image_url
      ? `${environment.SUPABASE_STORAGE}/${food.image_url}`
      : null,
    };
  }

  async getFoodsByCategory(categoryId: number, companyId: number): Promise<iFood[] | null> {
    const foods = await this.supabaseService.supabase
      .from('foods')
      .select('*')
      .eq('category_id', categoryId)
      .eq('company_id', companyId);

    if (!foods.data) return [];

    return foods.data.map((food) => ({
      ...food,
      image_url: food.image_url
        ? `${environment.SUPABASE_STORAGE}/${food.image_url}`
        : null,
    }));
  }

  async createFoodWithExtras(foodData: any, extraIds: number[]) {
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

  async updateFoodWithExtras(foodId: number, foodData: any, extraIds: number[]) {
    await this.update<any>('foods', foodId, foodData);

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

  private updateFoodImageUrl(food: iFood): iFood {
    return {
      ...food,
      image_url: food.image_url
        ? `${environment.SUPABASE_URL}/${food.image_url}`
        : null,
    };
  }
}
