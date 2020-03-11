import { Component, OnInit, HostListener } from '@angular/core';
import { Scene } from 'src/app/services/Scene';
import { SimpleTile } from 'src/app/services/SimpleTile';

@Component({
  selector: 'app-monitoring',
  templateUrl: './monitoring.component.html',
  styleUrls: ['./monitoring.component.scss']
})
export class MonitoringComponent implements OnInit {
  deviceList: any[];
  selectedScene: Scene;
  constructor() {
    this.deviceList = [];
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
    ev.preventDefault();
    // ev.target.style.border = 'dashed';
    // ev.target.style.borderWidth = '0.5px';
    // ev.dataTransfer.setData('Text', ev.path[2].id);
    console.log(`drag over ${ev.path[2].id ? ev.path[2].id : 'scene'}`);
  };

  @HostListener('dragstart', ['$event'])
  dragStartHandler = (ev: any) => {
    ev.target.style.border = 'dashed';
    ev.target.style.borderWidth = '0.5px';
    ev.dataTransfer.setData('Text', ev.target.getAttribute('id'));
    console.log('START Event =>>>>>', ev);
  };

  @HostListener('dragenter', ['$event'])
  dragEnterHandler = (ev: any) => {
    ev.target.style.border = 'dashed';
    ev.target.style.borderWidth = '0.5px';
    console.log('DRAG ENTER =>>>>>', ev.target.getAttribute('id'));
  };

  @HostListener('dragleave', ['$event'])
  dragLeaveHandler = (ev: any) => {
    ev.target.style.border = 'none';
    console.log('DRAG LEAVE =>>>>>', ev.target.getAttribute('id'));
  };

  @HostListener('drop', ['$event'])
  dropHandler = (ev: any) => {
    ev.preventDefault();
    const data = ev.dataTransfer.getData('Text');
    console.log('drop Event ========', data);
    console.log('drop Event ========', ev.path[2].id);
    ev.target.style.border = 'none';
  };

  public swap(arr: SimpleTile[], { fromIndex, toIndex }) {
    const arrCopy = [...arr];
    // const { indexOnScene: fromIndex } = fromEl;
    // const { indexOnScene: toIndex } = toEl;
    const tile = this.selectedScene.getByIndexOnScene()

  }


  public generateNonGapTiles(num: number) {
    const tiles = [];
    for (let i = 0; i < num; i++) {
      tiles.push(new SimpleTile({
        isGapTile: false,
        id: i,
        indexOnScene: i,
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
      this.checkInitialTileStatus(clickedTile);
      clickedTile.toggle();

      if (!this.selectedScene.getMultiSelectionState()) {
        if (clickedTile.toggled === true) {
          // toggling the last tile toggled, becasue there
          // can be only one tile toggled at a time
          // if multiselectionState is false
          this.selectedScene.setInitShiftClickTile({ id: clickedTile.id, indexOnScene: clickedTile.indexOnScene });
          this.selectedScene.setLastShiftClickTile({ id: clickedTile.id, indexOnScene: clickedTile.indexOnScene});
          const lastId = this.selectedScene.getLastToggledTileId();
          if (lastId) {
            this.selectedScene.toggleTileById(lastId);
          }

          this.selectedScene.setLastToggledTileId(clickedTile.id);
        } else {
          this.selectedScene.setLastToggledTileId(null);
          this.selectedScene.setInitShiftClickTile(null);
          this.selectedScene.setLastShiftClickTile(null);
        }
      }
    }

    console.log('clickedTile', clickedTile)
  }

  private checkInitialTileStatus(clickedTile: SimpleTile) {
    let answer = false;
    if (this.selectedScene.getInitShiftClickTile()) {
      if (clickedTile.id === this.selectedScene.getInitShiftClickTile().id) {
        answer = true;
        const tileList = this.selectedScene.getAllTiles();
        if (this.selectedScene.getToggledTiles().length > 1) {

          // when toggling the InitShiftClickTile and there are multiple tiles toggled
          // resetting the initial point of referrence

          if (
            tileList[clickedTile.indexOnScene - 1]
            && tileList[clickedTile.indexOnScene - 1].toggled === true
          ) {
            this.selectedScene.setInitShiftClickTile({
              id: tileList[clickedTile.indexOnScene - 1].id,
              indexOnScene: tileList[clickedTile.indexOnScene - 1].indexOnScene
            });
          } else {
            this.selectedScene.setInitShiftClickTile({
              id: tileList[clickedTile.indexOnScene + 1].id,
              indexOnScene: tileList[clickedTile.indexOnScene + 1].indexOnScene
            });
          }
        } else {
          // clicking on the same tile with SHIFT pressed
          // when clickedTile is the only one toggled so far
          // resetting the toggling settings, updating and returning
          this.selectedScene.setLastToggledTileId(null);
          this.selectedScene.setInitShiftClickTile(null);
          this.selectedScene.setLastShiftClickTile(null);
        }
      }
    }

    return answer;
  }

  onCtrlClick = (ev: any, clickedTile: SimpleTile) => {
    const { buttons } = ev;
    ev.preventDefault();

    if (buttons === 2) return; // it means it was initiated with a right click

    this.checkInitialTileStatus(clickedTile);

    // method used for ctrl+clicking a tile
    if (clickedTile.toggled === true) {
      clickedTile.toggle();
      if (!this.selectedScene.isAnyTileToggled()) {
        this.selectedScene.setLastToggledTileId(null);
        this.selectedScene.setInitShiftClickTile(null);
        this.selectedScene.setLastShiftClickTile(null);
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
      this.selectedScene.setInitShiftClickTile({ id: clickedTile.id, indexOnScene: clickedTile.indexOnScene});
      this.selectedScene.setLastShiftClickTile({ id: clickedTile.id, indexOnScene: clickedTile.indexOnScene});
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
      this.selectedScene.setInitShiftClickTile(null);
      this.selectedScene.setLastShiftClickTile(null);
    }
  };
}
