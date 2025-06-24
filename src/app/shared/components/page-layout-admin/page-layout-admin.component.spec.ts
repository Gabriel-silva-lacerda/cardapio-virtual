import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageLayoutAdminComponent } from './page-layout-admin.component';

describe('PageLayoutAdminComponent', () => {
  let component: PageLayoutAdminComponent;
  let fixture: ComponentFixture<PageLayoutAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageLayoutAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageLayoutAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
