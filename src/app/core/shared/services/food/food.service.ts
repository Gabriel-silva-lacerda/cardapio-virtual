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

  async getAllFoodsGroupedByCategory(): Promise<{ [categoryName: string]: iFood[] }> {
    const { data, error } = await this.supabaseService.supabase
      .from('foods')
      .select('*, categories(name)')
      .order('category_id', { ascending: true });

    if (error) {
      this.toastr.error('Erro ao buscar comidas agrupadas por categoria:', error.message);
      throw new Error(error.message);
    }

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
    try {
      const foods = await this.getAllByField<iFood>(
        'foods',
        'company_id',
        companyId
      );

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
        // ? `${environment.SUPABASE_URL}/${food.image_url}`
        // : null,
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

  async createFoodWithExtras(foodData: any, extraIds: number[]) {
    const { data: food, error } = await this.supabaseService.supabase.from('foods').insert([foodData]).select().single();

    if (error) {
      throw new Error(`Erro ao criar comida: ${error.message}`);
    }

    // Se houver adicionais, relaciona na tabela food_extras
    if (extraIds.length > 0) {
      const foodExtras = extraIds.map(extraId => ({
        food_id: food.id,
        extra_id: extraId
      }));

      const { error: extrasError } = await this.supabaseService.supabase.from('food_extras').insert(foodExtras);

      if (extrasError) {
        throw new Error(`Erro ao associar adicionais: ${extrasError.message}`);
      }
    }

    return food;
  }

  async updateFoodWithExtras(foodId: number, foodData: any, extraIds: number[]) {
    // Atualiza os dados do item na tabela 'foods'
    const { error: foodError } = await this.supabaseService.supabase
      .from('foods')
      .update(foodData)
      .eq('id', foodId);

    if (foodError) {
      throw new Error(`Erro ao atualizar comida: ${foodError.message}`);
    }

    // Atualiza os adicionais do item
    // 1. Remove os adicionais antigos
    const { error: deleteError } = await this.supabaseService.supabase
      .from('food_extras')
      .delete()
      .eq('food_id', foodId);

    if (deleteError) {
      throw new Error(`Erro ao remover adicionais antigos: ${deleteError.message}`);
    }

    // 2. Insere os novos adicionais, se houver
    if (extraIds.length > 0) {
      const foodExtras = extraIds.map(extraId => ({
        food_id: foodId,
        extra_id: extraId
      }));

      const { error: insertError } = await this.supabaseService.supabase
        .from('food_extras')
        .insert(foodExtras);

      if (insertError) {
        throw new Error(`Erro ao associar novos adicionais: ${insertError.message}`);
      }
    }

    return { message: 'Comida atualizada com sucesso!' };
  }


  async getFoodByName(name: string): Promise<any> {
    const { data, error } = await this.supabaseService.supabase
      .from('foods')
      .select('*')
      .eq('name', name)
      .single();

    if (error) {
      this.toastr.error(`Erro ao buscar o prato pelo nome ${name}:`, error.message);
      throw new Error(error.message);
    }

    return data;
  }

  async getAllFoodsByCompany(companyId: number): Promise<any[]> {
    const { data, error } = await this.supabaseService.supabase
      .from('foods')
      .select('*')
      .eq('company_id', companyId);

    if (error) {
      this.toastr.error('Erro ao buscar as comidas:', error.message);
      throw new Error(error.message);
    }

    return data;
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
