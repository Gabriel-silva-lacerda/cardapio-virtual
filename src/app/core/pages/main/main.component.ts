import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { fade } from '@shared/utils/animations.util';

@Component({
  selector: 'app-main',
  imports: [RouterOutlet, FooterComponent],
  templateUrl: './main.component.html',
  animations: [fade],
})
export class MainComponent {}
