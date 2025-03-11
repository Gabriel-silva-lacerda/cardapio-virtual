import { Location } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';

@Component({
  selector: 'app-back-button',
  imports: [],
  template: `
  <button
    (click)="goBack()"
    class="{{ customClass }}"
  >
    <
  </button>`,
})
export class BackButtonComponent {
  private router = inject(Router);
  private location = inject(Location);
  private localStorageService = inject(LocalStorageService);
  public companyName = this.localStorageService.getSignal<string>('companyName', '[]');
  @Input() customClass = '';

  goBack() {
    const currentUrl = this.router.url;
    this.location.back();

    setTimeout(() => {
      if (this.router.url === currentUrl) {
        this.router.navigate(['/app'], { queryParams: { empresa: this.companyName() } });
      }
    }, 100);
  }
}
