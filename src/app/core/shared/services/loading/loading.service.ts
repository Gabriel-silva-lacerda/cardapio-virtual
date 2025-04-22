import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  public loading = signal(false);

  public showLoading(): void {
    this.loading.set(true);
    document.body.classList.add('overflow-hidden', 'h-screen');
  }

  public hideLoading(): void {
    this.loading.set(false);
    document.body.classList.remove('overflow-hidden', 'h-screen');
  }
}
