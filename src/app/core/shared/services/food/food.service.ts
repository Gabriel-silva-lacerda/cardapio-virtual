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

  async getFoodsByCompany(companyId: number): Promise<iFood[]> {
    try {
      // Usa o método getAllByField para buscar alimentos pelo company_id
      const foods = await this.getAllByField<iFood>(
        'foods', // Nome da tabela
        'company_id', // Campo para filtrar
        companyId // Valor do campo
      );

      // Atualiza as URLs das imagens
      const updatedFoods = foods.map((food) => ({
        ...food,
        image_url: food.image_url
          ? `${environment.SUPABASE_URL}/${food.image_url}`
          : null,
      }));

      return updatedFoods;
    } catch (error) {
      console.error('Erro ao buscar alimentos:', error);
      return [];
    }
  }

  async getFoodById(id: string): Promise<iFood | null> {
    const food = await this.getById<iFood>('foods', id);

    if (!food) return null;

    return {
      ...food,
      image_url: food.image_url
        ? `${environment.SUPABASE_URL}/${food.image_url}`
        : null,
    };
  }

  async getFoodsByCategory(categoryId: number): Promise<iFood[] | null> {
    const foods = await this.getAllByField<iFood>('foods', 'category_id', categoryId);

    if (!foods) return [];

    return foods.map((food) => ({
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
