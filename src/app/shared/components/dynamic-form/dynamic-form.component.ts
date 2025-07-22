import { AbstractControl, ValidatorFn } from '@angular/forms';
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
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ERROR_MESSAGES, ErrorMessages } from './errors/form-errors';
import { iDynamicField } from '@shared/components/dynamic-form/interfaces/dynamic-filed';
import { InputTextModule } from 'primeng/inputtext';
import { fadeIn } from '@shared/utils/animations.util';
import { NgxMaskDirective } from 'ngx-mask';
import { MultiSelectModule } from 'primeng/multiselect';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OnlyNumbersDirective } from 'src/app/widget/directives/only-numbers.directive';
import { IconButtonComponent } from '../icon-button/icon-button.component';
import { DatePickerModule } from 'primeng/datepicker';
import { formatTime } from './shared/utils/time.utils';

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    InputTextModule,
    NgxMaskDirective,
    MultiSelectModule,
    MatTooltipModule,
    OnlyNumbersDirective,
    IconButtonComponent,
    DatePickerModule
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
  public tempTimeInterval: { [key: string]: { start?: string; end?: string } } = {};

  constructor(@Inject(ERROR_MESSAGES) private errors: any) {}

  ngOnInit() {
    this.creatForm();
  }

  creatForm() {
    this.form = this.fb.group(
      this.fields.reduce((acc, field) => {
        const initialValue = field.defaultValue !== undefined ? field.defaultValue : '';

        const finalInitialValue = field.type === 'multiselect'
          ? (field.defaultValue !== undefined ? field.defaultValue : [])
          : initialValue;

        acc[field.name] = [finalInitialValue, field.validators || []];

        return acc;
      }, {} as { [key: string]: [any, ValidatorFn | ValidatorFn[]] })
    );
  }

  onFileSelected(event: Event, field: iDynamicField) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      this.form.patchValue({ [field.name]: file });
      this.selectedFileName = file.name;
      this.imagePreviewUrl = URL.createObjectURL(file);

      if (field.onFileUpload) {
        field.onFileUpload(file, this.form);
      }
    } else {
      this.selectedFileName = '';
      this.imagePreviewUrl = null;
      this.form.get(field.name)?.setValue(null);
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

      const errorFn = (this.errors as any)[errorKey];
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
    fieldNames.forEach(fieldName => this.isDisabled[fieldName] = true);
  }

  enableFields(fieldNames: string[]) {
    fieldNames.forEach(fieldName => {
      const control = this.form.get(fieldName);
      if (control && control.disabled) {
        control.enable();
      }
    });
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

  onTimeSelect(fieldName: string, type: 'start' | 'end', value: Date | null) {
    const interval = this.tempTimeInterval[fieldName] ||= {};

    if (value === null) {
      interval[type] = undefined;
    } else {
      interval[type] = formatTime(value);
    }

    const start = interval.start;
    const end = interval.end;
    const formatted = start && end ? `${start}-${end}` : null;

    this.form.patchValue({ [fieldName]: formatted });
  }

  onTimeInputClear(event: any, fieldName: string, type: 'start' | 'end') {
    const value = event?.target?.value;
    if (value === '') {
      this.onTimeSelect(fieldName, type, null);
    }
  }
}
