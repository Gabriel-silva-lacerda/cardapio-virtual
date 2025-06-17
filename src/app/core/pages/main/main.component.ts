import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { fade } from '@shared/utils/animations.utils';
import { AuthService } from 'src/app/domain/auth/services/auth.service';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';

@Component({
  selector: 'app-main',
  imports: [RouterOutlet, FooterComponent],
  templateUrl: './main.component.html',
  animations: [fade],
})
export class MainComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private localStorageService = inject(LocalStorageService);
  private companyName = this.localStorageService.getSignal<string>('companyName', '[]');

  ngOnInit(): void {
    if (this.authService.isAdmin()) {
       this.router.navigate(['app/admin'], {
        queryParams: { empresa: this.companyName() },
      });
    } else {
      this.router.navigate(['/']);
    }
  }
}
