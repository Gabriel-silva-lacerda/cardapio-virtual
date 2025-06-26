import { Injectable } from '@angular/core';
import { BaseSupabaseService } from '../base/base-supabase.service';

@Injectable({
  providedIn: 'root'
})
export class FoodAdminViewService extends BaseSupabaseService {
  protected override table = 'food_admin_view';
}
