export type colorsEnum = 'GREY' | 'ROSE' | 'YELLOW' | 'BLUE';

export class SimpleTile {
  id: any;
  deviceId?: string;
  indexOnScene?: number;
  size: string;
  color: colorsEnum;
  hasBeenTouched: boolean;
  // model?: modelEnum;
  ip?: string;
  toggled?: boolean;
  preToggled?: boolean;
  frequency?: number;
  // matchingStatus?: matchingEnum;
  name?: string;
  orderNumber?: number | string;
  checked?: boolean;
  isGapTile?: boolean;
  isOffline?: boolean;
  isVirtual?: boolean;
  rx?: number;
  draggable?: boolean;

  constructor({
    id,
    // indexOnScene,
    size,
    color,
    hasBeenTouched,
    deviceId = null,
    model = null,
    ip = null,
    toggled = false,
    preToggled = false,
    frequency = null,
    matchingStatus = null,
    name = null,
    orderNumber = null,
    checked = false,
    isOffline = false,
    isVirtual = true,
    isGapTile = true,
    rx = null,
    draggable = false,
  }) {
    this.id = id;
    this.deviceId = deviceId;
    // this.indexOnScene = indexOnScene;
    this.hasBeenTouched = hasBeenTouched;
    this.color = color;
    (this.draggable = draggable), (this.ip = ip);
    this.toggled = toggled;
    this.preToggled = preToggled;
    this.frequency = frequency;
    this.name = name;
    this.orderNumber = orderNumber;
    this.checked = checked;
    this.isGapTile = isGapTile;
    this.isVirtual = isVirtual;
    this.isOffline = isOffline;
    this.rx = rx;
  }

  public setColor(newColor: colorsEnum) {
    this.color = newColor;
  }

  public setIsGapTile(newValue: boolean) {
    this.isGapTile = newValue;
  }

  public setTouched(newValue: boolean) {
    this.hasBeenTouched = newValue;
  }

  // public setSize(newSize: sizeEnum) {
  //   this.size = newSize;
  // }

  // public getSize() {
  //   return this.size;
  // }

  public getColor() {
    return this.color;
  }

  public setDraggable(newValue: boolean) {
    this.draggable = newValue;
  }

  // public setIndexOnScene(newIndex: number) {
  //   this.indexOnScene = newIndex;
  // }

  public toggle(newValue?: boolean) {
    if (!this.isGapTile) {
      if (newValue !== undefined) this.toggled = newValue;
      else this.toggled = !this.toggled;

      this.setDraggable(this.toggled);
    }
  }

  public preToggle(newValue?: boolean) {
    if (newValue !== undefined) this.preToggled = newValue;
    else this.preToggled = !this.preToggled;
  }

  public check(newValue?: boolean) {
    if (this.checked === true) {
      if (this.toggled === true) this.toggle();
      if (this.preToggled === true) this.preToggle();
    }

    if (!this.isGapTile) {
      if (newValue !== undefined) this.checked = newValue;
      else this.checked = !this.checked;
    }
    return;
  }
}
