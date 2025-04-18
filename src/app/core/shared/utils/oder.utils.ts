import { iCartItem } from '@shared/interfaces/cart/cart.interface';

export const transformCartItemsToOrderItems = (cartItems: any[]) => {
  return cartItems.map((item) => ({
    food_id: item.food.id,
    quantity: item.quantity,
    observations: item.observations,
    extras: Object.keys(item.extras).map((extraId) => ({
      extra_id: extraId,
      extra_quantity: item.extras[extraId].quantity,
    })),
  }));
};

export const createPreferenceItems = (items: iCartItem[], orderId: number) => {
  return items.map((item) => ({
    id: item.id,
    title: `Pedido #${orderId}`,
    quantity: item.quantity,
    unitPrice: item.food.price,
    currencyId: 'BRL',
  }));
};
