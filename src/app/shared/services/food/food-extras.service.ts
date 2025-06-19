import { Injectable } from '@angular/core';
import { BaseSupabaseService } from '../base/base-supabase.service';

@Injectable({
  providedIn: 'root'
})
export class FoodExtrasService  extends BaseSupabaseService {
  protected override table = 'food_extras';
}
