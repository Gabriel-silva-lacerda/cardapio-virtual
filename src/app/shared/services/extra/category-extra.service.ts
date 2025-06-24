import { Injectable } from '@angular/core';
import { BaseSupabaseService } from '../base/base-supabase.service';
import { iExtra } from '@shared/interfaces/extra/extra.interface';

@Injectable({
  providedIn: 'root'
})
export class CategoryExtraService extends BaseSupabaseService{
  protected override table = 'category_extras';

  async getExtrasByCategoryId(categoryId: string): Promise<iExtra[]> {
    const categoryExtras = await this.getAllByField<{ extras: iExtra }>(
      'category_id',
      categoryId,
      'extras(*)'
    );

    return categoryExtras.map(c => c.extras);
  }
}
