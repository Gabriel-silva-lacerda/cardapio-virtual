import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';
import { TitleService } from '@shared/services/title/title.service';
import { fade } from '@shared/utils/animations.util';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
  animations: [fade]
})
export class AuthComponent  {
  public titleService = inject(TitleService);
  private route = inject(ActivatedRoute);

  public companyName: string = '';

  ngOnInit(): void {
   this.route.paramMap.subscribe((params) => {
      const slug = params.get('companyName');
      this.companyName = slug
        ? slug.charAt(0).toUpperCase() + slug.slice(1).toLowerCase()
        : '';
  });
  }
}
