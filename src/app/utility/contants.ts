import { SimpleTile } from '../services/SimpleTile';

export const DEFAULT_TILE = {
  color: 'GREY',
  size: 'standard',
  model: 'gap-element',
  list() {
    const newTileList = [];
    for (let i = 0; i < 250; i++) {
      const tile = new SimpleTile({
        id: i,
        // indexOnScene: i,
        size: DEFAULT_TILE.size,
        color: DEFAULT_TILE.color,
        model: 'gap-element',
        hasBeenTouched: false,
      });

      newTileList.push(tile);
    }

    return newTileList;
  },
};
