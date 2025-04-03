import { trigger, transition, style, animate, state, query, animateChild } from '@angular/animations';

export const fadeIn = trigger('fadeIn', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('300ms 0s', style({ opacity: 1 }))
  ]),
  transition(':leave', [
    animate('300ms 0s', style({ opacity: 0 }))
  ])
]);

export const fade =  trigger('fade', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('500ms 0.1s', style({ opacity: 1 })),
  ]),
  transition(':leave', [
    animate('500ms 0s', style({ opacity: 0 })),
  ]),
]);

export const fadeInOut =  trigger('fadeInOut', [
  state('void', style({ opacity: 0 })),
  transition(':enter', [
    style({ opacity: 0 }),
    animate('300ms 0.2s', style({ opacity: 1 }))
  ]),
  // transition(':leave', [
  //   animate('300ms  0s', style({ opacity: 0 }))
  // ])
]);

export const expandAnimation = trigger('expandAnimation', [
  transition(':enter', [
    style({ height: '0px', opacity: 0 }),
    animate('300ms ease-out', style({ height: '*', opacity: 1 }))
  ]),
  transition(':leave', [
    animate('200ms ease-in', style({ height: '0px', opacity: 0 }))
  ])
])
