import { Injectable, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, filter } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FooterService {
  private showFooterSignal = signal<boolean>(false);
  showFooter = this.showFooterSignal.asReadonly();

  setShowFooter(value: boolean) {
    this.showFooterSignal.set(value);
  }
}
