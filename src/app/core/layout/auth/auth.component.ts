import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
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
}
