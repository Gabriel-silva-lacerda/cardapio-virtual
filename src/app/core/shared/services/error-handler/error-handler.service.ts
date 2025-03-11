import { inject, Injectable } from '@angular/core';
import { errorTranslationsMessages } from '@shared/constants/error-translations-messages';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  private toastr = inject(ToastrService);

  private translateErrorMessage(errorMessage: string): string {
    const errorTranslations = errorTranslationsMessages;

    return errorTranslations[errorMessage] || errorMessage;
  }

  public handleError(errorMessage: string, context: string = 'Erro') {
    const translatedMessage = this.translateErrorMessage(errorMessage);
    this.toastr.error(translatedMessage, context);
  }

}
