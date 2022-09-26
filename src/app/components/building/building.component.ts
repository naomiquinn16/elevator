import { Component } from '@angular/core';
import { ElevatorService } from 'src/app/services/elevator/elevator.service';

@Component({
  selector: 'app-building',
  templateUrl: './building.component.html',
  styleUrls: ['./building.component.scss']
})
export class BuildingComponent {

  constructor(public elevatorService: ElevatorService) { }

}
