import { Injectable } from '@angular/core';
import { BaseSupabaseService } from '../base/base-supabase.service';

@Injectable({
  providedIn: 'root'
})
export class TesteService extends BaseSupabaseService {
  protected override table = 'flat_company_menu';
}
