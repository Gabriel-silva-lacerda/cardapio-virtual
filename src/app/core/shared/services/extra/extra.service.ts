import { Injectable } from '@angular/core';
import { BaseSupabaseService } from '@shared/services/base/base-supabase.service';
import { iExtra } from '../../interfaces/extra/extra.interface';

@Injectable({
  providedIn: 'root',
})
export class ExtraService extends BaseSupabaseService {
  async getExtrasByFoodId(foodId: string): Promise<iExtra[]> {
    const foodExtras = await this.getAllByField<{
      food_id: number;
      extra_id: number;
    }>('food_extras', 'food_id', foodId, 'extra_id');

    const extraIds = foodExtras.map((item) => item.extra_id);

    if (extraIds.length === 0) return [];

    return this.getAllByFieldIn('extras', 'id', extraIds);
  }

  async getExtrasBySubCategory(subcategoryId: string): Promise<iExtra[]> {
    const { data, error } = await this.supabaseService.supabase
      .from('subcategory_extras_view')
      .select('*')
      .eq('subcategory_id', subcategoryId);

    if (error) {
      this.toastr.error('Erro ao buscar os extras', error.message);
      return [];
    }

    return data;
  }

  async addExtra(
    extra: { name: string; price: number },
    subcategoryId: string
  ): Promise<iExtra> {
    const extraData = await this.insert<iExtra>('extras', {
      name: extra.name,
      price: extra.price,
    });

    const extraId = extraData.id;

    await this.insert('subcategory_extras', {
      subcategory_id: subcategoryId,
      extra_id: extraId,
    });

    return extraData;
  }
}
