import { environment } from '@enviroment/environment.development';
import { Injectable } from '@angular/core';
import { BaseService } from '../base/base.service';
import { map } from 'rxjs';
import { ViaCep } from '@shared/interfaces/via-cep/via-cep';

@Injectable({
  providedIn: 'root',
})
export class ViacepService extends BaseService {
  getCep(cep: string) {
    return this.http
      .get<ViaCep>(this.apiCep + cep + '/json')
      .pipe(map((response) => response));
  }
}
