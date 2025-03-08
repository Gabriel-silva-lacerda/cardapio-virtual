import { SupabaseService } from '@shared/services/supabase/supabase.service';
import { Injectable, inject } from '@angular/core';

interface Order {
  user_id: string | undefined;
  items: {
    food_id: number;
    quantity: number;
    observations: string;
    extras: { extra_id: number; extra_quantity: number }[];
  }[];
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private supabaseService = inject(SupabaseService)

  async createOrder(order: Order) {
    // Inserir o pedido na tabela "orders"
    const { data: orderData, error: orderError } = await this.supabaseService.supabase
      .from('orders')
      .insert([{ user_id: order.user_id, status: 'pending', payment_status: 'pending', // Status inicial do pagamento
        external_reference: null }])
      .select()
      .single();

    if (orderError) throw orderError;

    const orderId = orderData.id;

  //   const { error: updateError } = await this.supabaseService.supabase
  //   .from('orders')
  //   .update({ external_reference: orderId })
  //   .eq('id', orderId);

  // if (updateError) throw updateError;

    // Inserir os itens do pedido na tabela "order_items"
    for (const item of order.items) {
      const { data: itemData, error: itemError } = await this.supabaseService.supabase
        .from('order_items')
        .insert([
          {
            order_id: orderId,
            food_id: item.food_id,
            quantity: item.quantity,
            observations: item.observations,
          },
        ])
        .select()
        .single();

      if (itemError) throw itemError;

      const itemId = itemData.id;

      // Inserir os adicionais na tabela "order_item_extras"
      for (const extra of item.extras) {
        const { error: extraError } = await this.supabaseService.supabase
          .from('order_item_extras')
          .insert([
            {
              item_id: itemId,
              extra_id: extra.extra_id,
              extra_quantity: extra.extra_quantity,
            },
          ]);

        if (extraError) throw extraError;
      }
    }

    return { orderId };
  }

  async updatePaymentStatus(orderId: number | null, paymentStatus: string) {
    const { data, error } = await this.supabaseService.supabase
      .from('orders')
      .update({ payment_status: paymentStatus })
      .eq('id', orderId);

    if (error) throw error;

    console.log(`Status do pagamento do pedido ${orderId} atualizado para "${paymentStatus}"`);
  }
}
