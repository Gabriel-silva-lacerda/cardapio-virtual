import { Injectable } from '@angular/core';
import { BaseSupabaseService } from '../base/base-supabase.service';

@Injectable({
  providedIn: 'root'
})
export class DeliveryAddressService extends BaseSupabaseService {
  protected override table = 'delivery_addresses';

  async createFromOrderAddress(orderId: number, address: any): Promise<any> {
    return this.insert({
      order_id: orderId,
      cep: address.cep,
      street: address.street,
      number: address.number,
      neighborhood: address.neighborhood,
      complement: address.complement || null,
    });
  }
}
