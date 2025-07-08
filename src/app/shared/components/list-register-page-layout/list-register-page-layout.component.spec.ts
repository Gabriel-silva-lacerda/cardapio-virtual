import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListRegisterPageLayoutComponent } from './list-register-page-layout.component';

describe('ListRegisterPageLayoutComponent', () => {
  let component: ListRegisterPageLayoutComponent;
  let fixture: ComponentFixture<ListRegisterPageLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListRegisterPageLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListRegisterPageLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
