import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseSearchPaginatedComponent } from './base-search-paginated.component';

describe('BaseSearchPaginatedComponent', () => {
  let component: BaseSearchPaginatedComponent;
  let fixture: ComponentFixture<BaseSearchPaginatedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BaseSearchPaginatedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BaseSearchPaginatedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
