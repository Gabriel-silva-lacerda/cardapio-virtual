import { Injectable } from '@angular/core';
import { BaseSupabaseService } from '@shared/services/base/base-supabase.service';
import { iCategory } from '../interfaces/category.interface';

@Injectable({
  providedIn: 'root',
})
export class CategoryService extends BaseSupabaseService {
  private async getCategoriesByCompanyId(companyId: number): Promise<iCategory[]> {
    const companyCategories = await this.getAllByField<{ category_id: number }>(
      'company_categories',
      'company_id',
      companyId,
      'category_id'
    );

    const categoryIds = companyCategories.map(item => item.category_id);

    const { data, error } = await this.supabaseService.supabase
      .from('categories')
      .select('*')
      .in('id', categoryIds);

    if (error) {
      this.toastr.error('Erro ao buscar categorias:', error.message);
      throw new Error(error.message);
    }

    return data as iCategory[];
  }

  public async getCategoriesByCompanyUrl(companyId: number): Promise<iCategory[]> {
    const { data: userData } = await this.supabaseService.supabase.auth.getUser();
    const user = userData?.user;

    if (user) {
      const userRole = await this.getByField<{ role: string }>('user_companies', 'user_id', user.id);
      if (userRole?.role === 'admin') {
        return await this.getAll<iCategory>('categories');
      }
    }

    return await this.getCategoriesByCompanyId(companyId);
  }

  public async getCategoriesByCompany(companyId: number): Promise<iCategory[]> {
    return await this.getCategoriesByCompanyId(companyId);
  }
  
  async getAssociatedCategories(companyId: number): Promise<any[]> {
    const { data, error } = await this.supabaseService.supabase
      .from('company_categories')
      .select('category_id')
      .eq('company_id', companyId);

    if (error) {
      console.error('Erro ao obter categorias associadas:', error);
      return [];
    }

    return data.map(item => ({ id: item.category_id }));
  }

}
