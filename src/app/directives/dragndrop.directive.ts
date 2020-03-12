import { Directive, Output, EventEmitter, HostListener } from '@angular/core';

const DIRECTION = {
  LEFT: 'left',
  RIGHT: 'right',
}

@Directive({
  selector: '[appDragNDrop]'
})
export class DragndropDirective {
  @Output() dropEvent = new EventEmitter<any>();
  @Output() dragStartEvent = new EventEmitter<any>();
  @Output() dragOverEvent = new EventEmitter<any>();
  @Output() dragEnterEvent = new EventEmitter<any>();
  @Output() dragLeaveEvent = new EventEmitter<any>();

  dropPointLocation: any = Object.create(null);
  dragOverTileId: number;

  constructor() {
    this.dropPointLocation = {
      hasLeft: '',
      direction: DIRECTION.RIGHT,
    };
    this.dragOverTileId = 0;
  }

  @HostListener('dragover', ['$event'])
  dragOverHandler = (ev: any) => {
    const { target } = ev;
    ev.preventDefault();
    this.dragOverTileId = Number(target.getAttribute('id').replace(/\D/g, '')) === 999
      ? null
      : Number(target.getAttribute('id').replace(/\D/g, ''));

    this.dragOverEvent.emit(this.dragOverTileId);
  };

  @HostListener('dragstart', ['$event'])
  dragStartHandler = (ev: any) => {
    const { target, dataTransfer } = ev;
    target.style.border = 'dashed 0.2px';
    dataTransfer.setData('Text', ev.target.getAttribute('id'));
    this.dragOverTileId = Number(target.getAttribute('id').replace(/\D/g, '')) === 999
      ? null
      : Number(target.getAttribute('id').replace(/\D/g, ''));

    this.dragStartEvent.emit(this.dragOverTileId);
  };

  @HostListener('dragenter', ['$event'])
  dragEnterHandler = (ev: any) => {
    const { target } = ev;
    target.style.border = 'dashed 0.2px';
    if (Number(target.getAttribute('id').replace(/\D/g, '')) !== 999) {
      // this.dropPointLocation = null;
      this.dragEnterEvent.emit(null);
    }
  };

  @HostListener('dragleave', ['$event'])
  dragLeaveHandler = (ev: any) => {
    const { offsetX, offsetY, target } = ev;
    ev.target.style.border = 'none';
    this.dropPointLocation = this.setDropPointLocation({
      target: Number(target.getAttribute('id').replace(/\D/g, '')),
      offsetX,
      offsetY
    });

    this.dragLeaveEvent.emit(this.dropPointLocation);
  };

  @HostListener('drop', ['$event'])
  dropHandler = (ev: any) => {
    console.log('drop', ev);
    ev.preventDefault();
    const transferData = ev.dataTransfer.getData('Text');
    ev.target.style.border = 'none';

    this.dropEvent.emit({ transferData });
  };

  private setDropPointLocation({ offsetX, offsetY, target }) {
    if (offsetY >= 240 || offsetY <= 0) {
      // it means the tile has been dragged either from above or from below
      // nothing happens
      return null;
    } else {
      if (target !== 999) {
        if (offsetX >= 140) {
          return {
            hasLeft: target,
            direction: DIRECTION.RIGHT,
          };
        }

        return {
          hasLeft: target,
          direction: DIRECTION.LEFT,
        };
      }

      return null;
    }
  }
}
