import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageLayoutClientComponent } from './page-layout-client.component';

describe('PageLayoutClientComponent', () => {
  let component: PageLayoutClientComponent;
  let fixture: ComponentFixture<PageLayoutClientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageLayoutClientComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageLayoutClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
