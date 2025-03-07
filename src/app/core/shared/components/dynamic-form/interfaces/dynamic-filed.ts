import { ValidatorFn } from "@angular/forms";
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
}

