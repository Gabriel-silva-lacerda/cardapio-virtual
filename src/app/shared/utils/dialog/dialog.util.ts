import { MatDialog } from "@angular/material/dialog";
import { ConfirmDialogComponent } from "@shared/dialogs/confirm-dialog/confirm-dialog.component";
import { ConfirmDialogOptions } from "@shared/interfaces/dialog/dialog.interface";

export function openConfirmDialog<T = any>(
  dialog: MatDialog,
  options: ConfirmDialogOptions<T>
): void {
  const dialogRef = dialog.open(ConfirmDialogComponent, {
    width: '350px',
    data: {
      title: options.title,
      message: options.message,
      confirmText: options.confirmText ?? 'Confirmar',
      cancelText: options.cancelText ?? 'Cancelar',
      onConfirm: () => options.onConfirm(options.payload, dialogRef),
    },
  });
}
