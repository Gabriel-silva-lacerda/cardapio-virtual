export interface FoodDetails {
  id: number | undefined;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string | null;
  quantity?: number;
  totalPrice?: number;
}
