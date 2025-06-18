import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAndRemoveExtraDialogComponent } from './edit-and-remove-extra-dialog.component';

describe('EditAndRemoveExtraDialogComponent', () => {
  let component: EditAndRemoveExtraDialogComponent;
  let fixture: ComponentFixture<EditAndRemoveExtraDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditAndRemoveExtraDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditAndRemoveExtraDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
