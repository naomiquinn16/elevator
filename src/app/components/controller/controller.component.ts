import { Component } from '@angular/core';
import { ElevatorDirection, ElevatorDoor, ElevatorState } from 'src/app/enums/elevator.enum';
import { ElevatorService } from 'src/app/services/elevator/elevator.service';
import { MusicService } from 'src/app/services/music/music.service';

@Component({
  selector: 'app-controller',
  templateUrl: './controller.component.html',
  styleUrls: ['./controller.component.scss']
})
export class ControllerComponent {
  
  constructor(
    public musicService: MusicService,
    public elevatorService: ElevatorService
  ) { }

  addFloorToQueue(floor: number): void {
		if (
			this.elevatorService.currentFloor$.value !== floor
			|| this.elevatorService.doorStatus$.value === ElevatorDoor.CLOSED
		) {
			this.elevatorService.elevatorControllerCall$.next(floor);
		}
	}

  stallElevator() {
    if(this.elevatorService.elevatorStatus$.value === ElevatorState.STOPPED) {
      console.log('hi')
      //abort the original goTo, reopen doors, close them, validate req with the remaining pending reqs\
      setTimeout(() => {
        this.elevatorService.doorStatus$.next(ElevatorDoor.OPENED);
        this.elevatorService.doorStatus$.next(ElevatorDoor.CLOSED);
        this.elevatorService.validateRequests();
      }, 5000);
    }
  }

  toggleAlarm(): void {
    if(!this.elevatorService.isElevatorPaused()) {
      this.musicService.playError();
      this.elevatorService.elevatorStatus$.next(ElevatorState.PAUSED);
      alert('Elevator cannot move, ring the bell again to resume movement!')
    } else {
      this.elevatorService.elevatorStatus$.next(ElevatorState.STOPPED);
      this.elevatorService.validateRequests()
    }
	}

  getActiveClass(i: number): string {
    return this.elevatorService.pendingRequests.some(call => call.floor === i) ? 'button active' : 'button';
  }
}
