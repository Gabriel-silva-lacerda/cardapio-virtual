import { signal } from '@angular/core';
import { BehaviorSubject, debounceTime, Subscription } from 'rxjs';

export abstract class BaseSearchPaginatedComponent<T> {
  protected searchQuery$ = new BehaviorSubject<string>('');
  protected searchSubscription!: Subscription;
  protected pageSize = 10;

  public items = signal<T[]>([]);
  public isLoading = signal(false);
  public currentPage = signal(1);
  public hasMoreData = signal(true);

  constructor() {
    this.searchSubscription = this.searchQuery$
      .pipe(debounceTime(500))
      .subscribe(query => {
        this.currentPage.set(1);
        this.hasMoreData.set(true);
        this.search(query, true);
      });
  }

  // Método abstrato que cada componente deve implementar
  protected abstract fetchData(query: string, page: number, pageSize: number): Promise<T[]>;

  async init() {
    await this.search('', true);
  }

  public onSearchChange(query: string) {
    this.searchQuery$.next(query);
  }

  public async search(query: string, reset: boolean = false) {
    if (this.isLoading() || !this.hasMoreData()) return;

    this.isLoading.set(true);
    try {
      const result = await this.fetchData(query, this.currentPage(), this.pageSize);
      const newData = result || [];

      if (reset) {
        this.items.set(newData);
        this.currentPage.set(1);
      } else {
        this.items.set([...this.items(), ...newData]);
      }

      this.hasMoreData.set(newData.length === this.pageSize);
    } finally {
      this.isLoading.set(false);
    }
  }

  public loadMore() {
    if (this.isLoading() || !this.hasMoreData()) return;
    this.currentPage.set(this.currentPage() + 1);
    this.search(this.searchQuery$.getValue(), false);
  }

  public destroy() {
    this.searchSubscription?.unsubscribe();
  }
}
