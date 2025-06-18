import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FooterClientComponent } from '@core/layout/footer-client/footer-client.component';
import { HeaderClientComponent } from '@core/layout/header-client/header-client.component';
import { fade } from '@shared/utils/animations.utils';

@Component({
  selector: 'app-page-layout-client',
  imports: [HeaderClientComponent, FooterClientComponent, NgClass],
  templateUrl: './page-layout-client.component.html',
  styleUrl: './page-layout-client.component.scss',
  animations: [fade]
})
export class PageLayoutClientComponent {
  @Input() title = '';
  @Input() showFooter = true;
  @Input() showHeader = true;
  @Input() isHome = false;

}
