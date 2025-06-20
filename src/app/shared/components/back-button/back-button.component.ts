import { Location } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CompanyService } from '@shared/services/company/company.service';
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
  @Input() customClass = '';

  private router = inject(Router);
  private location = inject(Location);
  private companyService = inject(CompanyService);

  goBack() {
    const currentUrl = this.router.url;
    this.location.back();

    setTimeout(() => {
      if (this.router.url === currentUrl) {
        this.router.navigate(['/app', this.companyService.companyName()]);
      }
    }, 100);
  }
}
