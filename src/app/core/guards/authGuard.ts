import { Injectable, inject } from '@angular/core';
import {
  CanActivate,
  Router,
} from '@angular/router';
import { AuthService } from 'src/app/domain/auth/services/auth.service';


@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(): boolean {
    if (!this.authService.isLogged()) {
      this.router.navigate(['/auth']);
      console.log("Aqui")
      return false;
    }
    
    return true;
  }
}
