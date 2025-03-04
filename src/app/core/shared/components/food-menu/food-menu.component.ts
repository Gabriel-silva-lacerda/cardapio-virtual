import { CurrencyPipe, registerLocaleData } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, LOCALE_ID } from '@angular/core';
import localePt from '@angular/common/locales/pt';
import { RouterLink } from '@angular/router';

registerLocaleData(localePt);

@Component({
  selector: 'app-food-menu',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './food-menu.component.html',
  styleUrl: './food-menu.component.scss',
  providers: [
    {
      provide: LOCALE_ID, useValue: 'pt-BR'
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FoodMenuComponent {
  @Input() food!: any;
}
