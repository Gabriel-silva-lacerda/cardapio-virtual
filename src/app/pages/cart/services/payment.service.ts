import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { iPreferenceItem } from '../interfaces/preference-item';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private http: HttpClient = inject(HttpClient);

  private apiUrl = 'https://localhost:7246/api/Payment'; // Substitua pela URL do seu backend
  constructor() {}

  createPreference(items: iPreferenceItem[], orderId: string): Observable<{ initPoint: string }> {
    const body = {
      items: items,
      externalReference: orderId,
      backUrls: {
        success: 'http://localhost:4200/successes-payment',
        pending: 'http://localhost:4200/',
        failure: 'http://localhost:4200/',
      },
    };


    return this.http.post<{ initPoint: string }>(
      `${this.apiUrl}/create-preference`,
      body
    );
  }
}
