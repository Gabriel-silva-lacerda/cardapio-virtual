import { FoodExtrasService } from './../food/food-extras.service';
import { inject, Injectable } from '@angular/core';
import { BaseSupabaseService } from '@shared/services/base/base-supabase.service';
import { iExtra } from '../../interfaces/extra/extra.interface';
import { SubcategoryExtrasService } from 'src/app/pages/client/home/services/subcategory-extras.service';

@Injectable({
  providedIn: 'root',
})
export class ExtraService extends BaseSupabaseService {
  protected override table = 'extras';

  private foodExtrasService = inject(FoodExtrasService);
  private subcategoryExtraService = inject(SubcategoryExtrasService);

  async getExtrasByFoodId(foodId: string): Promise<iExtra[]> {
    const foodExtras = await this.foodExtrasService.getAllByField<{
      food_id: number;
      extra_id: number;
    }>('food_id', foodId, 'extra_id');

    const extraIds = foodExtras.map((item) => item.extra_id);

    if (extraIds.length === 0) return [];

    return this.getAllByFieldIn('id', extraIds);
  }

  async addExtra(
    extra: { name: string; price: number },
    subcategoryId: string
  ): Promise<iExtra> {
    const extraData = await this.insert<iExtra>({
      name: extra.name,
      price: extra.price,
    });

    const extraId = extraData.id;

    await this.subcategoryExtraService.insert({
      subcategory_id: subcategoryId,
      extra_id: extraId,
    });

    return extraData;
  }
}
