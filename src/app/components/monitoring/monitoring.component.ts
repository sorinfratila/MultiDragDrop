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

  isBetween: string[];
  constructor() {
    this.deviceList = [];
    this.isBetween = [];
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
    // console.log(`drag over ${ev.path[2].id ? ev.path[2].id : 'scene'}`);
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
    // console.log('DRAG ENTER =>>>>>', ev.target.getAttribute('id'));
    this.setIsBetweenRight(ev.target.getAttribute('id'));
    console.log('isBetween', this.isBetween);
  };

  @HostListener('dragleave', ['$event'])
  dragLeaveHandler = (ev: any) => {
    ev.target.style.border = 'none';
    // console.log('DRAG LEAVE =>>>>>', ev.target.getAttribute('id'));
    this.setIsBetweenLeft(ev.target.getAttribute('id'));
    console.log('isBetween', this.isBetween);
  };

  @HostListener('drop', ['$event'])
  dropHandler = (ev: any) => {
    ev.preventDefault();
    const data = ev.dataTransfer.getData('Text');
    // console.log('drop Event ========', data);
    // console.log('drop Event ========', ev.path[2].id);
    ev.target.style.border = 'none';
    const res = ev.path[2].id.replace(/\D/g, '');

    try {
      if (data && res) {
        this.selectedScene.swapSingleTiles({ fromIndex: Number(data), toIndex: Number(res) });
        this.deviceList = this.selectedScene.simpleTileList;
        // this.sceneService.updateScene(this.selectedScene);
      } else {
        const left = Number(this.isBetween[0].replace(/\D/g, ''));
        const right = Number(this.isBetween[1].replace(/\D/g, ''));

        if (left === 999) {
          // do nothing
        } else {
          if (right === 999) {
            this.selectedScene.swapSingleTiles({ fromIndex: Number(data), toIndex: left });
            // TODO: something is off here, please fix
            this.deviceList = this.selectedScene.simpleTileList;
          }
        }
      }
    } catch (e) {
      console.log(e);
    }

    // console.log('isBetween', this.isBetween);
  };

  private setIsBetweenLeft(leftString: string) {
    this.isBetween[0] = leftString;
  }

  private setIsBetweenRight(rightString: string) {
    this.isBetween[1] = rightString;
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
      clickedTile.toggle();

      if (!this.selectedScene.getMultiSelectionState()) {
        if (clickedTile.toggled === true) {
          // toggling the last tile toggled, becasue there
          // can be only one tile toggled at a time
          // if multiselectionState is false
          const lastId = this.selectedScene.getLastToggledTileId();
          if (lastId) {
            this.selectedScene.toggleTileById(lastId);
          }

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
