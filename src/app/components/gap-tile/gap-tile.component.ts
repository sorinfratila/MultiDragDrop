import { Component, OnInit, Input } from '@angular/core';
import { SimpleTile } from 'src/app/services/SimpleTile';

@Component({
  selector: 'app-gap-tile',
  templateUrl: './gap-tile.component.html',
  styleUrls: ['./gap-tile.component.scss']
})
export class GapTileComponent implements OnInit {
  @Input() data: SimpleTile;

  constructor() { }

  ngOnInit() {
  }

}
