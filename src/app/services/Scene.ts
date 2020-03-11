import { SimpleTile } from './SimpleTile';
import { DEFAULT_TILE } from 'src/app/utility/contants';

export class Scene {
  name: string;
  simpleTileList: SimpleTile[];
  selected: boolean;
  multiSelectionState: boolean;
  lastToggledTileId: any;

  constructor(
    name: string,
    selected: boolean,
    simpleTileList?: SimpleTile[]
  ) {
    this.name = name;
    if (simpleTileList) this.simpleTileList = this.instantiateTiles(simpleTileList);
    else this.simpleTileList = this.instantiateTiles();
    this.selected = selected;
    this.multiSelectionState = false;
    this.lastToggledTileId = null;
  }

  public getByIndexOnScene(index: number) {
    return this.simpleTileList.find(t => t.indexOnScene === index);
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

  public swapSingleTiles({ fromIndex, toIndex }) {
    const stlCopy = [...this.simpleTileList];
    // new Scene method
    if (typeof fromIndex === 'number' && typeof toIndex === 'number') {
      const tempTile = stlCopy[fromIndex];
      stlCopy[fromIndex] = stlCopy[toIndex];
      stlCopy[fromIndex].setIndexOnScene(fromIndex);
      stlCopy[toIndex] = tempTile;
      stlCopy[toIndex].setIndexOnScene(toIndex);

      this.setTileList(stlCopy);

    } else throw new Error('fromIndex or toIndex is not a number');
  }

  public getCheckedTilesLength() {
    return this.simpleTileList.filter((t: SimpleTile) => t.checked).length;
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
    const monMap = new Map();
    const tMap = new Map();

    monitoringTiles.forEach(tile => monMap.set(tile.id, tile));

    if (newValue) {
      // when CHECKING all tiles => newValue === true
      const lastIndexOf = stlcr.findIndex(t => !t.isGapTile);

      if (lastIndexOf === -1) {
        // no real tiles exist on the monitoring Scene
        return this.simpleTileList.map((tile: SimpleTile, j) => {
          if (monitoringTiles[j]) {
            const { indexOnScene } = tile;

            monitoringTiles[j].check(newValue);
            monitoringTiles[j].setIndexOnScene(indexOnScene);
            monitoringTiles[j].setTouched(true);
            monitoringTiles[j].toggle(false);
            monitoringTiles[j].preToggle(false);

            return monitoringTiles[j];
          } else return tile;
        });
      } else {
        // some tiles have already been checked and can be seen on the monitoring Scene

        const index = this.simpleTileList.length - lastIndexOf;
        stlc.filter(t => !t.isGapTile).forEach(t => tMap.set(t.id, t));
        const newMonitoringTile = monitoringTiles.filter(t => !tMap.has(t.id));

        newMonitoringTile.forEach((tile, i) => {
          tile.check(newValue);
          tile.setIndexOnScene(index + i);
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
    const stlc = [...this.simpleTileList];
    const stlcr = [...this.simpleTileList].reverse();

    tiles.forEach((tile, j) => {
      if (!tile.checked) {
        // when tile has been UNCHECKED
        const newTile = new SimpleTile({
          id: tile.indexOnScene,
          indexOnScene: tile.indexOnScene,
          size: DEFAULT_TILE.size,
          color: DEFAULT_TILE.color,
          model: DEFAULT_TILE.model,
          hasBeenTouched: true,
        });

        stlc.splice(tile.indexOnScene, 1, newTile);
      } else {
        // when tile has been CHECKED
        const lastIndexOf = stlcr.findIndex(t => t.hasBeenTouched);
        if (this.multiSelectionState) tile.preToggle(true);

        if (lastIndexOf === -1) {
          const removedGapTile = stlc.shift();
          tile.setIndexOnScene(removedGapTile.indexOnScene);
          tile.setTouched(true);

          stlc.unshift(tile);
        } else {
          const index = this.simpleTileList.length - lastIndexOf + j;
          tile.setIndexOnScene(stlc[index].indexOnScene);
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
      // 200 is the maximum number of TILES that can be in each SCENE
      // there will always be 200 Tiles in every Scene, most of them probably gap Tiles
      for (let i = 0; i < 200; i++) {
        const tile = new SimpleTile({
          id: i,
          indexOnScene: i,
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
