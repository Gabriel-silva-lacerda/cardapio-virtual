import { Injectable, signal } from '@angular/core';
import { iFood } from '@shared/interfaces/food.interface';
import { environment } from 'src/environments/environment.development';
import { BaseService } from '../base/base.service';
import { iExtra } from 'src/app/pages/selected-food/interfaces/extra.interface';

@Injectable({
  providedIn: 'root',
})
export class FoodService extends BaseService {

  public selectedAdditions = signal<{ [key: number]: iExtra }>({});
  public observations = signal<string>('');
  public productCount = signal<number>(1);
  public totalAddition = signal<number>(0)

  constructor() {
    super('foods');
  }

  async getAllFoods(): Promise<iFood[]> {
    const foods = await this.getAll<iFood>();

    const updateFood = foods.map((food) => ({
      ...food,
      image_url: food.image_url
        ? `${environment.SUPABASE_URL}/${food.image_url}`
        : null,
    }));

    return updateFood;
  }

  async getFoodById(id: string): Promise<iFood | null> {
    const food = await this.getById<iFood>(id);

    if (!food) return null;

    return {
      ...food,
      image_url: food.image_url
        ? `${environment.SUPABASE_URL}/${food.image_url}`
        : null,
    };
  }

  async getFoodsByCategory(categoryId: number): Promise<iFood[] | null>  {
    const foods = await this.getByField<iFood>('category_id', categoryId);

    if (!foods) return [];

    return foods.map(food => ({
      ...food,
      image_url: food.image_url
        ? `${environment.SUPABASE_URL}/${food.image_url}`
        : null,
    }));
  }

  public resetFoodValues() {
    this.selectedAdditions.set({});
    this.observations.set('');
    this.productCount.set(1);
  }
}
