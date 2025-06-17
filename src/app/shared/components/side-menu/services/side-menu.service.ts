import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SideMenuService {
  public collapsed = signal(false);
}
