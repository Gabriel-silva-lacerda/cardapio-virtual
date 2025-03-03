import { NgFor } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-rings',
  template: `
    <div class="absolute top-20 left-[-10px] flex flex-col gap-2 z-0">
      <div *ngFor="let _ of rings" class="w-8 h-8 border-l border-[#333] rounded-[10px]"></div>
    </div>
  `,
  imports: [NgFor],
})
export class RingsComponent  {
  @Input() public rings: number[] = [];
}
