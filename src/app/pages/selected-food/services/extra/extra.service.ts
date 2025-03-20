import { Injectable } from '@angular/core';
import { BaseSupabaseService } from '@shared/services/base/base-supabase.service';
import { iExtra } from '../../interfaces/extra.interface';

@Injectable({
  providedIn: 'root',
})
export class ExtraService extends BaseSupabaseService {
  async getExtrasByFoodId(foodId: string): Promise<iExtra[]> {
    const foodExtras = await this.getAllByField<{ food_id: number, extra_id: number }>('food_extras', 'food_id', foodId, 'extra_id');

    const extraIds = foodExtras.map((item) => item.extra_id);

    if (extraIds.length === 0) return [];

    return this.getAllByFieldIn('extras', 'id', extraIds);

  }

  async getExtrasByCategory(categoryId: number): Promise<iExtra[]> {
   return this.getAllByField<{ category_id: number, extra_id: number }>('category_extras', 'category_id', categoryId, 'extra_id')
    .then(async (categoryExtras) => {
      const extraIds = categoryExtras.map((ce) => ce?.extra_id);
      if (extraIds.length === 0) return [];

      return this.getAllByFieldIn('extras', 'id', extraIds);
    });
  }
}
