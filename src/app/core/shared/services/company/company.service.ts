import { Injectable, signal } from '@angular/core';
import { BaseSupabaseService } from '../base/base-supabase.service';

@Injectable({
  providedIn: 'root'
})
export class CompanyService extends BaseSupabaseService {
  async checkIfCompanyOrEmailExists(name: string, email: string): Promise<{ exists: boolean; company?: any; email?: any }> {
    const { data: existingRecords, error } = await this.supabaseService.supabase
      .from('companies')
      .select('id, name, email')
      .or(`name.eq.${name},email.eq.${email}`);

    if (error) {
      throw new Error(error.message);
    }

    if (existingRecords && existingRecords.length > 0) {
      return {
        exists: true,
        company: existingRecords.find(record => record.name === name),
        email: existingRecords.find(record => record.email === email),
      };
    }

    return { exists: false };
  }
}
