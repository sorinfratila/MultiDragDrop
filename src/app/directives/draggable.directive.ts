import { Directive, Input, Renderer2, ElementRef, OnInit, SimpleChanges, OnChanges } from '@angular/core';

@Directive({
  selector: '[appDraggable]'
})
export class DraggableDirective implements OnInit, OnChanges {
  @Input() appDraggable: boolean;
  constructor(private renderer: Renderer2, private el: ElementRef) {  }

  ngOnInit(): void {
    
  }

  ngOnChanges(changes: SimpleChanges): void {
    const elem = this.el.nativeElement;
    if (this.appDraggable) {
      this.renderer.setAttribute(elem, 'draggable', 'true');
      console.log('setting to true');
    } else {
      this.renderer.setAttribute(elem, 'draggable', 'false');
      console.log('setting to false');
    }
  }
}
