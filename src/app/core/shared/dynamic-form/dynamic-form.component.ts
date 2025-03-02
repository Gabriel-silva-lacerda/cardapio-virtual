import { CommonModule } from '@angular/common';
import { Component, Inject, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ERROR_MESSAGES, ErrorMessages } from './errors/form-errors';
import { iDynamicField } from '@shared/dynamic-form/interfaces/dynamic-filed';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './dynamic-form.component.html',
  styleUrl: './dynamic-form.component.scss',
})
export class DynamicFormComponent implements OnInit {
  @Input() fields: iDynamicField[] = [];

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
      }, {} as any)
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
}
