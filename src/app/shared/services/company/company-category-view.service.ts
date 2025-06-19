import { Injectable } from '@angular/core';
import { BaseSupabaseService } from '../base/base-supabase.service';

@Injectable({
  providedIn: 'root'
})
export class CompanyCategoryViewService  extends BaseSupabaseService {
  protected override table = 'company_categories_view';
}
