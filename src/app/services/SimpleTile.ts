export class SimpleTile {
  id: any;
  hasBeenTouched: boolean;
  indexOnSc?: number;
  toggled?: boolean;
  preToggled?: boolean;
  checked?: boolean;
  isGapTile?: boolean;
  draggable?: boolean;

  constructor({
    id,
    hasBeenTouched,
    toggled = false,
    preToggled = false,
    checked = false,
    isGapTile = true,
    draggable = false,
  }) {
    this.id = id;
    this.hasBeenTouched = hasBeenTouched;
    (this.draggable = draggable), (this.toggled = toggled);
    this.preToggled = preToggled;
    this.checked = checked;
    this.isGapTile = isGapTile;
  }

  public setIsGapTile(newValue: boolean) {
    this.isGapTile = newValue;
  }

  public setTouched(newValue: boolean) {
    this.hasBeenTouched = newValue;
  }

  public setDraggable(newValue: boolean) {
    this.draggable = newValue;
  }

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
