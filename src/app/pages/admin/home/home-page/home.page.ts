import { Component, inject } from '@angular/core';
import { AuthService } from 'src/app/domain/auth/services/auth.service';
import { RouterLink } from '@angular/router';
import { fade } from '@shared/utils/animations.utils';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
  animations: [fade]
})
export class HomePage {
  private localStorageService = inject(LocalStorageService);

  public companyName = this.localStorageService.getSignal<string>(
    'companyName',
    ''
  );
  public authService = inject(AuthService);

}
