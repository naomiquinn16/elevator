import { Component } from '@angular/core';
import { ElevatorDirection, ElevatorDoor, ElevatorSpeed, ElevatorState } from 'src/app/enums/elevator.enum';
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

  // Can add floor request to queue so long as user is not on the floor already or if they are, they door is closed
  addFloorToQueue(floor: number): void {
		if (
			this.elevatorService.currentFloor$.value !== floor
			|| this.elevatorService.doorStatus$.value === ElevatorDoor.CLOSED
		) {
			this.elevatorService.elevatorControllerCall$.next(floor);
		}
	}

  // Open door button only works if state is stopped
  openDoors() {
    if(this.elevatorService.elevatorStatus$.value === ElevatorState.STOPPED) {
      this.elevatorService.doorStatus$.next(ElevatorDoor.OPENED);
      this.elevatorService.speed$.next(ElevatorSpeed.SLOWDOWN);
    }
  }

  // Close door button only works if state is stopped
  closeDoors() {
    if(this.elevatorService.elevatorStatus$.value === ElevatorState.STOPPED) {
      this.elevatorService.doorStatus$.next(ElevatorDoor.CLOSED);
      this.elevatorService.speed$.next(ElevatorSpeed.SPEEDUP);
    }
  }

  // If elevator is not paused, ring error alarm, pause it, show alert
  // If elevator is paused, change state to stopped, create a new instance of the abort controller, check the next call
  toggleAlarm(): void {
    if(!this.elevatorService.isElevatorPaused()) {
      this.musicService.playError();
      this.elevatorService.elevatorStatus$.next(ElevatorState.PAUSED);
      alert('Elevator cannot move, ring the bell again to resume movement!')
    } else {
      this.elevatorService.elevatorStatus$.next(ElevatorState.STOPPED);
      this.elevatorService.controller = new AbortController();
      this.elevatorService.checkNextCall()
    }
	}

  // Add/remove active class if the floor number exists/doesnt exist in the queue
  getActiveClass(i: number): string {
    return this.elevatorService.pendingRequests.some(call => call.floor === i) ? 'button active' : 'button';
  }
}
