import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-company-login',
  imports: [],
  templateUrl: './company-login.component.html',
  styleUrl: './company-login.component.scss'
})
export class CompanyLoginComponent {
  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    // Captura o parâmetro :empresa da URL
    const empresa = this.route.snapshot.paramMap.get('empresa');

    if (empresa) {
      // Redireciona para a tela de login com o nome da empresa
      this.router.navigate(['/auth'], {
        queryParams: { empresa }, // Passa o nome da empresa como query parameter
      });
    } else {
      // Se não houver parâmetro, redireciona para a tela de login padrão
      this.router.navigate(['/auth']);
    }
  }
}
