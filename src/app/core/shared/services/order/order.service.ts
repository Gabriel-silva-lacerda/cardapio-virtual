import { Injectable, signal } from '@angular/core';
import { BaseSupabaseService } from '../base/base-supabase.service';
import { iInsertOrder } from '@shared/interfaces/insert-order/insert-order.interface';
import { iOrder } from '@shared/interfaces/order/order.interface';
import { iOrderItem } from '@shared/interfaces/order-item/order-item.interface';
import { iOrderItemExtra } from '@shared/interfaces/order-item-extra/order-item-extra.interface';

interface teste {
  id: number;
  order_id: number,
  // name: string,
  cep: string,
  street: string,
  number: number,
  neighborhood: string,
  complement: string | null
}
@Injectable({
  providedIn: 'root',
})
export class OrderService extends BaseSupabaseService {
  showPayment = signal(false);

  async createOrder(order: iInsertOrder, orderAddress: any) {
    const orderData = await this.insert<iOrder>('orders', {
      user_id: order.user_id,
      status: 'pending',
      payment_status: 'pending',
      external_reference: null,
      delivery_address_id: null,
      delivery: orderAddress.delivery
    });

    const orderId = orderData.id;

    await this.update("orders", orderId, { external_reference: orderId });

    if (orderAddress.delivery) {
      const addressData = await this.insert<teste>('delivery_addresses', {
        order_id: orderId,
        cep: orderAddress.address.cep,
        street: orderAddress.address.street,
        number: orderAddress.address.number,
        neighborhood: orderAddress.address.neighborhood,
        complement: orderAddress.address.complement || null 
      });
  
      await this.update("orders", orderId, { delivery_address_id: addressData.id });
    }

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
