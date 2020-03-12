import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MonitoringComponent } from './components/monitoring/monitoring.component';
import { TileComponent } from './components/tile/tile.component';
import { KeyPressEventsDirective } from './directives/key-press-events.directive';
import { DraggableDirective } from './directives/draggable.directive';
import { GapTileComponent } from './components/gap-tile/gap-tile.component';
import { DragndropDirective } from './directives/dragndrop.directive';


@NgModule({
  declarations: [
    AppComponent,
    MonitoringComponent,
    TileComponent,
    KeyPressEventsDirective,
    DraggableDirective,
    GapTileComponent,
    DragndropDirective
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
