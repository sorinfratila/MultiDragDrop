import { Component, OnInit, Input, HostListener } from '@angular/core';
import { SimpleTile } from 'src/app/services/SimpleTile';

@Component({
  selector: 'app-tile',
  templateUrl: './tile.component.html',
  styleUrls: ['./tile.component.scss']
})
export class TileComponent implements OnInit {
  @Input() data: SimpleTile;
  constructor() { }

  ngOnInit() {
  }

  // @HostListener('dragover', ['$event'])
  // dragOverHandler = (ev: any) => {
  //   ev.preventDefault();
  //   console.log('drag over ---------', ev.path[2].id);
  // };

  @HostListener('dragend', ['$event'])
  dragEndHandler = (ev: any) => {
    const data = ev.dataTransfer.getData('Text');
    // ev.dataTransfer.setData('Text', ev.target.getAttribute('id'));
    console.log('END evennt <<<<<<=', data);
    ev.target.style.border = 'none';
  };

  toggleMenu(e: any) {
    e.stopPropagation();
  }
}
