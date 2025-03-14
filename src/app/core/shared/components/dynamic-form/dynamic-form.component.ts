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
import { LoadingService } from '@shared/services/loading/loading.service';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    InputTextModule,
    NgxMaskDirective,
  ],
  templateUrl: './dynamic-form.component.html',
  styleUrl: './dynamic-form.component.scss',
  animations: [fadeIn],
})
export class DynamicFormComponent implements OnInit {
  @Input() fields: iDynamicField[] = [];
  @Input() buttonText!: string;
  @Output() submitEvent = new EventEmitter();
  @Output() fieldChangeEvent = new EventEmitter<{ fieldName: string; value: string }>();

  protected loadingService = inject(LoadingService);

  private fb = inject(FormBuilder);

  public form!: FormGroup;

  constructor(@Inject(ERROR_MESSAGES) private errors: ErrorMessages) {}

  ngOnInit() {
    this.creatForm();
  }

  creatForm() {
    this.form = this.fb.group(
      this.fields.reduce((acc, field) => {
        acc[field.name] = ['', field.validators || []];
        return acc;
      }, {} as { [key: string]: [string, ValidatorFn | ValidatorFn[]] })
    );
  }

  getErrorsMessages(fieldName: string): string[] {
    const control = this.form.get(fieldName);
    if (!control || !control.errors) return [];

    return Object.keys(control.errors || {}).map((errorKey) => {
      const errorFn = this.errors[errorKey];
      return errorFn
        ? errorFn(control.errors?.[errorKey])
        : `Erro desconhecido`;
    });
  }

  disableFields(fieldNames: string[]) {
    fieldNames.forEach((fieldName) => {
      this.form.get(fieldName)?.disable();
    });
  }

  enableFields(fieldNames: string[]) {
    fieldNames.forEach((fieldName) => {
      this.form.get(fieldName)?.enable();
    });
  }

  clearFields(fieldNames: string[]) {
    const clearValues = fieldNames.reduce((acc, fieldName) => {
      acc[fieldName] = null;
      return acc;
    }, {} as { [key: string]: any });

    this.form.patchValue(clearValues);
    this.enableFields(fieldNames);
  }

  submit = () => this.submitEvent.emit();
}
