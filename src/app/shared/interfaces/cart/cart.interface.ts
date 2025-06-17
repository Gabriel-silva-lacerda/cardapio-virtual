import { iExtra } from '../extra/extra.interface';
import { iFood } from '../food/food.interface';

export interface iCartItem {
  id: string | null;
  food: iFood;
  quantity: number;
  observations?: string;
  extras: { [key: string]: iExtra };
  totalPrice: number;
}
