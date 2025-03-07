import { inject, Injectable, signal } from '@angular/core';
import { iCartItem } from '@shared/interfaces/cart.interface';
import { iFood } from '@shared/interfaces/food.interface';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';
import { iExtra } from '../../interfaces/extra.interface';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private localStorageService = inject(LocalStorageService);
  private cartItems = signal<iCartItem[]>(this.localStorageService.getItem<iCartItem[]>('cart') || []);

  // Adiciona ou atualiza um item no carrinho
  public addOrUpdateCartItem(item: iCartItem, isNewItem: boolean): void {
    const currentCart = this.cartItems();
    const existingItemIndex = currentCart.findIndex(cartItem => cartItem.food.id === item.food?.id);

    if (!isNewItem && existingItemIndex !== -1) {
      // Edita um item existente
      currentCart[existingItemIndex] = { ...currentCart[existingItemIndex], ...item };
    } else if (existingItemIndex !== -1) {
      // Atualiza um item existente (aumenta quantidade, etc.)
      this.updateExistingItem(currentCart[existingItemIndex], item);
    } else {
      // Adiciona um novo item ao carrinho
      currentCart.push(item);
    }

    this.cartItems.set([...currentCart]);
    this.localStorageService.setItem('cart', currentCart);
  }

  // Atualiza um item existente no carrinho
  private updateExistingItem(existingItem: iCartItem, newItem: iCartItem): void {
    existingItem.quantity += newItem.quantity;
    existingItem.totalPrice = existingItem.quantity * existingItem.food.price;

    // Atualiza os adicionais
    Object.keys(newItem.extras).forEach(key => {
      if (existingItem.extras[key]) {
        existingItem.extras[key].quantity += newItem.extras[key].quantity;
      } else {
        existingItem.extras[key] = newItem.extras[key];
      }
    });

    // Concatena observações
    if (newItem.observations) {
      existingItem.observations = existingItem.observations
        ? `${existingItem.observations} | ${newItem.observations}`
        : newItem.observations;
    }
  }

  // Calcula o preço total de um item (produto + adicionais)
  public calculateTotalPrice(food: iFood | null, quantity: number, additions: { [key: string]: iExtra }): number {
    const foodPrice = food?.price || 0;
    const additionsTotal = Object.values(additions).reduce((sum, item) => sum + item.quantity * item.price, 0);
    return foodPrice * quantity + additionsTotal;
  }
}
