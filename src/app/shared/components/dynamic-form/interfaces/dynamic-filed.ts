import { FormGroup, ValidatorFn } from "@angular/forms";
import { eDynamicField } from "../enums/dynamic-field.enum";

export interface TypeControl {
  field: eDynamicField;
  typeField?: string;
}

export interface iDynamicField {
  name: string;
  label: string;
  type: string;
  validators?: ValidatorFn | ValidatorFn[];
  showForgotPassword?: boolean;
  forgotPasswordLink?: string;
  onChange?: (data: unknown | null | object | boolean | string | number | Event, form: FormGroup) => void;
  onFileUpload?: (file: File, form: FormGroup) => void;
  onClick?: (form?: any) => void;
  onEdit?: (form: FormGroup) => void;
  options?: { label: string; value: string | number | boolean }[];
  mask?: string;
  padding?: string;
  tooltip?: string;
  disabled?: boolean;
  directive?: string;
  placeholder?: string;
  customClass?: string;
  visibleIf?: (form: FormGroup) => boolean;
  defaultValue?: string | number | boolean;
  group?: any;
}

