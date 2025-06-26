import { Injectable } from '@angular/core';
import { iSubcategory } from '@shared/interfaces/subcategory/subcategory.interface';
import { BaseSupabaseService } from '@shared/services/base/base-supabase.service';

@Injectable({
  providedIn: 'root'
})
export class SubcategoryService extends BaseSupabaseService  {
  protected override table = 'subcategories';

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
