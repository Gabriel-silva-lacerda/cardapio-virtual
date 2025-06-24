import { Injectable } from '@angular/core';
import { BaseSupabaseService } from '../base/base-supabase.service';

@Injectable({
  providedIn: 'root'
})
export class FoodCategoriesViewService extends BaseSupabaseService {
  protected override table = 'foods_categories_view';
}
