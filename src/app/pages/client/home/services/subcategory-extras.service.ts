import { Injectable } from '@angular/core';
import { BaseSupabaseService } from '@shared/services/base/base-supabase.service';

@Injectable({
  providedIn: 'root'
})
export class SubcategoryExtrasService extends BaseSupabaseService  {
  protected override table = 'subcategory_extras';
}
