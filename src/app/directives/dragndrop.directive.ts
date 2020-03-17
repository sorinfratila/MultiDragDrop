import { Directive, Output, EventEmitter, HostListener, Input } from '@angular/core';

const DIRECTION = {
  LEFT: 'left',
  RIGHT: 'right',
  ABOVE_OR_BELLOW: 'aboveOrBellow',
};

const DRAG_OVER_POSITION = {
  LEFT_SIDE: 'left',
  RIGHT_SIDE: 'right',
  OUTSIDE: 'outside',
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

  // keeps track of direction from which the drag was over tile and which id was left
  dropPointLocation: any = Object.create(null);

  // keeps track of  the #id the drag is currently over
  dragOverTileId: number;

  // keeps track if drag is over left of tile or right of tile
  dragOverPosition: string;

  constructor() {
    this.dropPointLocation = {
      hasLeft: '',
      direction: DIRECTION.RIGHT,
    };
    this.dragOverTileId = 0;
    this.dragOverPosition = DRAG_OVER_POSITION.OUTSIDE;
  }

  @HostListener('dragover', ['$event'])
  dragOverHandler = (ev: any) => {
    try {
      const { target, offsetX } = ev;
      const id = target.getAttribute('id').replace(/\D/g, '');
      ev.preventDefault();
      if (offsetX >= -0 && offsetX <= 70) {
        // positioned leftside of the tile
        const pos = DRAG_OVER_POSITION.LEFT_SIDE;
        if (pos !== this.dragOverPosition) {
          this.removeElementById({ idToRemove: 'insertHere-999', idToRemoveFrom: 'scene-wrapper' });
          this.dragOverPosition = DRAG_OVER_POSITION.LEFT_SIDE;

          // setting up new drop location in special case of multi drag because
          // rules are a bit different = refer to description for more details
          this.dropPointLocation = {
            hasLeft: Number(id),
            direction: this.dragOverPosition,
          };

          // same reason as the if statement bellow
          this.dragEnterEvent.emit(this.dropPointLocation);

          const { height, right, left, top } = target.getBoundingClientRect();
          if (this.multiSelectionState && this.selectedIds.length > 1) {
            // only create the highlight when multi drag and drop
            if (height === 240) {
              this.createDropHighlight({ top, left, right, direction: this.dragOverPosition });
            }
          }
        }
      }

      if (offsetX > 70 && offsetX <= 140) {
        // positioned rightside of the tile
        const pos = DRAG_OVER_POSITION.RIGHT_SIDE;
        if (pos !== this.dragOverPosition) {
          this.removeElementById({ idToRemove: 'insertHere-999', idToRemoveFrom: 'scene-wrapper' });
          this.dragOverPosition = DRAG_OVER_POSITION.RIGHT_SIDE;

          // setting up new drop location in special case of multi drag because
          // rules are a bit different = refer to description for more details
          this.dropPointLocation = {
            hasLeft: Number(id),
            direction: this.dragOverPosition,
          };
          // emitting here the new dropLocation in case of multi drag
          // because there are special rules when multidragging
          // fx: an the dragged elements cannot be swapped, but drop point
          // can also be a tile, although the actual drop will be before or after the tile
          // depending on which side we are pointing with the mouse
          this.dragEnterEvent.emit(this.dropPointLocation);
          const { height, right, left, top } = target.getBoundingClientRect();

          if (this.multiSelectionState && this.selectedIds.length > 1) {
            // only create the highlight when multi drag and drop
            if (height === 240) {
              this.createDropHighlight({ top, left, right, direction: this.dragOverPosition });
            }
          }
        }
      }
      this.dragOverTileId =
        Number(target.getAttribute('id').replace(/\D/g, '')) === 999
          ? null
          : //  because of special rules of multi dragging
          this.multiSelectionState && this.selectedIds.length > 1
          ? null
          : Number(target.getAttribute('id').replace(/\D/g, ''));

      this.dragOverEvent.emit(this.dragOverTileId);
    } catch (e) {
      // TODO: add neutral notification here
    }
  };

  @HostListener('dragstart', ['$event'])
  dragStartHandler = (ev: any) => {
    try {
      const { target, dataTransfer } = ev;
      if (this.multiSelectionState === true) {
        if (this.selectedIds.length > 1) {
          const dragIcon = document.createElement('div');
          const textContent = document.createTextNode(`${this.selectedIds.length}`);
          dragIcon.setAttribute('id', 'dragIcon');
          dragIcon.appendChild(textContent);
          dragIcon.style.position = 'absolute';
          dragIcon.style.display = 'flex';
          dragIcon.style.alignItems = 'center';
          dragIcon.style.fontFamily = 'sennheiser-regular, sans-serif';
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
    } catch (e) {
      // TODO: add neutral notification
    }
  };

  @HostListener('dragenter', ['$event'])
  dragEnterHandler = (ev: any) => {
    try {
      const { target } = ev;
      const targetId = target.getAttribute('id').replace(/\D/g, '');
      const el = document.getElementById(targetId);
      if (this.multiSelectionState === true && targetId !== '999') {
        if (this.selectedIds.length === 1) {
          el.style.outline = 'dashed';
          el.style.outlineWidth = '3px';
          el.style.opacity = '0.5';
        }
        // this.dropPointLocation.hasLeft = null;
        this.dragEnterEvent.emit(this.dropPointLocation);
      } else {
        if (targetId !== '999') {
          target.style.outline = 'dashed';
          target.style.outlineWidth = '3px';
          target.style.opacity = '0.5';
          // this.dropPointLocation.hasLeft = null;
          this.dragEnterEvent.emit(this.dropPointLocation);
        }
      }
    } catch (e) {
      // TODO: add neutral notification here
    }
  };

  @HostListener('dragleave', ['$event'])
  dragLeaveHandler = (ev: any) => {
    try {
      const { offsetX, offsetY, target } = ev;
      const { height, right, left, top } = ev.target.getBoundingClientRect();

      const res = Number(target.getAttribute('id').replace(/\D/g, ''));
      this.dropPointLocation = this.setDropPointLocation({
        target: res,
        offsetX,
        offsetY,
      });

      this.dragLeaveEvent.emit(this.dropPointLocation);

      if (this.multiSelectionState === true && this.selectedIds.length === 1) {
        if (this.selectedIds.length === 1) {
          const targetId = target.getAttribute('id').replace(/\D/g, '');
          const el = document.getElementById(targetId);
          if (el) {
            // removing highlight
            el.style.outline = 'none';
            el.style.opacity = '1';
          }
        }
        this.removeElementById({ idToRemove: 'insertHere-999', idToRemoveFrom: 'scene-wrapper' });
      } else {
        this.removeElementById({ idToRemove: 'insertHere-999', idToRemoveFrom: 'scene-wrapper' });
        ev.target.style.outline = 'none';
        target.style.opacity = '1';
      }

      const { direction } = this.dropPointLocation;

      if (height === 240) {
        this.createDropHighlight({ top, left, right, direction });
      }
    } catch (e) {
      // TODO: add neutral notification here
    }
  };

  @HostListener('drop', ['$event'])
  dropHandler = (ev: any) => {
    try {
      const { target, dataTransfer } = ev;

      ev.preventDefault();
      this.removeElementById({ idToRemove: 'insertHere-999', idToRemoveFrom: 'scene-wrapper' });

      if (this.multiSelectionState === true) {
        // remove the dragIcon with number of dragged tiles after drop
        this.removeElementById({ idToRemove: 'dragIcon', idToRemoveFrom: 'scene-wrapper' });

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

  private removeElementById({ idToRemove, idToRemoveFrom }) {
    // removing the previously added hightlighting element when leaving the drop area
    const divToRemove = document.getElementById(idToRemove);
    const container = document.getElementById(idToRemoveFrom);
    if (container && divToRemove) container.removeChild(divToRemove);
  }

  private createDropHighlight({ top, left, right, direction }) {
    // creating a div to highlight the drop position when in between tiles
    const el = document.getElementById('scene-wrapper');
    const div = document.createElement('div');
    div.setAttribute('id', 'insertHere-999');
    div.style.width = '1.6rem';
    div.style.height = '24rem';
    div.style.position = 'absolute';
    div.style.zIndex = '-1';
    div.style.backgroundColor = 'transparent';
    div.style.border = 'dashed';
    div.style.borderWidth = '2px';
    div.style.top = `${top - 10}px`;
    if (direction === 'left') div.style.left = `${left - 28}px`;
    else if (direction === 'right') div.style.left = `${right - 8}px`;
    if (el && direction !== DIRECTION.ABOVE_OR_BELLOW) el.appendChild(div);
  }
}
