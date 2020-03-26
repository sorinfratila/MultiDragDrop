import { Component, OnInit } from '@angular/core';
import { Scene } from 'src/app/services/Scene';
import { SimpleTile } from 'src/app/services/SimpleTile';
import { DIRECTION } from 'src/app/utility/contants';

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
    this.selectedScene = new Scene('Scene 1', true); // create new scene
    // generate as many as 250 usable tiles
    // these are the tiles that can be used to DragNDrop
    // the rest are gap tiles, just there to fill the gaps, swapping purposes
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
    try {
      if (typeof transferData !== 'string') {
        // logic for dropping multiple tiles
        // only insertingAtPosition possible in multi drag scenario

        const { hasLeft, direction } = this.dropPointLocation;

        if (this.dragOverTileId === null) {
          this.selectedScene.insertTilesAtPosition({
            startIndexToRemove: Number(transferData[0]),
            startIndexToInsert: direction === 'left' ? hasLeft : hasLeft + 1,
            tileIndexArr: transferData,
          });
          // }
        }
      } else {
        // logic for dealing with single tile swap
        // and single tile insertAtPosition

        if (transferData && typeof this.dragOverTileId === 'number') {
          this.selectedScene.swapSingleTiles({ fromIndex: Number(transferData), toIndex: this.dragOverTileId });
        } else {
          if (this.dropPointLocation.hasLeft !== null) {
            // logic for dealing with single tile dropping at position between other tiles
            const { hasLeft, direction } = this.dropPointLocation;
            this.selectedScene.insertTileAtPosition({
              indexToRemoveAt: Number(transferData),
              newIndexOnScene: direction === 'left' ? hasLeft : hasLeft + 1,
            });
          }
        }
      }

      this.deviceList = this.selectedScene.simpleTileList;
    } catch (e) {
      console.log(e);
    }
  }

  public generateNonGapTiles(num: number) {
    const tiles = [];
    if (num < 250) {
      for (let i = 0; i < num; i++) {
        tiles.push(
          new SimpleTile({
            isGapTile: false,
            id: i,
            hasBeenTouched: true,
            draggable: false,
          }),
        );
      }
      return tiles;
    }

    return [];
  }

  public addTilesToScene(tiles: SimpleTile[]) {
    tiles.forEach((t, i) => {
      this.selectedScene.simpleTileList.splice(i, 1, t);
    });
  }

  public toggle(clickedTile: SimpleTile, e: any, index: number) {
    e.preventDefault();
    if (e.shiftKey) return;
    if (e.metaKey) this.onCtrlClick(e, clickedTile, index);
    else {
      this.checkInitialTileStatus(clickedTile, index);
      clickedTile.toggle();
      setTimeout(() => {
        this.selectedIds = this.getAllDraggable();
      }, 50);

      if (!this.selectedScene.getMultiSelectionState()) {
        console.log(clickedTile.toggled);
        if (clickedTile.toggled === true) {
          // toggling the last tile toggled, becasue there
          // can be only one tile toggled at a time
          // if multiselectionState is false
          this.selectedScene.setInitShiftClickTile({ id: clickedTile.id, indexOnScene: index });
          this.selectedScene.setLastShiftClickTile({ id: clickedTile.id, indexOnScene: index });
          const lastId = this.selectedScene.getLastToggledTileId();
          if (lastId !== null) this.selectedScene.toggleTileById(lastId);
          this.selectedScene.setLastToggledTileId(clickedTile.id);
        } else {
          this.selectedScene.setLastToggledTileId(null);
          this.selectedScene.setInitShiftClickTile(null);
          this.selectedScene.setLastShiftClickTile(null);
        }
      }

      this.selectedScene.setInitShiftClickTile({ id: clickedTile.id, indexOnScene: index });
      this.selectedScene.setLastShiftClickTile({ id: clickedTile.id, indexOnScene: index });
    }
  }

  private checkInitialTileStatus(clickedTile: SimpleTile, index: number) {
    let answer = false;
    if (this.selectedScene.getInitShiftClickTile()) {
      if (clickedTile.id === this.selectedScene.getInitShiftClickTile().id) {
        answer = true;
        const tileList = this.selectedScene.getAllTiles();
        if (this.selectedScene.getToggledTiles().length > 1) {
          // when toggling the InitShiftClickTile and there are multiple tiles toggled
          // resetting the initial point of referrence

          if (tileList[index - 1] && tileList[index - 1].toggled === true) {
            this.selectedScene.setInitShiftClickTile({
              id: tileList[index - 1].id,
              indexOnScene: index - 1,
            });
          } else {
            this.selectedScene.setInitShiftClickTile({
              id: tileList[index + 1].id,
              indexOnScene: index + 1,
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

  onShiftClick(event: MouseEvent, clickedTile: SimpleTile, index: number) {
    event.preventDefault();
    if (event.shiftKey) {
      if (!this.selectedScene.isAnyTileToggled()) {
        // clicking the initial tile with SHIFT pressed
        clickedTile.toggle();
        this.selectedScene.setLastToggledTileId(clickedTile.id);
        this.selectedScene.setInitShiftClickTile({ id: clickedTile.id, indexOnScene: index });
        this.selectedScene.setLastShiftClickTile({ id: clickedTile.id, indexOnScene: index });
        setTimeout(() => {
          this.selectedIds = this.getAllDraggable();
        }, 50);
      } else {
        // if there is at least 1 tile toggled already besides the clicked one
        if (this.checkInitialTileStatus(clickedTile, index)) {
          clickedTile.toggle();
          // this.deviceList = this.selectedScene.simpleTileList;
          setTimeout(() => {
            this.selectedIds = this.getAllDraggable();
          }, 50);
          return;
        }

        if (this.selectedScene.getToggledTiles().length > 0) {
          // there are already some toggled tiles

          const { indexOnScene: initIndex } = this.selectedScene.getInitShiftClickTile();
          const { indexOnScene: lastIndex } = this.selectedScene.getLastShiftClickTile();
          if (initIndex < index) {
            // changed direction right of initialIndex
            this.selectedScene.simpleTileList
              // untoggling toggled tiles right of the initialIndex that should not be toggled anymore
              .filter((t, ind) => !t.isGapTile && ind <= initIndex && ind >= lastIndex)
              .forEach(j => {
                this.selectedScene.toggleTileById(j.id, false);
              });

            this.selectedScene.simpleTileList
              .filter((til, ind) => !til.isGapTile && ind >= initIndex && ind <= lastIndex)
              .forEach(j => {
                this.selectedScene.toggleTileById(j.id, false);
              });

            // ids holds the array of ids that should be toggled with this action
            const tiles = this.selectedScene.simpleTileList
              .map((ti: SimpleTile, ind) => {
                if (!ti.isGapTile) {
                  ti.indexOnSc = ind;
                  return ti;
                }
              })
              .filter(x => x)
              .reduce((acc: Array<SimpleTile>, tileToToggle: SimpleTile) => {
                if (tileToToggle.indexOnSc >= initIndex && tileToToggle.indexOnSc <= index) {
                  acc.push(tileToToggle);
                }
                return acc;
              }, []);

            tiles.forEach(i => {
              this.selectedScene.toggleTileById(i.id, true);
            });

            this.selectedScene.setLastShiftClickTile({ id: clickedTile.id, indexOnScene: index });
          } else {
            // changed direction left of initialIndex
            this.selectedScene.simpleTileList
              // untoggling toggled tiles left of the initialIndex that should not be toggled anymore
              .filter((t, ind) => !t.isGapTile && ind >= initIndex && ind <= lastIndex)
              .forEach(j => {
                this.selectedScene.toggleTileById(j.id, false);
              });

            this.selectedScene.simpleTileList
              .filter((til, ind) => !til.isGapTile && ind >= lastIndex && ind <= initIndex)
              .forEach(j => {
                this.selectedScene.toggleTileById(j.id, false);
              });

            // ids holds the array of ids that should be toggled with this action
            const tiles = this.selectedScene.simpleTileList
              .map((ti: SimpleTile, ind) => {
                if (!ti.isGapTile) {
                  ti.indexOnSc = ind;
                  return ti;
                }
              })
              .filter(x => x)
              .reduce((acc: Array<SimpleTile>, tileToToggle: SimpleTile) => {
                if (tileToToggle.indexOnSc <= initIndex && tileToToggle.indexOnSc >= index) {
                  acc.push(tileToToggle);
                }
                return acc;
              }, []);

            tiles.forEach(i => {
              this.selectedScene.toggleTileById(i.id, true);
            });

            this.selectedScene.setLastShiftClickTile({ id: clickedTile.id, indexOnScene: index });
          }

          if (!this.selectedScene.getMultiSelectionState()) {
            this.selectedScene.toggleMultiSelection(true);
          }
        }
      }
    }
  }

  // method used for ctrl+clicking a tile
  onCtrlClick = (ev: any, clickedTile: SimpleTile, index: number) => {
    const { buttons } = ev;
    ev.preventDefault();

    if (buttons === 2) return; // it means it was initiated with a right click
    this.checkInitialTileStatus(clickedTile, index);

    if (clickedTile.toggled === true) {
      // when the clicked tile is the only one toggled so far
      // => there are no other tiles toggled
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
          this.multiSelectionState = true;
        }
        this.selectedScene.setLastToggledTileId(null);
      }
      clickedTile.toggle();
      setTimeout(() => {
        this.selectedIds = this.getAllDraggable();
      }, 50);
      this.selectedScene.setLastToggledTileId(clickedTile.id);
      this.selectedScene.setInitShiftClickTile({ id: clickedTile.id, indexOnScene: index });
      this.selectedScene.setLastShiftClickTile({ id: clickedTile.id, indexOnScene: index });
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
      this.selectedScene.setInitShiftClickTile(null);
      this.selectedScene.setLastShiftClickTile(null);
    }
  };
}
