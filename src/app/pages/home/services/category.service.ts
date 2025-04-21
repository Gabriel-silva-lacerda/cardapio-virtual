import { Injectable } from '@angular/core';
import { BaseSupabaseService } from '@shared/services/base/base-supabase.service';
import { iCategory } from '../interfaces/category.interface';

@Injectable({
  providedIn: 'root',
})
export class CategoryService extends BaseSupabaseService {
  async getAssociatedCategories(companyId: string): Promise<any[]> {
    const { data, error } = await this.supabaseService.supabase
      .from('company_categories')
      .select('category_id')
      .eq('company_id', companyId);

    if (error) {
      console.error('Erro ao obter categorias associadas:', error);
      return [];
    }

    return data.map((item) => ({ id: item.category_id }));
  }
}
