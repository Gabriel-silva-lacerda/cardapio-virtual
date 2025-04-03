import { DayOfWeek } from "@shared/enums/day-of-week.enum";

export interface iFood {
  id?: number;
  name: string;
  description?: string;
  price: number;
  category_id?: number;
  image_url?: string | null;
  day_of_week: DayOfWeek;
  created_at?: string;
  company_id: number;
}
