import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { ControllerComponent } from './components/controller/controller.component';
import { ElevatorComponent } from './components/elevator/elevator.component';
import { BuildingComponent } from './components/building/building.component';
import { FloorComponent } from './components/floor/floor.component';

@NgModule({
  declarations: [
    AppComponent,
    ControllerComponent,
    ElevatorComponent,
    BuildingComponent,
    FloorComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
