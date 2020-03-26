import { SimpleTile } from './SimpleTile';

export class Scene {
  name: string;
  simpleTileList: SimpleTile[];
  selected: boolean;
  multiSelectionState: boolean; // there can be single or multiselection state
  lastToggledTileId: any; // always know which one was the last tile toggled
  initShiftClickTile: any; // sets the reference point when initiating shiftClick
  lastShiftClickTile: any; // always sets to the last tile clicked for shift-select functionality

  constructor(name: string, selected: boolean, simpleTileList?: SimpleTile[]) {
    this.name = name;
    if (simpleTileList) this.simpleTileList = this.instantiateTiles(simpleTileList);
    else this.simpleTileList = this.instantiateTiles();
    this.selected = selected;
    this.multiSelectionState = false;
    this.lastToggledTileId = null;
    this.initShiftClickTile = null;
    this.lastShiftClickTile = null;
  }

  public setName(newName: string) {
    this.name = newName;
  }

  public setLastToggledTileId(id: any) {
    this.lastToggledTileId = id;
  }

  public getTileById(id: string) {
    return this.simpleTileList.find(tile => tile.id === id);
  }

  public getLastToggledTileId() {
    return this.lastToggledTileId;
  }

  public setInitShiftClickTile(obj: any) {
    if (obj) {
      const { id, indexOnScene } = obj;
      this.initShiftClickTile = {
        ...this.initShiftClickTile,
        id,
        indexOnScene,
      };
    } else this.initShiftClickTile = null;
  }

  public getInitShiftClickTile() {
    return this.initShiftClickTile;
  }

  public setLastShiftClickTile(obj: any) {
    if (obj) {
      const { id, indexOnScene } = obj;
      this.lastShiftClickTile = {
        ...this.lastShiftClickTile,
        id,
        indexOnScene,
      };
    } else this.lastShiftClickTile = null;
  }

  public getLastShiftClickTile() {
    return this.lastShiftClickTile;
  }

  public getCheckedTilesLength() {
    return this.simpleTileList.filter((t: SimpleTile) => t.checked).length;
  }

  /**
   * FOR SINGLE TILE DRAG
   * @param indexToRemoveAt - where to remove the dragged tile from
   * @param newIndexOnScene - where to insert the dropped tile
   */
  public insertTileAtPosition({ indexToRemoveAt, newIndexOnScene }) {
    const stlCopy = [...this.simpleTileList];
    const tile = stlCopy[indexToRemoveAt];
    const gapTileIndex = this.getGapTileAfterIndex({ indexToStartAt: newIndexOnScene });

    if (gapTileIndex) {
      tile.toggle(false);
      this.setLastToggledTileId(null);
      const removedGapTileArr = stlCopy.splice(gapTileIndex, 1); // remove the gapTile from the list
      stlCopy.splice(indexToRemoveAt, 1, removedGapTileArr[0]); // replace indexToRemoveAt position with the gap tile
      stlCopy.splice(newIndexOnScene, 0, tile); // insert the dragged tile at newIndexOnScene position

      for (let i = 0; i < stlCopy.length; i++) {
        if (i < newIndexOnScene) {
          if (!stlCopy[i].hasBeenTouched) stlCopy[i].setTouched(true);
        } else break;
      }
    }

    this.setTileList(stlCopy);
  }

  /**
   * FOR MULTI TILE DRAG
   * function used to replace the dragged tiles with gap tiles upon
   * droppping to the new positions - also moves the selected tiles to the new positions @startIndexToInsert
   * @param startIndexToRemove - the first selected tile index
   * @param startIndexToInsert - the index to start inserting the dragging selected tiles
   * @param tileIndexArr - the array of indexes of the
   */
  public insertTilesAtPosition({ startIndexToRemove, startIndexToInsert, tileIndexArr }) {
    const stlCopy = [...this.simpleTileList];
    tileIndexArr.reverse();
    const length = tileIndexArr.length;

    // holds the gapTiles extracted from the simpleTileList to be placed
    // at the current positions of the selected tiles to be dragged
    const gapTileArr = [];

    for (let i = 0; i < length; i++) {
      // going through the simpleTileList to get the same amount of gapTiles
      // as selectedTiles to be used as replacement on the grid;
      const index = stlCopy.findIndex((t, j) => t.isGapTile && j >= startIndexToInsert && !t.hasBeenTouched);
      // TODO: needs fixing - update all touchedTiles so that we pick up first gapTile that was not touched
      if (index !== -1) {
        const res = stlCopy.splice(index, 1);
        res[0].setTouched(true);
        gapTileArr.push(res[0]);
      }
    }

    gapTileArr.reverse();

    if (gapTileArr && gapTileArr.length === tileIndexArr.length) {
      if (startIndexToRemove < startIndexToInsert) {
        // if dragging tiles after the initial position

        tileIndexArr.forEach((index: string, j: number) => {
          // for each index, replace the the tile with the gapTiles
          // and then insert the tiles at the new positions

          const res = stlCopy.splice(Number(index), 1, gapTileArr.shift());
          res[0].toggle(false);
          stlCopy.splice(startIndexToInsert, 0, res[0]);
        });
      }

      if (startIndexToRemove > startIndexToInsert) {
        // if dragging tiles before the initial position

        tileIndexArr.forEach((index: string, j: number) => {
          // for each index, replace the the tile with the gapTiles
          // and then insert the tiles at the new positions
          const res = stlCopy.splice(Number(index) + j, 1, gapTileArr.shift());
          res[0].toggle(false);
          stlCopy.splice(startIndexToInsert, 0, res[0]);
        });
      }

      for (let i = 0; i < stlCopy.length; i++) {
        if (i < startIndexToInsert) {
          if (!stlCopy[i].hasBeenTouched) stlCopy[i].setTouched(true);
        } else break;
      }

      this.setTileList(stlCopy);
    } else {
      throw new Error('There are no more gap tiles to be used');
    }
  }

  /**
   * FOR SINGLE TILE DRAG
   * used to get a gap tile as replacement for a dragged and dropped selected tile
   * @param indexToStartAt - start looking from this index
   */
  private getGapTileAfterIndex({ indexToStartAt }) {
    const stlCopy = [...this.simpleTileList];
    let index = -1;
    const tile = stlCopy.find((t: SimpleTile, i) => {
      if (t.isGapTile && i >= indexToStartAt && !t.hasBeenTouched) {
        index = i;
        return true;
      }
    });
    // TODO: needs fixing - update all touchedTiles so that we pick up first gapTile that was not touched
    if (tile !== undefined && index !== -1) {
      return index;
    }
    return null;
  }

  /**
   * FOR SINGLE TILE DRAG
   * swap tiles
   * @param fromIndex - index to remove the tile from
   * @param toIndex - index to insert the tile to
   */
  public swapSingleTiles({ fromIndex, toIndex }) {
    const stlCopy = [...this.simpleTileList];
    if (typeof fromIndex === 'number' && typeof toIndex === 'number') {
      const tempTile = stlCopy[fromIndex];
      stlCopy[fromIndex] = stlCopy[toIndex];
      stlCopy[toIndex] = tempTile;

      stlCopy[toIndex].toggle(false);
      this.setLastToggledTileId(null);

      for (let i = 0; i < stlCopy.length; i++) {
        if (i < fromIndex) {
          if (!stlCopy[i].hasBeenTouched) stlCopy[i].setTouched(true);
        } else break;
      }

      this.setTileList(stlCopy);
    } else throw new Error('fromIndex or toIndex is not a number');
  }

  public toggleTileById(id: any, newValue?: boolean) {
    const tile = this.getTileById(id);
    if (newValue !== undefined && tile) tile.toggle(newValue);
    else if (tile) tile.toggle();
  }

  public setSelected(newSelectedValue: boolean) {
    this.selected = newSelectedValue;
  }

  public getMultiSelectionState() {
    return this.multiSelectionState;
  }

  public toggleMultiSelection(newValue?: boolean) {
    if (newValue !== undefined) this.multiSelectionState = newValue;
    else this.multiSelectionState = !this.multiSelectionState;

    this.preToggleAllTiles(newValue);
  }

  public toggleAllTiles(newValue: boolean) {
    this.simpleTileList
      .filter(t => !t.isGapTile)
      .forEach(tile => {
        tile.toggle(newValue);
      });
    this.setLastToggledTileId(null);
  }

  public preToggleAllTiles(newValue?: boolean) {
    this.simpleTileList
      .filter(t => !t.isGapTile)
      .forEach(tile => {
        newValue !== undefined ? tile.preToggle(newValue) : tile.preToggle();
      });
  }

  public isAnyTileChecked() {
    return !!this.simpleTileList.find(tile => tile.checked);
  }

  public isAnyTileToggled() {
    return !!this.simpleTileList.find(tile => tile.toggled);
  }

  public getToggledTiles() {
    return this.simpleTileList.filter(t => t.toggled);
  }

  public getAllTiles() {
    return this.simpleTileList;
  }

  public setTileList(newTileList: SimpleTile[]) {
    this.simpleTileList = newTileList;
  }

  private instantiateTiles(simpleTileList?: SimpleTile[]) {
    if (simpleTileList !== undefined) {
      return simpleTileList.reduce((newArray: SimpleTile[], tile) => {
        newArray.push(new SimpleTile(tile));
        return newArray;
      }, []);
    } else {
      const tileArray = [];
      // 250 is the maximum number of TILES that can be in each SCENE
      // 10 x 25
      // there will always be 250 Tiles in every Scene, most of them probably gap Tiles
      for (let i = 0; i < 250; i++) {
        const tile = new SimpleTile({
          id: i,
          hasBeenTouched: false,
        });
        tileArray.push(tile);
      }

      return tileArray;
    }
  }
}
