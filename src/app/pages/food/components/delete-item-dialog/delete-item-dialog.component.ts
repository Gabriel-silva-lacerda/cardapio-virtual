import { ToastrService } from 'ngx-toastr';
import { Component, inject, signal, ViewChild } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { DynamicFormComponent } from '@shared/components/dynamic-form/dynamic-form.component';
import { iDynamicField } from '@shared/components/dynamic-form/interfaces/dynamic-filed';
import { iFood } from '@shared/interfaces/food.interface';
import { FoodService } from '@shared/services/food/food.service';
import { ImageService } from '@shared/services/image/image.service';

@Component({
  selector: 'app-delete-item-dialog',
  imports: [DynamicFormComponent],
  templateUrl: './delete-item-dialog.component.html',
  styleUrl: './delete-item-dialog.component.scss'
})
export class DeleteItemDialogComponent {
  @ViewChild(DynamicFormComponent) dynamicForm!: DynamicFormComponent;
  private imageService = inject(ImageService);
  private toastr = inject(ToastrService);

  public items = signal<iFood[]>([]);
  public foodService = inject(FoodService);
  public deleteFields: iDynamicField[] = [
    {
      name: 'item_id',
      label: 'Item para Deletar',
      type: 'select',
      options: [],
      validators: [Validators.required],
      padding: '10px',
    },
  ];

  constructor(public dialogRef: MatDialogRef<DeleteItemDialogComponent>) {}

  async ngOnInit() {
    this.items.set(await this.foodService.getAll('foods'));
    this.deleteFields[0].options = this.items().map(i => ({ label: i.name, value: i.id }));
  }

  async onDelete() {
    const { item_id } = this.dynamicForm.form.value;
    const { image_url } = this.items().find(item => item.id === +item_id) as iFood;

    if (item_id && image_url) {
      const deleted = await this.imageService.deleteImage(image_url);
      const error = await this.foodService.delete('foods', item_id);

      if (!error && deleted) {
        this.toastr.success('Item deletado com sucesso!')
        this.dialogRef.close(true);
      }
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
