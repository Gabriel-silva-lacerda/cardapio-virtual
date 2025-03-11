import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { CompanyService } from '@shared/services/company/company.service';
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
  private companyService = inject(CompanyService);
  private localStorageService = inject(LocalStorageService);
  empresa: string | null = null;
  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.empresa = params['empresa'];
      if (this.empresa) {
        this.companyService.companyName.set(this.empresa);
        this.localStorageService.setItem('companyName', this.empresa);
        console.log('Empresa:', this.empresa); // Aqui você pode fazer algo com o nome da empresa
      }
    });
  }
}
