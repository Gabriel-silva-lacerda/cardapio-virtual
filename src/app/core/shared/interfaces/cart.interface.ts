import { iExtra } from 'src/app/pages/selected-food/interfaces/extra.interface';
import { iFood } from './food.interface';
import { DayOfWeek } from '@shared/enums/day-of-week.enum';

export interface iCartItem {
  id: string | null;
  food: iFood;
  quantity: number;
  observations?: string;
  extras: { [key: string]: iExtra };
  totalPrice: number;
}
