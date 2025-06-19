import { Injectable } from '@angular/core';
import { BaseSupabaseService } from '@shared/services/base/base-supabase.service';

@Injectable({
  providedIn: 'root'
})
export class UserCompanyService extends BaseSupabaseService {
  protected override table = 'user_companies';
}
