import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TitleService } from '@shared/services/title/title.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterOutlet, AsyncPipe],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent  {
  private titleService = inject(TitleService);
  public title$ = this.titleService.title$;
}
