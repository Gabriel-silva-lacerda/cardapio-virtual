import { Injectable } from '@angular/core';
import { BaseSupabaseService } from '@shared/services/base/base-supabase.service';
import { iCategory } from '../interfaces/category.interface';
import { iSubcategory } from '@shared/interfaces/subcategory/subcategory.interface';

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
      this.toastr.error('Erro ao obter categorias associadas:', error.message);
      return [];
    }

    return data.map((item) => ({ id: item.category_id }));
  }

  async getSubcategories(): Promise<iSubcategory[] | undefined> {
    const { data, error } = await this.supabaseService.supabase
      .from('subcategories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      this.toastr.error('Erro ao buscar subcategorias:', error.message);
      return;
    }

    return data as iSubcategory[];
  }
}
