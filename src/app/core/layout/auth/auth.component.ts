import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';
import { TitleService } from '@shared/services/title/title.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent  {
  public titleService = inject(TitleService);
  private route = inject(ActivatedRoute);
  private localStorageService = inject(LocalStorageService);

  public companyName: string = '';

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const paramCompanyName = params['empresa'];
      this.companyName = paramCompanyName.charAt(0).toUpperCase() + paramCompanyName.slice(1).toLowerCase();
      if (this.companyName) {
        this.localStorageService.setItem('companyName', paramCompanyName);
      }
    });
  }
}
