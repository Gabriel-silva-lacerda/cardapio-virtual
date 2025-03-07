import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { fade } from '@shared/utils/animations.util';
import { CartComponent } from '@shared/components/cart/cart.component';

@Component({
  selector: 'app-main',
  imports: [RouterOutlet, FooterComponent, CartComponent],
  templateUrl: './main.component.html',
  animations: [fade],
})
export class MainComponent {


}
