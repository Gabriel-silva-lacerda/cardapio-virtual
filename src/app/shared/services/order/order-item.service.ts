import { Injectable } from '@angular/core';
import { BaseSupabaseService } from '../base/base-supabase.service';
import { iOrderItem } from '@shared/interfaces/order/order-item.interface';

@Injectable({
  providedIn: 'root'
})
export class OrderItemService extends BaseSupabaseService {
  protected override table = 'order_items';

  async createItem(orderId: number, item: any): Promise<iOrderItem> {
    return this.insert({
      order_id: orderId,
      food_id: item.food_id,
      quantity: item.quantity,
      observations: item.observations,
    });
  }
}
