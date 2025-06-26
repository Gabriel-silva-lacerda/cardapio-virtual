import { ValidatorFn } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Inject,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ERROR_MESSAGES, ErrorMessages } from './errors/form-errors';
import { iDynamicField } from '@shared/components/dynamic-form/interfaces/dynamic-filed';
import { InputTextModule } from 'primeng/inputtext';
import { fadeIn } from '@shared/utils/animations.utils';
import { NgxMaskDirective } from 'ngx-mask';
import { MultiSelectModule } from 'primeng/multiselect';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OnlyNumbersDirective } from 'src/app/widget/directives/only-numbers.directive';
import { IconButtonComponent } from '../icon-button/icon-button.component';

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    InputTextModule,
    NgxMaskDirective,
    MultiSelectModule,
    MatTooltipModule,
    OnlyNumbersDirective,
    IconButtonComponent
  ],
  templateUrl: './dynamic-form.component.html',
  styleUrl: './dynamic-form.component.scss',
  animations: [fadeIn],
})
export class DynamicFormComponent implements OnInit {
  @Input() fields: iDynamicField[] = [];
  @Input() buttonText!: string;
  @Input() isEdit = false;

  @Output() fieldChangeEvent = new EventEmitter<{
    fieldName: string;
    value: string;
  }>();

  private fb = inject(FormBuilder);

  public form!: FormGroup;
  public selectedFileName!: string;
  public imagePreviewUrl: string | null = null;
  public isDisabled: { [key: string]: boolean } = {};

  constructor(@Inject(ERROR_MESSAGES) private errors: ErrorMessages) {}

  ngOnInit() {
    this.creatForm();
  }

  creatForm() {
    this.form = this.fb.group(
      this.fields.reduce((acc, field) => {
        acc[field.name] =
          field.type === 'multiselect'
            ? [[], field.validators || []]
            : ['', field.validators || []];

        return acc;
      }, {} as { [key: string]: [any, ValidatorFn | ValidatorFn[]] })
    );
  }

  onFileSelected(event: Event, field: iDynamicField) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      this.form.patchValue({ [field.name]: file.name });
      this.selectedFileName = file.name;
      this.imagePreviewUrl = URL.createObjectURL(file);

      if (field.onFileUpload) {
        field.onFileUpload(file, this.form);
      }
    }
  }

  getErrorsMessages(fieldName: string): string[] {
    const control = this.form.get(fieldName);
    const errors = control?.errors;

    if (!errors) return [];

    return Object.keys(errors).map((errorKey) => {
      if (errorKey === 'customError' && errors['customError']) {
        return errors['customError'];
      }

      const errorFn = this.errors[errorKey];
      return errorFn ? errorFn(errors[errorKey]) : `Erro desconhecido`;
    });
  }

disableFields(fieldNames: string[]) {
  fieldNames.forEach(fieldName => {
    const control = this.form.get(fieldName);
    if (control && !control.disabled) {
      control.disable();
    }
  });
  // Atualize isDisabled para refletir isso no template
  fieldNames.forEach(fieldName => this.isDisabled[fieldName] = true);
}

enableFields(fieldNames: string[]) {
  fieldNames.forEach(fieldName => {
    const control = this.form.get(fieldName);
    if (control && control.disabled) {
      control.enable();
    }
  });
  // Atualize isDisabled para refletir isso no template
  fieldNames.forEach(fieldName => this.isDisabled[fieldName] = false);
}


  clearFields(fieldNames: string[]) {
    const clearValues = fieldNames.reduce((acc, fieldName) => {
      acc[fieldName] = null;
      return acc;
    }, {} as { [key: string]: any });

    this.form.patchValue(clearValues);
    this.enableFields(fieldNames);
  }
}
