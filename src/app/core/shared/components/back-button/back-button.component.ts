import { Location } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { Router } from '@angular/router';

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
  @Input() customClass = '';

  goBack() {
    const currentUrl = this.router.url;
    this.location.back();

    setTimeout(() => {
      if (this.router.url === currentUrl) {
        this.router.navigate(['/']);
      }
    }, 100);
  }
}
