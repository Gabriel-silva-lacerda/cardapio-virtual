import { Injectable } from '@angular/core';
import { BaseSupabaseService } from '../base/base-supabase.service';
import { iOrderItemExtra } from '@shared/interfaces/order/order-item-extra.interface';

@Injectable({
  providedIn: 'root'
})
export class OrderItemExtraService extends BaseSupabaseService {
  protected override table = 'order_item_extras';

  async createExtra(itemId: number, extra: any): Promise<iOrderItemExtra> {
    return this.insert({
      item_id: itemId,
      extra_id: extra.extra_id,
      extra_quantity: extra.extra_quantity,
    });
  }
}

