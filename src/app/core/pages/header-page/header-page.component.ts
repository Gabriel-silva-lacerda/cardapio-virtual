import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BackButtonComponent } from '@shared/components/back-button/back-button.component';

@Component({
  selector: 'app-header-page',
  imports: [RouterLink, BackButtonComponent],
  templateUrl: './header-page.component.html',
  styleUrl: './header-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderPageComponent {
  @Input() title!: string;
  @Input() isHome: boolean = false;
  @Input() showInput: boolean = true;
  @Input() link: string = '/'
}
