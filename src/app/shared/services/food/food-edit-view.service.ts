import { Injectable } from '@angular/core';
import { BaseSupabaseService } from '../base/base-supabase.service';

@Injectable({
  providedIn: 'root'
})
export class FoodEditViewService extends BaseSupabaseService {
  protected override table = 'food_edit_view';
}
