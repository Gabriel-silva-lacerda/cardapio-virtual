import { Component, inject, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DynamicFormComponent } from '@shared/components/dynamic-form/dynamic-form.component';

@Component({
  selector: 'app-edit-and-remove-extra-dialog',
  imports: [],
  templateUrl: './edit-and-remove-extra-dialog.component.html',
  styleUrl: './edit-and-remove-extra-dialog.component.scss'
})
export class EditAndRemoveExtraDialogComponent {
    @ViewChild(DynamicFormComponent) dynamicForm!: DynamicFormComponent;

  public dialogRef = inject(MatDialogRef<EditAndRemoveExtraDialogComponent>);
}
