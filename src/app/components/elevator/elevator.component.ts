import { Component } from '@angular/core';
import { ElevatorService } from 'src/app/services/elevator/elevator.service';

@Component({
  selector: 'app-elevator',
  templateUrl: './elevator.component.html',
  styleUrls: ['./elevator.component.scss']
})
export class ElevatorComponent {

  constructor(
      public elevatorService: ElevatorService
  ) { }

}
