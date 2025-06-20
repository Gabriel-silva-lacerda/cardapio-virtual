import { inject, Injectable, signal } from '@angular/core';
import { BaseSupabaseService } from '../base/base-supabase.service';
import { environment } from '@enviroment/environment.development';
import { getImageUrl } from '@shared/utils/getImage/get-image.utits';
import { LocalStorageService } from '../localstorage/localstorage.service';

@Injectable({
  providedIn: 'root'
})
export class CompanyService extends BaseSupabaseService {
  protected override table = 'companies';
  private localStorageService = inject(LocalStorageService);
  public companyName = this.localStorageService.getSignal<string>(
    'companyName',
    ''
  );
  public companyId = this.localStorageService.getSignal('companyId', '0');


  async checkIfCompanyOrEmailExists(name: string, email: string, unique_url: string): Promise<{ exists: boolean; company?: any; email?: any; unique_url?: any }> {
    const { data: existingRecords, error } = await this.supabaseService.supabase
      .from('companies')
      .select('id, name, email, unique_url')
      .or(`name.eq.${name},email.eq.${email},unique_url.eq.${unique_url}`);

    if (error) {
      throw new Error(error.message);
    }

    if (existingRecords && existingRecords.length > 0) {
      return {
        exists: true,
        company: existingRecords.find(record => record.name === name),
        email: existingRecords.find(record => record.email === email),
        unique_url: existingRecords.find(record => record.unique_url === unique_url),
      };
    }

    return { exists: false };
  }

  async searchCompanies(query: string, page: number, pageSize: number) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await this.supabaseService.supabase
      .from('companies')
      .select('*')
      .or(`name.ilike.%${query}%, city.ilike.%${query}%`)
      .range(from, to);

    if (error) throw error;

    const STORAGE_BASE_URL = `${environment.SUPABASE_STORAGE}`;

    return data.map(company => ({
      ...company,
      image_url: getImageUrl(company.image_url),
    }));
  }



}
