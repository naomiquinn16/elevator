import { Component, Input } from '@angular/core';
import { ElevatorState } from 'src/app/enums/elevator.enum';
import { ElevatorService } from 'src/app/services/elevator/elevator.service';

@Component({
  selector: 'app-floor',
  templateUrl: './floor.component.html',
  styleUrls: ['./floor.component.scss']
})
export class FloorComponent {
  @Input() public floorNumber: number = 1;
	@Input() public firstFloor: boolean = true;
	@Input() public lastFloor: boolean = false;
  isUpActive = false;
  isDownActive = false;
	constructor(public elevatorService: ElevatorService) { }

  public callElevatorDown(e: any): void {
    this.isDownActive = true
		this.elevatorService.individualFloorCall$.next(this.floorNumber);
    this.elevatorService.elevatorStatus$.subscribe(state => {
      if(state === 0 && !this.elevatorService.pendingRequests.some(el => el.floor === this.floorNumber)) {
        this.isDownActive = false;
      }
    }) 
	}

  public callElevatorUp(e: any): void {
    this.isUpActive = true
		this.elevatorService.individualFloorCall$.next(this.floorNumber);
    this.elevatorService.elevatorStatus$.subscribe(state => {
      if(state === 0 && !this.elevatorService.pendingRequests.some(el => el.floor === this.floorNumber)) {
        this.isUpActive = false;
      }
    }) 
	}
}
