import { SimpleTile } from './SimpleTile';
import { DEFAULT_TILE } from 'src/app/utility/contants';

export class Scene {
  name: string;
  simpleTileList: SimpleTile[];
  selected: boolean;
  multiSelectionState: boolean;
  lastToggledTileId: any;

  constructor(name: string, selected: boolean, simpleTileList?: SimpleTile[]) {
    this.name = name;
    if (simpleTileList) this.simpleTileList = this.instantiateTiles(simpleTileList);
    else this.simpleTileList = this.instantiateTiles();
    this.selected = selected;
    this.multiSelectionState = false;
    this.lastToggledTileId = null;
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
      const removedGapTileArr = stlCopy.splice(gapTileIndex, 1); // remove the gapTile from the list
      stlCopy.splice(indexToRemoveAt, 1, removedGapTileArr[0]); // replace indexToRemoveAt position with the gap tile
      stlCopy.splice(newIndexOnScene, 0, tile); // insert the dragged tile at newIndexOnScene position
    }

    for (let i = 0; i < stlCopy.length; i++) {
      if (i < newIndexOnScene) {
        if (!stlCopy[i].hasBeenTouched) stlCopy[i].setTouched(true);
      } else break;
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
        console.log('gapTile', res[0]);
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
          stlCopy.splice(startIndexToInsert, 0, res[0]); //
        });
      }

      if (startIndexToRemove > startIndexToInsert) {
        // if dragging tiles before the initial position

        console.log('startIndexToInsert', startIndexToInsert);
        console.log('tileIndexArr', tileIndexArr);

        tileIndexArr.forEach((index: string, j: number) => {
          // for each index, replace the the tile with the gapTiles
          // and then insert the tiles at the new positions
          // const res = stlCopy.splice(Number(index), 1, gapTileArr.shift());
          // stlCopy.splice(startIndexToInsert, 0, res[0]);
          const res = stlCopy.splice(Number(index) + j, 1, gapTileArr.shift());
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

  doSomething(stlCopy, index: number, gapTileArr, startIndexToInsert) {}

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

      stlCopy[fromIndex].setTouched(true);

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

  public async checkTiles(tiles: SimpleTile[]) {
    tiles.forEach((tile: SimpleTile) => {
      tile.check(false);
      if (tile.id === this.getLastToggledTileId()) {
        this.setLastToggledTileId(null);
      }
    });

    return this.reArrange(tiles);
  }

  public async checkAllTiles(newValue: boolean, monitoringTiles: SimpleTile[]): Promise<SimpleTile[]> {
    const stlc = [...this.simpleTileList];
    const stlcr = [...this.simpleTileList].reverse();
    const tMap = new Map();

    if (newValue) {
      // when CHECKING all tiles => newValue === true
      const lastIndexOf = stlcr.findIndex(t => !t.isGapTile);

      if (lastIndexOf === -1) {
        // no real tiles exist on the monitoring Scene
        return this.simpleTileList.map((tile: SimpleTile, j) => {
          if (monitoringTiles[j]) {
            // const { indexOnScene } = tile;

            monitoringTiles[j].check(newValue);
            // monitoringTiles[j].setIndexOnScene(indexOnScene);
            monitoringTiles[j].setTouched(true);
            monitoringTiles[j].toggle(false);
            monitoringTiles[j].preToggle(false);

            return monitoringTiles[j];
          }

          return tile;
        });
      } else {
        // some tiles have already been checked and can be seen on the monitoring Scene

        const index = this.simpleTileList.length - lastIndexOf;
        stlc.filter(t => !t.isGapTile).forEach(t => tMap.set(t.id, t));
        const newMonitoringTile = monitoringTiles.filter(t => !tMap.has(t.id));

        newMonitoringTile.forEach((tile, i) => {
          tile.check(newValue);
          // tile.setIndexOnScene(index + i);
          tile.setTouched(true);
          tile.toggle(false);
          tile.preToggle(false);

          stlc.splice(index + i, 1, tile);
        });

        return stlc;
      }
    } else {
      // when UNCHECKING all tiles => newValue === false
      this.setLastToggledTileId(null);
      return this.instantiateTiles();
    }
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

  public async reArrange(tiles: SimpleTile[]): Promise<any> {
    // re-arrange algorithm when CHECKING or UNCHECKING a tile
    // a gap tile is placed in the position of the unchecked tile on every uncheck
    const stlc = [...this.simpleTileList];
    const stlcr = [...this.simpleTileList].reverse();

    tiles.forEach((tile, j) => {
      if (!tile.checked) {
        // when tile has been UNCHECKED
        const newTile = new SimpleTile({
          id: j,
          // indexOnScene: tile.indexOnScene,
          size: DEFAULT_TILE.size,
          color: DEFAULT_TILE.color,
          model: DEFAULT_TILE.model,
          hasBeenTouched: true,
        });

        const index = stlc.findIndex(t => t.id === tile.id);

        stlc.splice(index, 1, newTile);
      } else {
        // when tile has been CHECKED
        const lastIndexOf = stlcr.findIndex(t => t.hasBeenTouched);
        if (this.multiSelectionState) tile.preToggle(true);

        if (lastIndexOf === -1) {
          const removedGapTile = stlc.shift();
          // tile.setIndexOnScene(removedGapTile.indexOnScene);
          tile.setTouched(true);

          stlc.unshift(tile);
        } else {
          const index = this.simpleTileList.length - lastIndexOf + j;
          // tile.setIndexOnScene(stlc[index].indexOnScene);
          tile.setTouched(true);

          stlc.splice(index, 1, tile);
        }
      }
    });

    return stlc;
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
      // there will always be 250 Tiles in every Scene, most of them probably gap Tiles
      for (let i = 0; i < 250; i++) {
        const tile = new SimpleTile({
          id: i,
          // indexOnScene: i,
          size: DEFAULT_TILE.size,
          color: DEFAULT_TILE.color,
          model: DEFAULT_TILE.model,
          hasBeenTouched: false,
        });
        tileArray.push(tile);
      }

      return tileArray;
    }
  }
}
