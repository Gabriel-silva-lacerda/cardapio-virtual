import { Injectable } from '@angular/core';
import { BaseSupabaseService } from '@shared/services/base/base-supabase.service';
import { iFullMenu } from '@shared/interfaces/food/food.interface';
import { getImageUrl } from '@shared/utils/getImage/get-image.utits';

@Injectable({
  providedIn: 'root'
})
export class FullMenuViewService extends BaseSupabaseService {
  protected override table = 'full_menu_view';

  async fullMenu(companyId: string): Promise<iFullMenu[]> {
    const data = await this.getAllByField<iFullMenu>('company_id', companyId);

    // Se o retorno for nulo ou vazio, retorne array vazio
    if (!data || data.length === 0) {
      return [];
    }

    // Ajusta as URLs das imagens em todos os alimentos dentro das subcategorias
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
