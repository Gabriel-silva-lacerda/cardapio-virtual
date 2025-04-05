import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchCompanyDialogComponent } from './search-company-dialog.component';

describe('SearchCompanyDialogComponent', () => {
  let component: SearchCompanyDialogComponent;
  let fixture: ComponentFixture<SearchCompanyDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchCompanyDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchCompanyDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
