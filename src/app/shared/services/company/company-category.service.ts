import { Injectable } from '@angular/core';
import { BaseSupabaseService } from '../base/base-supabase.service';

@Injectable({
  providedIn: 'root'
})
export class CompanyCategoryService extends BaseSupabaseService {
  protected override table = 'company_categories';
}
