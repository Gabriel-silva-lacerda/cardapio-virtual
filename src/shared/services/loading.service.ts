import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  public loading = signal(false);

  public showLoading(): void {
    this.loading.set(true);
  }

  public hideLoading(): void {
    this.loading.set(false);
  }
}
