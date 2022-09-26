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
  public maxRequests: Number = 5;
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

  constructor(public musicService: MusicService) {
    this.handleCalls();
  }

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
        // need to implement this
        console.log('call abort controller');
      }
    });
  }

  public call(call: IElevatorCall): void {
    if (!this.canAddNewCall()) {
      this.musicService.playError();
      return;
    }

    if (call.callOrigin === ElevatorCallOrigin.CONTROLLER) {
      const lastPanelCallIndex: number = this.pendingRequests.filter(
        (request: IElevatorCall) =>
          request.callOrigin === ElevatorCallOrigin.CONTROLLER
      ).length;
      this.pendingRequests.splice(lastPanelCallIndex, 0, call);
    } else if (call.callOrigin === ElevatorCallOrigin.FLOOR) {
      this.pendingRequests.push(call);
    }

    this.checkCalls();
  }

  public canAddNewCall(): boolean {
    return (
      this.pendingRequests.length < this.maxRequests &&
      !this.isElevatorPaused()
    );
  }

  public isElevatorPaused(): boolean {
    return this.elevatorStatus$.value === ElevatorState.PAUSED;
  }

  public checkCalls(): void {
    if (!this.elevatorCanMove()) {
      return;
    }

    if (this.pendingRequests.length && !this.isElevatorPaused()) {
      this.goToFloor(this.pendingRequests[0].floor);
    }
    // for posible future feature requirements

    // else if (this.currentFloor$.value !== 1) {
    //   this.goToFloor(1, this.signal);
    // }
  }

  public elevatorCanMove(): boolean {
    return (
      this.elevatorStatus$.value !== ElevatorState.PAUSED &&
      this.elevatorStatus$.value === ElevatorState.STOPPED &&
      this.doorStatus$.value === ElevatorDoor.CLOSED
    );
  }

  public async goToFloor(finalFloor: number): Promise<void> {
    this.elevatorStatus$.next(ElevatorState.MOVING);
    finalFloor > this.currentFloor$.value
      ? this.movementDirection$.next(ElevatorDirection.UP)
      : this.movementDirection$.next(ElevatorDirection.DOWN);
    const elevatorIsAscending: boolean =
      this.movementDirection$.value === ElevatorDirection.UP;
    const floorDifference: number = elevatorIsAscending
      ? finalFloor - this.currentFloor$.value
      : this.currentFloor$.value - finalFloor;

    for (let i = 0; i < floorDifference; i++) {
      this.currentFloor$.next(
        elevatorIsAscending
          ? this.currentFloor$.value + 1
          : this.currentFloor$.value - 1
      );
      await new Promise<void>((res: Function, _: Function) => {
        setTimeout(res, 2000);
      });
    }
    this.reachFloor();
  }

  public reachFloor(): void {
    this.pendingRequests.splice(0, 1);
    if (!this.isElevatorPaused()) {
      this.elevatorStatus$.next(ElevatorState.STOPPED);
      this.musicService.playBell();
      this.doorStatus$.next(ElevatorDoor.OPENED);
      this.arrived$.next(this.currentFloor$.value);
    }

    this.speed$.subscribe((speed: ElevatorSpeed) => {
      switch (speed) {
        case ElevatorSpeed.NORMAL:
          setTimeout(() => {
            this.doorStatus$.next(ElevatorDoor.CLOSED);
            this.checkCalls();
          }, 4000);
          break;
        case ElevatorSpeed.SLOWDOWN:
          setTimeout(() => {
            this.doorStatus$.next(ElevatorDoor.CLOSED);
            this.checkCalls();
          }, 10000);
          break;
        case ElevatorSpeed.SPEEDUP:
          setTimeout(() => {
            this.doorStatus$.next(ElevatorDoor.CLOSED);
            this.checkCalls();
          }, 1000);
          break;
      }
    });
    this.speed$.next(ElevatorSpeed.NORMAL);
  }
}
