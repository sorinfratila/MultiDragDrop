import { Device, modelEnum, matchingEnum, sizeEnum } from './Device';
import { colorEnum } from './Channel';
import { Battery } from './Battery';

export class Charger extends Device {
  id?: any;
  checked?: boolean;
  device?: string;
  name?: string;
  model?: modelEnum;
  tags?: any[];
  batteries?: Battery[];
  ip?: string;
  mac?: string;
  matchingStatus?: matchingEnum;
  isHighlighted?: boolean;
  matchedWith?: string;
  toggled?: boolean;
  preToggled?: boolean;
  size?: sizeEnum;
  draggable?: boolean;
  color?: colorEnum;
  protocol?: string;
}
