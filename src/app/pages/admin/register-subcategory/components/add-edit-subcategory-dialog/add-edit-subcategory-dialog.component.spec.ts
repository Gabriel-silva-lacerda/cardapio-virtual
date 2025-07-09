import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditSubcategoryDialogComponent } from './add-edit-subcategory-dialog.component';

describe('AddEditSubcategoryDialogComponent', () => {
  let component: AddEditSubcategoryDialogComponent;
  let fixture: ComponentFixture<AddEditSubcategoryDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditSubcategoryDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditSubcategoryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
