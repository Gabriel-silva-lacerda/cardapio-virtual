import { NgClass } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  Input,
  ViewChild,
  signal,
  OnDestroy,
  Output,
  EventEmitter,
} from '@angular/core';
import { iSubcategory, iSubcategoryWithFoods } from '@shared/interfaces/subcategory/subcategory.interface';
import { SubcategoryScrollService } from '@shared/services/subcategory-scroll/subcategory-scroll.service';
import { IconButtonComponent } from '../icon-button/icon-button.component';

@Component({
  selector: 'app-subcategories',
  imports: [NgClass],
  templateUrl: './subcategories.component.html',
  styleUrl: './subcategories.component.scss',
})
export class SubcategoriesComponent implements AfterViewInit, OnDestroy {
  @Input() subcategories = signal<iSubcategoryWithFoods[]>([]);
  @Output() edit = new EventEmitter<{ id: string; name: string }>();
  @ViewChild('stickySubcategories', { static: false }) stickyRef!: ElementRef;
  @ViewChild('normalSubcategories', { static: false }) normalRef!: ElementRef;

  public scrollService = inject(SubcategoryScrollService);

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.stickyRef && this.normalRef) {
        this.scrollService.observeStickyScroll({
          stickyElement: this.stickyRef.nativeElement,
          normalElement: this.normalRef.nativeElement,
        });
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    this.scrollService.setActiveSubcategory(null);
  }

  scrollToSubcategory(id: string): void {
    this.scrollService.scrollToSubcategory(id);
  }
}
