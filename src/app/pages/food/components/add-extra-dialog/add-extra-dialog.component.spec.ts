import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddExtraDialogComponent } from './add-extra-dialog.component';

describe('AddExtraDialogComponent', () => {
  let component: AddExtraDialogComponent;
  let fixture: ComponentFixture<AddExtraDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddExtraDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddExtraDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
