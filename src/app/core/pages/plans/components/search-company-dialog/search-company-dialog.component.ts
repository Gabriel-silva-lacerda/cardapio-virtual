import { NgFor } from '@angular/common';
import { Component, inject, Inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Company } from '@shared/interfaces/company/company';
import { CompanyService } from '@shared/services/company/company.service';
import { BehaviorSubject, debounceTime, Subject } from 'rxjs';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { Router } from '@angular/router';
import { SearchInputComponent } from '@shared/components/search-input/search-input.component';

@Component({
  selector: 'app-search-company-dialog',
  imports: [FormsModule, NgFor, SearchInputComponent, LoadingComponent],
  templateUrl: './search-company-dialog.component.html',
  styleUrl: './search-company-dialog.component.scss'
})
export class SearchCompanyDialogComponent {
  private searchQuery$ = new BehaviorSubject<string>('');
  private pageSize = 10;
  private router = inject(Router);

  public companies = signal<Company[]>([]);
  public filteredCompanies = signal<Company[]>([]);
  public isLoading = signal(false);
  public currentPage = signal(1);
  public hasMoreData = signal(true);


  constructor(
    public dialogRef: MatDialogRef<SearchCompanyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private companyService: CompanyService
  ) {
    this.searchQuery$.pipe(debounceTime(500)).subscribe(query => {
      this.currentPage.set(1);
      this.hasMoreData.set(true);
      this.searchCompanies(query, true);
    });
  }

  async ngOnInit() {
    await this.searchCompanies('', true);
  }

  onSearchChange(query: string) {
    this.searchQuery$.next(query);
  }

  async searchCompanies(query: string, reset: boolean = false) {
    if (this.isLoading() || !this.hasMoreData()) return;

    this.isLoading.set(true);

    try {
      const response = await this.companyService.searchCompanies(query, this.currentPage(), this.pageSize);
      const newCompanies = response || [];

      if (reset) {
        this.filteredCompanies.set(newCompanies);
      } else {
        this.filteredCompanies.set([...this.filteredCompanies(), ...newCompanies]);
      }

      this.hasMoreData.set(newCompanies.length === this.pageSize);
    } finally {
      this.isLoading.set(false);
    }
  }

  onScroll(event: any) {
    if (!this.hasMoreData()) return;

    const { scrollTop, scrollHeight, clientHeight } = event.target;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      this.loadMore();
    }
  }

  goToCompany(companyName: string | undefined) {
    this.router.navigate(['/auth', companyName]);
    this.dialogRef.close();
  }

  loadMore() {
    if (this.isLoading() || !this.hasMoreData()) return;

    this.currentPage.set(this.currentPage() + 1);
    this.searchCompanies(this.searchQuery$.getValue(), false);
  }

  selectCompany(company: any) {
    this.dialogRef.close(company);
  }

  closeDialog() {
    this.dialogRef.close();
  }
}

