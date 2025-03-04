import { Component, computed, inject, Signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { fade } from '@shared/utils/animations.util';
import { FooterService } from '@shared/services/title/footer.service';

@Component({
  selector: 'app-main',
  imports: [RouterOutlet, FooterComponent],
  templateUrl: './main.component.html',
  animations: [fade],
})
export class MainComponent {

}
