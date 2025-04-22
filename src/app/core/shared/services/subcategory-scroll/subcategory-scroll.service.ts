// subcategory-scroll.service.ts
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SubcategoryScrollService {
  private _activeSubcategory = signal<string | null>(null);
  readonly activeSubcategory = this._activeSubcategory;

  private intersectionObserver: IntersectionObserver | null = null;

  // Método para ativar a subcategoria ao rolar
  setActiveSubcategory(id: string | null) {
    this._activeSubcategory.set(id);
  }

  // Método para rolar até a subcategoria específica
  scrollToSubcategory(subcategoryId: string, offset = 64) {
    const element = document.getElementById(`subcat-${subcategoryId}`);

    if (element) {
      const elementPosition =
        element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });

      setTimeout(() => {
        this.setActiveSubcategory(subcategoryId);
      }, 500);
    }
  }

  // Método para observar a rolagem da barra sticky e alternar a visibilidade
  observeStickyScroll({
    stickyElement,
    normalElement,
  }: {
    stickyElement: HTMLElement;
    normalElement: HTMLElement;
  }) {
    if (!stickyElement || !normalElement) {
      console.error('Elementos não encontrados!');
      return;
    }

    // Observer para mostrar/ocultar a barra sticky
    const headerObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === normalElement) {
            stickyElement.classList.toggle('hidden', entry.isIntersecting);
            stickyElement.classList.toggle('block', !entry.isIntersecting);
          }
        });
      },
      { threshold: [0] }
    );

    headerObserver.observe(normalElement);

    // Observer para as subcategorias
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const subcategoryId = entry.target.id.replace('subcat-', '');
            this.setActiveSubcategory(subcategoryId);
          }
        });
      },
      { threshold: 0.1, rootMargin: '-50px 0px -80% 0px' }
    );

    // Observar todas as subcategorias
    document.querySelectorAll('[id^="subcat-"]').forEach((el) => {
      this.intersectionObserver?.observe(el);
    });
  }
}
