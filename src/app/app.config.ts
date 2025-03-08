import {
  ApplicationConfig,
  inject,
  LOCALE_ID,
  provideAppInitializer,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { AuthService } from './domain/auth/services/auth.service';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideToastr } from 'ngx-toastr';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import localePt from '@angular/common/locales/pt';
import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ErrorInterceptor } from '@shared/interceptors/error-interceptor';
registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAppInitializer(() => inject(AuthService).load()),
    provideAnimationsAsync(),
    provideToastr(),
    provideHttpClient(withFetch()),
    provideHttpClient(
      withInterceptors([ErrorInterceptor])
    ),
    providePrimeNG({
      theme: {
        preset: Aura,
      },
    }),
    {
      provide: LOCALE_ID,
      useValue: 'pt-BR',
    },
  ],
};
