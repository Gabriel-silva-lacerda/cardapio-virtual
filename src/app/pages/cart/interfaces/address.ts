export interface DeliveryAddress {
  id: string;
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  complement?: string;
  city: string;
  state: string;
  is_default: boolean;
  user_id: string;
}
