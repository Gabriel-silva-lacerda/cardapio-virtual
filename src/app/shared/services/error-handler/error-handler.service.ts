import { inject, Injectable } from '@angular/core';
import { errorTranslationsMessages } from '@shared/constants/error-translations-messages';
import { ToastService } from '../toast/toast.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  private toast = inject(ToastService);

  private translateErrorMessage(errorMessage: string): string {
    const errorTranslations = errorTranslationsMessages;

    return errorTranslations[errorMessage] || errorMessage;
  }

  public handleError(errorMessage: string, context: string = 'Erro') {
    const translatedMessage = this.translateErrorMessage(errorMessage);
    this.toast.error(translatedMessage);
  }

}
