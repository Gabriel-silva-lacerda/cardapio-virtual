import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { fade } from '@shared/utils/animations.utils';
import { AuthService } from 'src/app/domain/auth/services/auth.service';

@Component({
  selector: 'app-main',
  imports: [RouterOutlet, FooterComponent],
  templateUrl: './main.component.html',
  animations: [fade],
})
export class MainComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  constructor() {
    if (this.authService.isAdmin()) {
      this.router.navigate(['/app/admin']);
    } else {
      this.router.navigate(['/']);
    }
  }
}
