import { ePurpose } from '@shared/enums/purpose.enum';

export interface PaymentToken {
  id: string;
  user_id: string;
  order_id: string;
  used: boolean;
  token: string;
  expires_at: string;
  created_at: string;
  purpose: ePurpose;
}
