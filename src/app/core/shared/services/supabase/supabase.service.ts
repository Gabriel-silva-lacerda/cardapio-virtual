import { Injectable } from '@angular/core';
import { environment } from '@enviroment/environment.development';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.SUPABASE_URL,
      environment.SUPABASE_KEY,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      }
    );
  }
}
