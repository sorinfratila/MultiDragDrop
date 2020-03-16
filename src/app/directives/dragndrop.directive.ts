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
  @Input() selectedIds: string[];
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
    try {
      ev.preventDefault();
      this.dragOverTileId =
        Number(target.getAttribute('id').replace(/\D/g, '')) === 999
          ? null
          : Number(target.getAttribute('id').replace(/\D/g, ''));

      this.dragOverEvent.emit(this.dragOverTileId);
    } catch (e) {
      // add neutral notification here
    }
  };

  @HostListener('dragstart', ['$event'])
  dragStartHandler = (ev: any) => {
    const { target, dataTransfer } = ev;
    if (this.multiSelectionState === true) {
      if (this.selectedIds.length > 1) {
        const dragIcon = document.createElement('div');
        const textContent = document.createTextNode(`${this.selectedIds.length}`);
        dragIcon.setAttribute('id', 'dragIcon');
        // dragIcon.classList.add('multi__drag__icon');
        dragIcon.appendChild(textContent);

        dragIcon.style.position = 'absolute';
        dragIcon.style.display = 'flex';
        dragIcon.style.alignItems = 'center';
        dragIcon.style.fontFamily = 'arial, sennheiser-regular';
        dragIcon.style.justifyContent = 'center';
        dragIcon.style.fontSize = '3rem';
        dragIcon.style.color = '#080808';
        dragIcon.style.left = '-1000px';
        dragIcon.style.width = '50px';
        dragIcon.style.height = '50px';
        dragIcon.style.borderRadius = '25px';
        dragIcon.style.backgroundColor = '#0096d6';

        const el = document.getElementById('scene-wrapper');
        if (el) {
          el.appendChild(dragIcon);
          dataTransfer.setDragImage(dragIcon, -5, -5);
        }

        dataTransfer.setData('Text', this.selectedIds.toString());
      } else {
        dataTransfer.setDragImage(target, -5, -5); // setting the drag el relative to the cursor pointer at (-5, -5)
        dataTransfer.setData('Text', target.getAttribute('id'));
      }
      // adding the stringyfied array to dataTransfer to recover later and split()
    } else {
      dataTransfer.setDragImage(target, -5, -5); // setting the drag el relative to the cursor pointer at (-5, -5)
      dataTransfer.setData('Text', target.getAttribute('id'));
    }
    this.dragOverTileId =
      Number(target.getAttribute('id').replace(/\D/g, '')) === 999
        ? null
        : Number(target.getAttribute('id').replace(/\D/g, ''));
    this.dragStartEvent.emit(this.dragOverTileId);
  };

  @HostListener('dragenter', ['$event'])
  dragEnterHandler = (ev: any) => {
    const { target } = ev;
    // console.log('DRAG ENTER', target.getAttribute('id'));
    // console.log('DRAG ENTER', ev);

    // console.log(this.dropPointLocation);

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
    const { height, right, left, top } = ev.target.getBoundingClientRect();

    // removing the previously added hightlighting element when leaving the drop area
    const divToRemove = document.getElementById('insertHere-999');
    const elContainer = document.getElementById('scene-wrapper');
    if (elContainer && divToRemove) elContainer.removeChild(divToRemove);

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
      }
      const res = Number(target.getAttribute('id').replace(/\D/g, ''));
      this.dropPointLocation = this.setDropPointLocation({
        target: res,
        offsetX,
        offsetY,
      });
      this.dragLeaveEvent.emit(this.dropPointLocation);
      const { direction } = this.dropPointLocation;

      if (height === 240) {
        // creating a div to highlight the drop position when in between tiles
        const el = document.getElementById('scene-wrapper');
        const div = document.createElement('div');
        div.setAttribute('id', 'insertHere-999');
        div.style.width = '1.8rem';
        div.style.height = '24rem';
        div.style.position = 'absolute';
        div.style.zIndex = '-1';
        div.style.backgroundColor = 'transparent';
        div.style.outline = 'dashed';
        div.style.outlineWidth = '2px';
        div.style.top = `${top - 8}px`;
        if (direction === 'left') div.style.left = `${left - 27}px`;
        else if (direction === 'right') div.style.left = `${right - 7}px`;
        if (el) el.appendChild(div);
      }
    } catch (e) {
      // add neutral notification here
    }
  };

  @HostListener('drop', ['$event'])
  dropHandler = (ev: any) => {
    const { target, dataTransfer } = ev;
    try {
      ev.preventDefault();
      const divToCreate = document.getElementById('insertHere-999');
      const scene = document.getElementById('scene-wrapper');
      if (scene && divToCreate) scene.removeChild(divToCreate);

      if (this.multiSelectionState === true) {
        const dragIcon = document.getElementById('dragIcon');
        const elem = document.getElementById('scene-wrapper');
        if (dragIcon && elem) elem.removeChild(dragIcon);

        if (this.selectedIds.length === 1) {
          // in case of multiselection but still only one element is dragged
          const targetId = target.getAttribute('id').replace(/\D/g, '');
          const el = document.getElementById(targetId);
          if (el) {
            el.style.outline = 'none';
            el.style.opacity = '1';
          }
          const transferData = dataTransfer.getData('Text');
          this.dropEvent.emit({ transferData });
        } else {
          // in case of multiselection and multiple tiles dragged
          const arr = dataTransfer.getData('Text').split(',');
          this.dropEvent.emit({ transferData: arr });
        }
      } else {
        // TODO: move style into a class and add/remove the class
        target.style.outline = 'none';
        target.style.opacity = '1';
        const transferData = dataTransfer.getData('Text');
        this.dropEvent.emit({ transferData });
      }
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
