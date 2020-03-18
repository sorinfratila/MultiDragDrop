import { Component, OnInit } from '@angular/core';
import { Scene } from 'src/app/services/Scene';
import { SimpleTile } from 'src/app/services/SimpleTile';

const DIRECTION = {
  LEFT: 'left',
  RIGHT: 'right',
  ABOVE_OR_BELLOW: 'aboveOrBellow',
};

@Component({
  selector: 'app-monitoring',
  templateUrl: './monitoring.component.html',
  styleUrls: ['./monitoring.component.scss'],
})
export class MonitoringComponent implements OnInit {
  deviceList: any[];
  selectedScene: Scene;
  multiSelectionState: boolean;
  selectedIds: string[];

  dropPointLocation: any = Object.create(null);
  dragOverTileId: number;
  constructor() {
    this.selectedIds = [];
    this.deviceList = [];
    this.multiSelectionState = false;
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
  }

  public onDragStart(ev: any) {
    this.dragOverTileId = ev;
  }

  public onDragOver(ev: any) {
    this.dragOverTileId = ev;
  }

  public onDragEnter(ev: any) {
    this.dropPointLocation = ev;
  }

  public onDragLeave(ev: any) {
    this.dropPointLocation = ev;
  }

  public onDrop(ev: any) {
    const { transferData } = ev;
    this.selectedScene.toggleAllTiles(false);

    try {
      if (typeof transferData !== 'string') {
        // logic for dropping multiple tiles

        const { hasLeft, direction } = this.dropPointLocation;

        if (this.dragOverTileId === null) {
          // only do some actions if dropping in between tiles

          console.log(Number(transferData[0]), hasLeft, Number(transferData[transferData.length - 1]));

          if (Number(transferData[0]) < hasLeft && hasLeft < Number(transferData[transferData.length - 1])) {
            // there'a a known issue when trying to drag tiles from BEFORE and AFTER a drop
            // location; it will not behave as expected;
            throw new Error('Droppping tiles from before and after the drop point is not recommended.');
          } else {
            this.selectedScene.insertTilesAtPosition({
              startIndexToRemove: Number(transferData[0]),
              startIndexToInsert: direction === 'left' ? hasLeft : hasLeft + 1,
              tileIndexArr: transferData,
            });

            this.deviceList = this.selectedScene.simpleTileList;
          }
        }
      } else {
        // logic for dealing with single tile swap

        if (transferData && typeof this.dragOverTileId === 'number') {
          this.selectedScene.swapSingleTiles({ fromIndex: Number(transferData), toIndex: this.dragOverTileId });
          this.deviceList = this.selectedScene.simpleTileList;
          // this.sceneService.updateScene(this.selectedScene);
        } else {
          if (this.dropPointLocation.hasLeft !== null) {
            // logic for dealing with single tile dropping at position between other tiles
            const { hasLeft, direction } = this.dropPointLocation;
            this.selectedScene.insertTileAtPosition({
              indexToRemoveAt: Number(transferData),
              newIndexOnScene: direction === 'left' ? hasLeft : hasLeft + 1,
            });

            this.deviceList = this.selectedScene.simpleTileList;
          }
        }
      }
    } catch (e) {
      console.log(e);
      // TODO: add notification here
    }
  }

  public generateNonGapTiles(num: number) {
    const tiles = [];
    for (let i = 0; i < num; i++) {
      tiles.push(
        new SimpleTile({
          isGapTile: false,
          id: i,
          color: 'GREY',
          size: 'standard',
          hasBeenTouched: true,
          draggable: false,
        }),
      );
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
      setTimeout(() => {
        this.selectedIds = this.getAllDraggable();
      }, 100);

      if (!this.selectedScene.getMultiSelectionState()) {
        console.log(clickedTile.toggled);
        if (clickedTile.toggled === true) {
          // toggling the last tile toggled, becasue there
          // can be only one tile toggled at a time
          // if multiselectionState is false
          const lastId = this.selectedScene.getLastToggledTileId();
          if (lastId !== null) this.selectedScene.toggleTileById(lastId);
          this.selectedScene.setLastToggledTileId(clickedTile.id);
        } else {
          this.selectedScene.setLastToggledTileId(null);
        }
      }
    }
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
          this.multiSelectionState = true;
        }
        this.selectedScene.setLastToggledTileId(null);
      }
      clickedTile.toggle();
      setTimeout(() => {
        this.selectedIds = this.getAllDraggable();
      }, 100);
      this.selectedScene.setLastToggledTileId(clickedTile.id);
    }
  };

  private getAllDraggable = () => {
    const array = [];
    document.querySelectorAll('.monitoringtile[draggable="true"]').forEach(el => {
      array.push(el.getAttribute('id'));
    });

    array.sort((a, b) => {
      const numA = Number(a);
      const numB = Number(b);

      return numA < numB ? -1 : numA > numB ? 1 : 0;
    });
    console.log(array);
    return array;
  };

  onMetaKeyAPressed = (ev: any) => {
    // const { platform } = window.navigator;
    const { ctrlKey, metaKey } = ev;
    // if (platform === 'MacIntel') {
    if (metaKey || ctrlKey) {
      this.selectedScene.toggleMultiSelection(true);
      this.multiSelectionState = true;
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
      this.multiSelectionState = false;
      this.selectedScene.toggleAllTiles(false);
      this.selectedScene.setLastToggledTileId(null);
    }
  };
}
