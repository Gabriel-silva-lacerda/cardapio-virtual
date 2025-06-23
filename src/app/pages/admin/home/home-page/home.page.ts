import { Component, inject } from '@angular/core';
import { AuthService } from 'src/app/domain/auth/services/auth.service';
import { RouterLink } from '@angular/router';
import { fade } from '@shared/utils/animations.utils';
import { CompanyService } from '@shared/services/company/company.service';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
  animations: [fade]
})
export class HomePage {
  public companyService = inject(CompanyService);
  public authService = inject(AuthService);

  ngOnInit() {
    this.authService.setAdminMode(true);
  }

}
