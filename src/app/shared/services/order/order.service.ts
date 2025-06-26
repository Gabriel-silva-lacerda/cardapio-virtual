import { inject, Injectable, signal } from '@angular/core';
import { BaseSupabaseService } from '../base/base-supabase.service';
import { iInsertOrder } from '@shared/interfaces/insert-order/insert-order.interface';
import { iOrder } from '@shared/interfaces/order/order.interface';
import { DeliveryAddressService } from './delivery-address.service';
import { OrderItemService } from './order-item.service';
import { OrderItemExtraService } from './order-item-extra.service';

@Injectable({
  providedIn: 'root',
})
export class OrderService extends BaseSupabaseService {
  protected override table = 'orders';

  private deliveryAddressService = inject(DeliveryAddressService);
  private orderItemService = inject(OrderItemService);
  private orderItemExtraService = inject(OrderItemExtraService);

  public showPayment = signal(false);

  async createOrder(order: iInsertOrder, orderAddress: any) {
    const orderData = await this.insert<iOrder>({
      user_id: order.user_id,
      status: 'pending',
      payment_status: 'pending',
      external_reference: null,
      delivery_address_id: null,
      delivery: orderAddress.delivery,
    });

    const orderId = orderData.id;

    await this.update(orderId, { external_reference: orderId });

    if (orderAddress.delivery) {
      const address = await this.deliveryAddressService.createFromOrderAddress(orderId, orderAddress.address);
      await this.update(orderId, { delivery_address_id: address.id });
    }

    for (const item of order.items) {
      const createdItem = await this.orderItemService.createItem(orderId, item);

      for (const extra of item.extras) {
        if(createdItem.id === undefined) return;
        await this.orderItemExtraService.createExtra(createdItem?.id, extra);
      }
    }

    return { orderId };
  }

  async getAddressByFields(address: any) {
    return this.supabaseService.supabase
      .from('delivery_addresses')
      .select('*')
      .eq('street', address.street)
      .eq('number', address.number)
      .eq('neighborhood', address.neighborhood)
      .eq('city', address.city)
      .eq('state', address.state)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          return false;
        }
        return data;
      });
  }

  async updatePaymentStatus(
    orderId: number,
    paymentStatus: string
  ): Promise<void> {
    try {
      await this.update(orderId, { payment_status: paymentStatus });
      console.log(
        `Status do pagamento do pedido ${orderId} atualizado para "${paymentStatus}"`
      );
    } catch (error) {
      console.error('Erro ao atualizar status do pagamento:', error);
      throw error;
    }
  }
}
