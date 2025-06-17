export interface iInsertOrder {
  user_id: string | undefined;
  items: {
    food_id: number;
    quantity: number;
    observations: string;
    extras: { extra_id: number; extra_quantity: number }[];
  }[];
}
