import { DayOfWeek } from "@shared/enums/day-of-week.enum";

export interface iFoodDetails {
  id: string | undefined;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string | null;
  quantity?: number;
  totalPrice?: number;
  day_of_week: DayOfWeek;
}
