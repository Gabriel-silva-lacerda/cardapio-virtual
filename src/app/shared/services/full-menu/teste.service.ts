import { Injectable } from '@angular/core';
import { BaseSupabaseService } from '../base/base-supabase.service';

@Injectable({
  providedIn: 'root'
})
export class TesteService extends BaseSupabaseService {
  protected override table = 'flat_company_menu';

    async getMenu(companyId: string): Promise<any[] | null> {
    const { data, error } = await this.supabaseService.supabase
      .rpc('get_food_admin_grouped_by_company', { company: companyId });

    if (error) {
      console.error('Erro ao buscar menu:', error);
      return null;
    }

    return data; // já é o JSON do cardápio
  }
}
