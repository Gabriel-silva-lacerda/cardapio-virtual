import { iExtra } from 'src/app/pages/selected-food/interfaces/extra.interface';
import { iFood } from './food.interface';

export interface iCartItem {
  id: string | null;
  food: iFood;
  quantity: number;
  totalPrice: number;
  extras: any;
  observations?: string;
}
