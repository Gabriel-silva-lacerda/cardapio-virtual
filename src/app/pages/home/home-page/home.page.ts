import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { FoodMenuComponent } from '@shared/components/food-menu/food-menu.component';
import { fade } from '@shared/utils/animations.utils';
import { HeaderPageComponent } from 'src/app/core/pages/header-page/header-page.component';
import { FoodService } from '../../../core/shared/services/food/food.service';
import { CategoryService } from '../services/category.service';
import { iCategory } from '../interfaces/category.interface';
import { iFood } from '@shared/interfaces/food/food.interface';
import { CompanyService } from '@shared/services/company/company.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LocalStorageService } from '@shared/services/localstorage/localstorage.service';
import { CategoriesComponent } from '../../categories/components/categories/categories.component';
import { LoadingService } from '@shared/services/loading/loading.service';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { SkeletonLoaderComponent } from '@shared/components/skeleton-loader/skeleton-loader.component';
import { SkeletonCategoriesComponent } from '../../categories/components/skeleton-categories/skeleton-categories.component';
import { SKELETON_COUNT } from '@shared/constants/skeleton-count';
import { SkeletonFoodComponent } from '../../food/components/skeleton-food/skeleton-food.component';
import { KeyValuePipe, NgClass } from '@angular/common';

interface SubcategoryGroup {
  id: string;
  name: string;
  foods: iFood[];
}

interface CategoryGroup {
  id: string;
  name: string;
  subcategories: Record<string, SubcategoryGroup>;
}

@Component({
  selector: 'app-home-page',
  imports: [
    CategoriesComponent,
    FoodMenuComponent,
    HeaderPageComponent,
    RouterLink,
    SkeletonLoaderComponent,
    SkeletonCategoriesComponent,
    SkeletonFoodComponent,
    NgClass,
    KeyValuePipe,
  ],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
  animations: [fade],
})
export class HomePage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('stickySubcategories') stickySubcategories!: ElementRef;
  @ViewChild('normalSubcategories') normalSubcategories!: ElementRef;
  private localStorageService = inject(LocalStorageService);
  private route = inject(ActivatedRoute);
  private intersectionObserver?: IntersectionObserver;

  public loadingService = inject(LoadingService);
  public foodService = inject(FoodService);
  public categoryService = inject(CategoryService);
  public groupedFoods = signal<Record<string, CategoryGroup>>({});
  public groupedSubFoods = signal<Record<string, iFood[]>>({});
  public subcategories = signal<any>([]);

  public categories = signal<iCategory[]>([]);
  public companyName = this.localStorageService.getSignal<string>(
    'companyName',
    '[]'
  );
  public companyId = this.localStorageService.getSignal('companyId', '0');
  public activeSubcategory = signal<string | null>(null);

  ngOnInit() {
    this.getAllFoodAndCategories();
    this.getSubCategories();
    sessionStorage.removeItem('paymentRedirect');
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (
        this.stickySubcategories?.nativeElement &&
        this.normalSubcategories?.nativeElement
      ) {
        this.setupScrollObserver();
      }
    }, 1000);
  }

  ngOnDestroy() {
    this.intersectionObserver?.disconnect();
  }

  get skeletonItems(): number[] {
    return Array.from({ length: SKELETON_COUNT });
  }

  private async getAllFoodAndCategories() {
    this.loadingService.showLoading();

    try {
      const [foods, categories] = await Promise.all([
        await this.foodService.getAllFoodsGroupedByCategory(this.companyId()),
        this.categoryService.getAllByField<iCategory>(
          'company_categories_view',
          'company_id',
          this.companyId()
        ),
      ]);

      this.groupedFoods.set(foods);
      this.categories.set(categories);
    } finally {
      this.loadingService.hideLoading();
    }
  }

  private async getSubCategories() {
    const { data, error } = await this.categoryService.supabaseService.supabase
      .from('subcategories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Erro ao buscar subcategorias:', error);
      return;
    }

    this.subcategories.set(data);
  }

  private setupScrollObserver() {
    // Agora usamos as referências nativas
    const stickyElement = this.stickySubcategories?.nativeElement;
    const normalElement = this.normalSubcategories?.nativeElement;

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
            console.log('Subcategoria ativa:', subcategoryId);
            this.activeSubcategory.set(subcategoryId);
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

  scrollToSubcategory(subcategoryId: string) {
    const element = document.getElementById(`subcat-${subcategoryId}`);
    if (element) {
      // Calcula a posição considerando a barra sticky (64px é a altura estimada da barra)
      const offset = 64;
      const elementPosition =
        element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });

      // Atualiza a subcategoria ativa apenas após o scroll completar
      setTimeout(() => {
        this.activeSubcategory.set(subcategoryId);
      }, 500); // Tempo estimado para o scroll completar
    }
  }
}
