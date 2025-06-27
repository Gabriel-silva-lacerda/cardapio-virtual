import { Injectable } from '@angular/core';
import { iFullMenu } from '@shared/interfaces/full-menu/full-menu.interface';
import { BaseSupabaseService } from '@shared/services/base/base-supabase.service';
import { getImageUrl } from '@shared/utils/getImage/get-image.utits';

@Injectable({
  providedIn: 'root'
})
export class FullMenuViewService extends BaseSupabaseService {
  protected override table = 'full_menu_view';

  async fullMenu(companyId: string): Promise<iFullMenu[]> {
    const data = await this.getAllByField<iFullMenu>('company_id', companyId);

    if (!data || data.length === 0) {
      return [];
    }

    for (const category of data) {
      if (category.subcategories) {
        for (const subcategory of category.subcategories) {
          if (subcategory.foods) {
            subcategory.foods = subcategory.foods.map(food => ({
              ...food,
              image_url: getImageUrl(food?.image_url !== undefined ? food?.image_url : ''),
            }));
          }
        }
      }
    }

    return data;
  }
}
