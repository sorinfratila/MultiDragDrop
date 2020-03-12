import { Directive, Input, Renderer2, ElementRef, SimpleChanges, OnChanges } from '@angular/core';

@Directive({
  selector: '[appDraggable]'
})
export class DraggableDirective implements OnChanges {
  @Input() appDraggable: boolean;
  constructor(private renderer: Renderer2, private el: ElementRef) {  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes) {
      const elem = this.el.nativeElement;
      if (this.appDraggable) this.renderer.setAttribute(elem, 'draggable', 'true');
      else this.renderer.setAttribute(elem, 'draggable', 'false');
    }
  }
}
