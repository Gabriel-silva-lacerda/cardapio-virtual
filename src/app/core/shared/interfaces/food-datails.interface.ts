export interface FoodDetails {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string | null;
  quantity?: number;
  totalPrice?: number;
}
