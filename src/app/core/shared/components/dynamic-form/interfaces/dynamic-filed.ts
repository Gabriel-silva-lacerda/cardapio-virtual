import { eDynamicField } from "../enums/dynamic-field.enum";

export interface TypeControl {
  field: eDynamicField;
  typeField?: string;
}

export interface iDynamicField {
  name: string;
  label: string;
  type: string;
  validators?: any[];
  showForgotPassword?: boolean;
  forgotPasswordLink?: string;
  buttonText?: string;
}

