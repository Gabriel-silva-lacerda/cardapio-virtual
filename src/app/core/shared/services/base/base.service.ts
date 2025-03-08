import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export abstract class BaseService {
  protected http: HttpClient = inject(HttpClient);
  protected toastr: ToastrService = inject(ToastrService);
  protected apiUrl: string = environment.API_URL;

  // Método genérico para GET (buscar todos os itens)
  get<T>(path?: string): Observable<T[]> {
    const url = path ? `${this.apiUrl}/${path}` : this.apiUrl;
    return this.http.get<T[]>(url).pipe(
      catchError((error) => {
        this.toastr.error('Erro ao buscar dados.', 'Erro');
        return throwError(() => error);
      })
    );
  }

  // Método genérico para GET por ID (buscar um item específico)
  getById<T>(id: number | string, path?: string): Observable<T> {
    const url = path ? `${this.apiUrl}/${path}/${id}` : `${this.apiUrl}/${id}`;
    return this.http.get<T>(url).pipe(
      catchError((error) => {
        this.toastr.error('Erro ao buscar item.', 'Erro');
        return throwError(() => error);
      })
    );
  }

  // Método genérico para POST (criar um novo item)
  post<T>(body: any, path?: string): Observable<T> {
    const url = path ? `${this.apiUrl}/${path}` : this.apiUrl;
    return this.http.post<T>(url, body).pipe(
      catchError((error) => {
        this.toastr.error('Erro ao criar item.', 'Erro');
        return throwError(() => error);
      })
    );
  }

  // Método genérico para PUT (atualizar um item existente)
  update<T>(id: number | string, body: any, path?: string): Observable<T> {
    const url = path ? `${this.apiUrl}/${path}/${id}` : `${this.apiUrl}/${id}`;
    return this.http.put<T>(url, body).pipe(
      catchError((error) => {
        this.toastr.error('Erro ao atualizar item.', 'Erro');
        return throwError(() => error);
      })
    );
  }

  // Método genérico para DELETE (remover um item)
  delete(id: number | string, path?: string): Observable<void> {
    const url = path ? `${this.apiUrl}/${path}/${id}` : `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url).pipe(
      catchError((error) => {
        this.toastr.error('Erro ao excluir item.', 'Erro');
        return throwError(() => error);
      })
    );
  }
}
