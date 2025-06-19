import { Injectable } from '@angular/core';
import { BaseSupabaseService } from '../base/base-supabase.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentTokenService extends BaseSupabaseService {
  protected override table = 'payment_tokens';
}
