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
        hasBeenTouched: false,
      });

      newTileList.push(tile);
    }

    return newTileList;
  },
};

export const DRAG_OVER_POSITION = {
  LEFT_SIDE: 'left',
  RIGHT_SIDE: 'right',
  OUTSIDE: 'outside',
};

export const DIRECTION = {
  LEFT: 'left',
  RIGHT: 'right',
  ABOVE_OR_BELLOW: 'aboveOrBellow',
};
