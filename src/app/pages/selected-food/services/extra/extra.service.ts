import { Injectable } from '@angular/core';
import { BaseSupabaseService } from '@shared/services/base/base-supabase.service';
import { iExtra } from '../../interfaces/extra.interface';

@Injectable({
  providedIn: 'root',
})
export class ExtraService extends BaseSupabaseService {
  async getExtrasByFoodId(foodId: string): Promise<iExtra[]> {
    const { data, error } = await this.supabaseService.supabase
      .from('food_extras')
      .select('extra_id')
      .eq('food_id', foodId);

    if (error) {
      this.toastr.error(
        `Erro ao buscar os extras para o alimento com ID ${foodId}:`,
        error.message
      );
      return [];
    }

    const extraIds = data.map((item) => item.extra_id);

    if (extraIds.length === 0) return [];

    const { data: extras, error: extrasError } =
      await this.supabaseService.supabase
        .from('extras')
        .select('*')
        .in('id', extraIds);

    if (extrasError) {
      this.toastr.error(
        `Erro ao buscar os detalhes dos extras:`,
        extrasError.message
      );
      return [];
    }

    return extras;
  }
}
