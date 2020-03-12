import { Component, Input } from '@angular/core';
import { SimpleTile } from 'src/app/services/SimpleTile';

@Component({
  selector: 'app-tile',
  templateUrl: './tile.component.html',
  styleUrls: ['./tile.component.scss']
})
export class TileComponent {
  @Input() data: SimpleTile;
  @Input() index: number;

  constructor() { }

  toggleMenu(e: any) {
    e.stopPropagation();
  }
}
