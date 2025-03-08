import { Injectable } from '@angular/core';
import { BaseSupabaseService } from '../base/base-supabase.service';
import { iInsertOrder } from '@shared/interfaces/insert-order.interface';
import { iOrder } from '@shared/interfaces/order.interface';
import { iOrderItem } from '@shared/interfaces/order-item.interface';
import { iOrderItemExtra } from '@shared/interfaces/order-item-extra.interface';

@Injectable({
  providedIn: 'root',
})
export class OrderService extends BaseSupabaseService {
  async createOrder(order: iInsertOrder) {
    const orderData = await this.insert<iOrder>('orders', {
      user_id: order.user_id,
      status: 'pending',
      payment_status: 'pending',
      external_reference: null,
    });

    const orderId = orderData.id;

    //   const { error: updateError } = await this.supabaseService.supabase
    //   .from('orders')
    //   .update({ external_reference: orderId })
    //   .eq('id', orderId);

    // if (updateError) throw updateError;

    for (const item of order.items) {
      const itemData = await this.insert<iOrderItem>('order_items', {
        order_id: orderId,
        food_id: item.food_id,
        quantity: item.quantity,
        observations: item.observations,
      });

      const itemId = itemData?.id;

      for (const extra of item.extras) {
        await this.insert<iOrderItemExtra>('order_item_extras', {
          item_id: itemId,
          extra_id: extra.extra_id,
          extra_quantity: extra.extra_quantity,
        });
      }
    }

    return { orderId };
  }

  async updatePaymentStatus(orderId: number, paymentStatus: string): Promise<void> {
    try {
      await this.update("orders", orderId, { payment_status: paymentStatus });
      console.log(`Status do pagamento do pedido ${orderId} atualizado para "${paymentStatus}"`);
    } catch (error) {
      console.error('Erro ao atualizar status do pagamento:', error);
      throw error;
    }
  }
}
