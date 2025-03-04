import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header-page',
  imports: [RouterLink],
  templateUrl: './header-page.component.html',
  styleUrl: './header-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderPageComponent {
  @Input() title!: string;
  @Input() isHome: boolean = false;
}
