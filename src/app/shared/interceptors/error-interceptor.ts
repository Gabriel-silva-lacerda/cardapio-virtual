import { HttpInterceptorFn } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { catchError, throwError } from 'rxjs';

export const ErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastr = inject(ToastrService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ocorreu um erro inesperado. Tente novamente mais tarde.';

      if (error.error instanceof ErrorEvent) {
        errorMessage = `Erro: ${error.error.message}`;
      } else {
        switch (error.status) {
          case 400:
            errorMessage = 'Requisição inválida. Verifique os dados enviados.';
            break;
          case 401:
            errorMessage = 'Não autorizado. Faça login e tente novamente.';
            break;
          case 404:
            errorMessage = 'Recurso não encontrado.';
            break;
          case 500:
            errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
            break;
          default:
            errorMessage = `Erro: ${error.status} - ${error.statusText}`;
            break;
        }
      }

      toastr.error(errorMessage, 'Erro');

      return throwError(() => error);
    })
  );
};
