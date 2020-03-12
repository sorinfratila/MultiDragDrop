import { Component, OnInit, HostListener } from '@angular/core';
import { Scene } from 'src/app/services/Scene';
import { SimpleTile } from 'src/app/services/SimpleTile';

const DIRECTION = {
  LEFT: 'left',
  RIGHT: 'right',
}

@Component({
  selector: 'app-monitoring',
  templateUrl: './monitoring.component.html',
  styleUrls: ['./monitoring.component.scss']
})
export class MonitoringComponent implements OnInit {
  deviceList: any[];
  selectedScene: Scene;

  dropPointLocation: any = Object.create(null);
  dragOverTileId: number;
  constructor() {
    this.deviceList = [];
    this.dropPointLocation = {
      hasLeft: '',
      direction: DIRECTION.RIGHT,
    };
    this.dragOverTileId = 0;
  }

  ngOnInit() {
    this.selectedScene = new Scene('Scene 1', true);
    const tiles = this.generateNonGapTiles(15);
    this.addTilesToScene(tiles);

    this.deviceList = this.selectedScene.simpleTileList;
    console.log(this.selectedScene);
  }

  @HostListener('dragover', ['$event'])
  dragOverHandler = (ev: any) => {
    const { target } = ev;
    ev.preventDefault();
    this.dragOverTileId = Number(target.getAttribute('id').replace(/\D/g, '')) === 999
      ? null
      : Number(target.getAttribute('id').replace(/\D/g, ''));
  };

  @HostListener('dragstart', ['$event'])
  dragStartHandler = (ev: any) => {
    const { target, dataTransfer } = ev;
    target.style.border = 'dashed 0.2px';
    dataTransfer.setData('Text', ev.target.getAttribute('id'));
    this.dragOverTileId = Number(target.getAttribute('id').replace(/\D/g, '')) === 999
      ? null
      : Number(target.getAttribute('id').replace(/\D/g, ''));
  };

  @HostListener('dragenter', ['$event'])
  dragEnterHandler = (ev: any) => {
    const { target } = ev;
    target.style.border = 'dashed 0.2px';
    if (Number(target.getAttribute('id').replace(/\D/g, '')) !== 999) {
      this.dropPointLocation = null;
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
  };

  @HostListener('drop', ['$event'])
  dropHandler = (ev: any) => {
    ev.preventDefault();
    const data = ev.dataTransfer.getData('Text');
    ev.target.style.border = 'none';

    try {
      if (data && this.dragOverTileId) {
        this.selectedScene.swapSingleTiles({ fromIndex: Number(data), toIndex: this.dragOverTileId });
        this.deviceList = this.selectedScene.simpleTileList;
        // this.sceneService.updateScene(this.selectedScene);
      } else {
        if (this.dropPointLocation) {
          const { hasLeft, direction } = this.dropPointLocation;
          this.selectedScene.insertTileAtPosition({
            indexToRemoveAt: Number(data),
            newIndexOnScene: direction === 'left' ? hasLeft : hasLeft + 1
          });

          this.deviceList = this.selectedScene.simpleTileList;
        }
      }
    } catch (e) {
      console.log(e);
    }
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

  public generateNonGapTiles(num: number) {
    const tiles = [];
    for (let i = 0; i < num; i++) {
      tiles.push(new SimpleTile({
        isGapTile: false,
        id: i,
        color: 'GREY',
        size: 'standard',
        hasBeenTouched: false,
        draggable: false,
      }));
    }

    return tiles;
  }

  public addTilesToScene(tiles: SimpleTile[]) {
    tiles.forEach((t, i) => {
      this.selectedScene.simpleTileList.splice(i, 1, t);
    });
  }

  public toggle(clickedTile: SimpleTile, e: any) {
    e.preventDefault();
    if (e.metaKey) this.onCtrlClick(e, clickedTile);
    else {
      clickedTile.toggle();

      if (!this.selectedScene.getMultiSelectionState()) {
        if (clickedTile.toggled === true) {
          // toggling the last tile toggled, becasue there
          // can be only one tile toggled at a time
          // if multiselectionState is false
          const lastId = this.selectedScene.getLastToggledTileId();
          if (lastId) this.selectedScene.toggleTileById(lastId);

          this.selectedScene.setLastToggledTileId(clickedTile.id);
        } else {
          this.selectedScene.setLastToggledTileId(null);
        }
      }
    }

    console.log('clickedTile', clickedTile)
  }

  onCtrlClick = (ev: any, clickedTile: SimpleTile) => {
    const { buttons } = ev;
    ev.preventDefault();

    if (buttons === 2) return; // it means it was initiated with a right click

    // method used for ctrl+clicking a tile
    if (clickedTile.toggled === true) {
      clickedTile.toggle();
      if (!this.selectedScene.isAnyTileToggled()) {
        this.selectedScene.setLastToggledTileId(null);
      }
    } else {
      if (this.selectedScene.isAnyTileToggled()) {
        if (!this.selectedScene.getMultiSelectionState()) {
          this.selectedScene.toggleMultiSelection(true);
        }
        this.selectedScene.setLastToggledTileId(null);
      }
      clickedTile.toggle();
      this.selectedScene.setLastToggledTileId(clickedTile.id);
    }
  }

  onMetaKeyAPressed = (ev: any) => {
    // const { platform } = window.navigator;
    const { ctrlKey, metaKey } = ev;
    // if (platform === 'MacIntel') {
    if (metaKey || ctrlKey) {
      this.selectedScene.toggleMultiSelection(true);
      this.selectedScene.toggleAllTiles(true);
    }
    // } else {
    //   if (ctrlKey) {
    //     this.selectedScene.toggleMultiSelection(true);
    //     this.selectedScene.toggleAllTiles(true);
    //     this.sceneService.updateScene(this.selectedScene);
    //   }
    // }
  };

  onEscapePressed = (ev: KeyboardEvent) => {
    if (ev) {
      this.selectedScene.toggleMultiSelection(false);
      this.selectedScene.toggleAllTiles(false);
      this.selectedScene.setLastToggledTileId(null);
    }
  };
}
