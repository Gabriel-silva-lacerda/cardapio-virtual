export interface ConfirmDialogOptions<T = any> {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  payload?: T;
  onConfirm: (payload?: T, dialogRef?: any) => void;
}
