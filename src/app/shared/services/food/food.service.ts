import { Injectable, signal } from '@angular/core';
import { iCartItem } from '@shared/interfaces/cart/cart.interface';
import { iExtra } from '@shared/interfaces/extra/extra.interface';
import { iFood } from '@shared/interfaces/food/food.interface';

@Injectable({
  providedIn: 'root'
})
export class FoodService {
  public selectedAdditions = signal<{ [key: string]: iExtra }>({});
  public observations = signal<string>('');
  public productCount = signal<number>(1);
  public totalAddition = signal<number>(0);

  public resetFoodValues() {
    this.selectedAdditions.set({});
    this.observations.set('');
    this.productCount.set(1);
  }

  getFoodDetails(food: iFood, cartItem?: iCartItem) {
    if (!food) return null;

    return {
      id: food.id,
      name: food.name,
      description: food.description,
      price: food.price,
      imageUrl: food.image_url,
      quantity: cartItem ? cartItem.quantity : undefined,
      totalPrice: cartItem ? cartItem.totalPrice : undefined,
      day_of_week: food.day_of_week,
    };
  }
}
