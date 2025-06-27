import { inject } from '@angular/core';
import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { fade } from '@shared/utils/animations.util';

@Component({
  selector: 'app-not-found',
  template: `
    <div class="flex flex-col items-center justify-center min-h-screen bg-white-light p-6" @fade>
      <h1 class="text-9xl font-extrabold text-primary DEFAULT mb-4">404</h1>
      <h2 class="text-3xl font-semibold mb-2 text-black DEFAULT">Página Não Encontrada</h2>
      <p class="text-gray-700 max-w-md text-center mb-6">
        A página que você está procurando não existe ou foi removida.
      </p>
      <a
        (click)="goBack()"
        class="inline-block bg-primary DEFAULT text-white px-6 py-3 rounded-md shadow hover:bg-primary dark:hover:bg-primary-dark transition"
      >
        Voltar para o Início
      </a>
    </div>
  `,
  animations: [fade]
})
export class NotFoundPage {
  private location = inject(Location);

  goBack() {
    this.location.back();
  }
}
