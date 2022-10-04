import { Injectable } from '@angular/core';

import { BehaviorSubject, Subject } from 'rxjs';

import {
  ElevatorCallOrigin,
  ElevatorDirection,
  ElevatorDoor,
  ElevatorSpeed,
  ElevatorState,
} from '../../enums/elevator.enum';
import { IElevatorCall } from '../../interfaces/elevator.interface';
import { MusicService } from '../music/music.service';

@Injectable({
  providedIn: 'root',
})
export class ElevatorService {
  public maxRequests: Number = 10;
  public pendingRequests: Array<IElevatorCall> = [];
  public floors = [
    { name: 'First Floor', value: 1 },
    { name: 'Second Floor', value: 2 },
    { name: 'Third Floor', value: 3 },
    { name: 'Fourth Floor', value: 4 },
  ];
  public elevatorControllerCall$: Subject<number> = new Subject<number>();
  public individualFloorCall$: Subject<number> = new Subject<number>();
  public arrived$: Subject<number> = new Subject<number>();
  public speed$: BehaviorSubject<ElevatorSpeed> =
    new BehaviorSubject<ElevatorSpeed>(0);
  public doorStatus$: BehaviorSubject<ElevatorDoor> =
    new BehaviorSubject<ElevatorDoor>(ElevatorDoor.CLOSED);
  public elevatorStatus$: BehaviorSubject<ElevatorState> =
    new BehaviorSubject<ElevatorState>(ElevatorState.STOPPED);
  public movementDirection$: BehaviorSubject<ElevatorDirection> =
    new BehaviorSubject<ElevatorDirection>(ElevatorDirection.UP);
  public currentFloor$: BehaviorSubject<number> = new BehaviorSubject<number>(
    1
  );
  public controller = new AbortController();

  constructor(public musicService: MusicService) {
    this.handleCalls();
  }

  // Subscribe to the floor caller, controller caller and the elevator state
  public handleCalls(): void {
    this.individualFloorCall$.subscribe((floor: number) =>
      this.call({
        callOrigin: ElevatorCallOrigin.FLOOR,
        floor,
      })
    );

    this.elevatorControllerCall$.subscribe((floor: number) =>
      this.call({
        callOrigin: ElevatorCallOrigin.CONTROLLER,
        floor,
      })
    );

    this.elevatorStatus$.subscribe((state: ElevatorState) => {
      if (state === ElevatorState.PAUSED) {
        this.controller.abort();
        console.log('Abort controller called');
      }
    });
  }

  // call method checks if the call can be queued, if not play warning sound
  public call(call: IElevatorCall): void {
    if (!this.canAddNewCall()) {
      this.musicService.playError();
      return;
    }

    // If the new call queued does not yet exist in the queue, add it to the pending requests queue & check the next call in the queue
    if (
      this.pendingRequests.filter((el) => el.floor === call.floor).length === 0
    ) {
      this.pendingRequests.push(call);
      this.checkNextCall();
    }
  }

  public canAddNewCall(): boolean {
    return (
      this.pendingRequests.length < this.maxRequests && !this.isElevatorPaused()
    );
  }

  public isElevatorPaused(): boolean {
    return this.elevatorStatus$.value === ElevatorState.PAUSED;
  }

  public checkNextCall(): void {
    if (!this.elevatorCanMove()) {
      return;
    }

    if (this.pendingRequests.length && !this.isElevatorPaused()) {
      this.goToFloor(this.pendingRequests[0].floor, this.controller.signal);
    }
    // for possible future feature requirements
    // else if (this.currentFloor$.value !== 1) {
    //   this.goToFloor(1, this.signal);
    // }
  }

  public elevatorCanMove(): boolean {
    return (
      this.elevatorStatus$.value === ElevatorState.STOPPED &&
      this.doorStatus$.value === ElevatorDoor.CLOSED
    );
  }


  public async goToFloor(finalFloor: number, signal: any): Promise<void> {
    this.elevatorStatus$.next(ElevatorState.MOVING);

    // Determine movement direction
    finalFloor > this.currentFloor$.value
      ? this.movementDirection$.next(ElevatorDirection.UP)
      : this.movementDirection$.next(ElevatorDirection.DOWN);
    
    const elevatorIsAscending: boolean =
    this.movementDirection$.value === ElevatorDirection.UP;
    
    // Determine floor difference between final destination and current floor
    let floorDifference: number = elevatorIsAscending
      ? finalFloor - this.currentFloor$.value
      : this.currentFloor$.value - finalFloor;

    // Increment or decrement current floor value on each iteration
    for (let i = 0; i < floorDifference; i++) {
      this.currentFloor$.next(
        elevatorIsAscending
          ? this.currentFloor$.value + 1
          : this.currentFloor$.value - 1
      );
      
      // set up event listener on abort controller set floor diff to be zero to end for loop
      signal?.addEventListener('abort', () => {
        console.log('Request aborted');
        floorDifference = 0;
        return;
      });

      await new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });
    }

    this.reachFloor();
  }

  public reachFloor(): void {
    if(this.isElevatorPaused()) {
      return;
    }
    this.pendingRequests.splice(0, 1);
    this.elevatorStatus$.next(ElevatorState.STOPPED);
    this.musicService.playBell();
    this.doorStatus$.next(ElevatorDoor.OPENED);
    this.arrived$.next(this.currentFloor$.value);

    // If close doors button is pressed, ElevatorSpeed.SPEEDUP case is executed
    // If open doors button is pressed, ElevatorSpeed.SLOWDOWN case is executed
    // If open doors button is pressed, ElevatorSpeed.NORMAL case is executed
    this.speed$.subscribe((speed: ElevatorSpeed) => {
      switch (speed) {
        case ElevatorSpeed.NORMAL:
          setTimeout(() => {
            this.doorStatus$.next(ElevatorDoor.CLOSED);
            this.checkNextCall();
          }, 4000);
          break;
        case ElevatorSpeed.SLOWDOWN:
          setTimeout(() => {
            this.doorStatus$.next(ElevatorDoor.CLOSED);
            this.checkNextCall();
          }, 10000);
          break;
        case ElevatorSpeed.SPEEDUP:
          setTimeout(() => {
            this.doorStatus$.next(ElevatorDoor.CLOSED);
            this.checkNextCall();
          }, 1000);
          break;
      }
    });
    // Reset the door speed back to normal for the next request
    this.speed$.next(ElevatorSpeed.NORMAL);
  }
}
