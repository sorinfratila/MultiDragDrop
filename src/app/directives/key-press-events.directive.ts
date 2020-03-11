import { Directive, HostListener, Output, EventEmitter } from '@angular/core';

@Directive({
  selector: '[appKeyPressEvents]',
})
export class KeyPressEventsDirective {
  @Output() metaKeyAPressed = new EventEmitter<any>();
  @Output() escapePressed = new EventEmitter<boolean>();

  constructor() {  }

  /**
   * Listener for Keyboard events
   * @param e event that is triggered on keyboard key press;
   */
  @HostListener('document:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {

    if (e.ctrlKey && e.code === 'KeyA') {
      e.preventDefault();
      this.metaKeyAPressed.emit({ metaKey: false, ctrlKey: true });
    }

    if (e.metaKey && e.code === 'KeyA') {
      e.preventDefault();
      this.metaKeyAPressed.emit({ metaKey: true, ctrlKey: false });
    }

    if (e.code === 'Escape') {
      e.preventDefault();
      this.escapePressed.emit(true);
    }
  }
}
