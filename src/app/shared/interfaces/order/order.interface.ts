
export interface iOrder {
  id: number;
  user_id: string;
  status: string;
  payment_status: string;
  external_reference: string | null;
  delivery_address_id: number | null;
  delivery: boolean;
}
