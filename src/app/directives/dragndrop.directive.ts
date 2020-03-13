import { Directive, Output, EventEmitter, HostListener, Input } from '@angular/core';

const DIRECTION = {
  LEFT: 'left',
  RIGHT: 'right',
  ABOVE_OR_BELLOW: 'aboveOrBellow',
};

@Directive({
  selector: '[appDragNDrop]',
})
export class DragndropDirective {
  @Input() multiSelectionState: boolean;
  @Output() dropEvent = new EventEmitter<any>();
  @Output() dragStartEvent = new EventEmitter<any>();
  @Output() dragOverEvent = new EventEmitter<any>();
  @Output() dragEnterEvent = new EventEmitter<any>();
  @Output() dragLeaveEvent = new EventEmitter<any>();

  dropPointLocation: any = Object.create(null);
  dragOverTileId: number;
  isFirstEnter: boolean;

  constructor() {
    this.isFirstEnter = true;
    this.dropPointLocation = {
      hasLeft: '',
      direction: DIRECTION.RIGHT,
    };
    this.dragOverTileId = 0;
  }

  @HostListener('dragover', ['$event'])
  dragOverHandler = (ev: any) => {
    const { target } = ev;
    try {
      ev.preventDefault();
      this.dragOverTileId =
        Number(target.getAttribute('id').replace(/\D/g, '')) === 999
          ? null
          : Number(target.getAttribute('id').replace(/\D/g, ''));

      // TODO: logic to add an element that shows where the drop will be made, needs further refinment
      // if (Number(target.getAttribute('id').replace(/\D/g, '')) === 999) {
      //   if (this.isFirstEnter) {
      //     console.log(ev);
      //     console.log('inserting');
      //     const div = document.createElement('div');
      //     div.setAttribute('id', 'insertHere');
      //     div.style.position = 'absolute';
      //     div.style.width = '2rem';
      //     div.style.height = '24rem';
      //     div.style.backgroundColor = 'red';
      //     console.log(this.dropPointLocation);

      //     // if (!this.dropPointLocation) div.style.left = `${ev.offsetX + 100}px`;
      //     div.style.left = `${ev.offsetX - 20}px`;
      //     const scene = document.getElementById('scene-999');
      //     if (scene) scene.appendChild(div);
      //     this.isFirstEnter = false;
      //   }
      // }
      this.dragOverEvent.emit(this.dragOverTileId);
    } catch (e) {
      // add neutral notification here
    }
  };

  @HostListener('dragstart', ['$event'])
  dragStartHandler = (ev: any) => {
    const { target, dataTransfer } = ev;
    // TODO: how to create a different element that drags along the cursor
    // const dragIcon = document.createElement('div');
    // const el = document.getElementById('scene-wrapper');
    // el.appendChild(dragIcon);
    // dragIcon.style.position = 'absolute';
    // dragIcon.style.left = '-1000px';
    // dragIcon.style.width = '100px';
    // dragIcon.style.height = '100px';
    // dragIcon.style.borderRadius = '100px';
    // dragIcon.style.backgroundColor = 'red';
    // END/how to create a different element that drags along the cursor
    ev.dataTransfer.setDragImage(target, -5, -5); // setting the drag el relative to the cursor pointer at (-5, -5)
    dataTransfer.setData('Text', ev.target.getAttribute('id'));
    this.dragOverTileId =
      Number(target.getAttribute('id').replace(/\D/g, '')) === 999
        ? null
        : Number(target.getAttribute('id').replace(/\D/g, ''));

    this.dragStartEvent.emit(this.dragOverTileId);
  };

  @HostListener('dragenter', ['$event'])
  dragEnterHandler = (ev: any) => {
    const { target } = ev;

    try {
      if (this.multiSelectionState === true) {
        const targetId = target.getAttribute('id').replace(/\D/g, '');
        const el = document.getElementById(targetId);
        if (el) {
          el.style.outline = 'dashed 0.2px';
          el.style.outlineWidth = '3px';

          if (Number(target.getAttribute('id').replace(/\D/g, '')) !== 999) {
            el.style.opacity = '0.5';
            this.dropPointLocation.hasLeft = null;
            this.dragEnterEvent.emit(this.dropPointLocation);
          }
        }
      } else {
        // TODO: move style into a class and add/remove the class
        target.style.outline = 'dashed 0.2px';
        target.style.outlineWidth = '3px';
        if (Number(target.getAttribute('id').replace(/\D/g, '')) !== 999) {
          target.style.opacity = '0.5';
          this.dropPointLocation.hasLeft = null;
          this.dragEnterEvent.emit(this.dropPointLocation);
        }
      }
    } catch (e) {
      // add neutral notification here
    }
  };

  @HostListener('dragleave', ['$event'])
  dragLeaveHandler = (ev: any) => {
    const { offsetX, offsetY, target } = ev;
    try {
      // TODO: move style into a class and add/remove the class
      if (this.multiSelectionState === true) {
        const targetId = target.getAttribute('id').replace(/\D/g, '');
        const el = document.getElementById(targetId);
        if (el) {
          el.style.outline = 'none';
          el.style.opacity = '1';
        }
      } else {
        ev.target.style.outline = 'none';
        target.style.opacity = '1';
        // TODO: logic to add an element that shows where the drop will be made, needs further refinment
        // if (res !== 999) {
        //   const el = document.getElementById('insertHere');
        //   const scene = document.getElementById('scene-999');
        //   if (el && scene) scene.removeChild(el);
        //   this.isFirstEnter = true;
        // }
      }
      const res = Number(target.getAttribute('id').replace(/\D/g, ''));
      this.dropPointLocation = this.setDropPointLocation({
        target: res,
        offsetX,
        offsetY,
      });
      this.dragLeaveEvent.emit(this.dropPointLocation);
    } catch (e) {
      // add neutral notification here
    }
  };

  @HostListener('drop', ['$event'])
  dropHandler = (ev: any) => {
    const { target } = ev;
    try {
      ev.preventDefault();
      if (this.multiSelectionState === true) {
        const targetId = target.getAttribute('id').replace(/\D/g, '');
        const el = document.getElementById(targetId);
        if (el) {
          el.style.outline = 'none';
          el.style.opacity = '1';
        }
      } else {
        // TODO: move style into a class and add/remove the class
        target.style.outline = 'none';
        target.style.opacity = '1';
      }
      const transferData = ev.dataTransfer.getData('Text');
      this.dropEvent.emit({ transferData });
      ev.stopPropagation();
    } catch (e) {
      // add neutral notification here
    }
  };

  private setDropPointLocation({ offsetX, offsetY, target }) {
    if (offsetY >= 240 || offsetY <= 0) {
      return {
        hasLeft: null,
        direction: DIRECTION.ABOVE_OR_BELLOW,
      };
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

      return {
        hasLeft: null,
      };
    }
  }
}
