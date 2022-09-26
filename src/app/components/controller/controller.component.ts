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

  addFloorToQueue(floor: number): void {
		if (
			this.elevatorService.currentFloor$.value !== floor
			|| this.elevatorService.doorStatus$.value === ElevatorDoor.CLOSED
		) {
			this.elevatorService.elevatorControllerCall$.next(floor);
		}
	}

  openDoors() {
    if(this.elevatorService.elevatorStatus$.value === ElevatorState.STOPPED) {
      this.elevatorService.doorStatus$.next(ElevatorDoor.OPENED);
      this.elevatorService.speed$.next(ElevatorSpeed.SLOWDOWN);
    }
  }

  closeDoors() {
    if(this.elevatorService.elevatorStatus$.value === ElevatorState.STOPPED) {
      this.elevatorService.doorStatus$.next(ElevatorDoor.CLOSED);
      this.elevatorService.speed$.next(ElevatorSpeed.SPEEDUP);
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
