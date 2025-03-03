import { trigger, transition, style, animate } from '@angular/animations';

export const fadeIn = trigger('fadeIn', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('300ms 0s', style({ opacity: 1 }))
  ]),
  transition(':leave', [
    animate('300ms 0s', style({ opacity: 0 }))
  ])
]);
