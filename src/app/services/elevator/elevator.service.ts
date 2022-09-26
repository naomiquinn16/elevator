import {
  CompileTemplateMetadata,
  identifierModuleUrl,
} from '@angular/compiler';
import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable, Subject } from 'rxjs';

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
  public maximumPendingRequests: Number = 5;
  public pendingRequests: Array<IElevatorCall> = [];
  public doorStatus$: BehaviorSubject<ElevatorDoor> =
    new BehaviorSubject<ElevatorDoor>(ElevatorDoor.CLOSED);
  public elevatorStatus$: BehaviorSubject<ElevatorState> =
    new BehaviorSubject<ElevatorState>(ElevatorState.STOPPED);
  public movementDirection$: BehaviorSubject<ElevatorDirection> =
    new BehaviorSubject<ElevatorDirection>(ElevatorDirection.UP);
  public currentFloor$: BehaviorSubject<number> = new BehaviorSubject<number>(
    1
  );
  acontroller = new AbortController();
  public signal: any;

  constructor(public musicService: MusicService) {
    this.signal = this.acontroller.signal;
    this.handleCalls();
  }

  public handleCalls(): void {
    this.individualFloorCall$.subscribe((floor: number) =>
      this.newCall({
        callOrigin: ElevatorCallOrigin.FLOOR,
        floor,
      })
    );

    this.elevatorControllerCall$.subscribe((floor: number) =>
      this.newCall({
        callOrigin: ElevatorCallOrigin.CONTROLLER,
        floor,
      })
    );

    this.elevatorStatus$.subscribe((state: ElevatorState) => {
      if (state === 2) {
        this.acontroller.abort();
      }
    });
  }

  public newCall(call: IElevatorCall): void {
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

    this.validateRequests();
  }

  public canAddNewCall(): boolean {
    return (
      this.pendingRequests.length < this.maximumPendingRequests &&
      !this.isElevatorPaused()
    );
  }

  public isElevatorPaused(): boolean {
    return this.elevatorStatus$.value === ElevatorState.PAUSED;
  }

  public validateRequests(): void {
    if (!this.elevatorCanMove()) {
      return;
    }

    if (this.pendingRequests.length && !this.isElevatorPaused()) {
      this.goToFloor(this.pendingRequests[0].floor, this.signal);
    }
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

  public async goToFloor(finalFloor: number, signal: any): Promise<void> {
    this.signal.addEventListener('abort', () => {
      // 6
      const error = new DOMException(
        'Calculation aborted by the user',
        'AbortError'
      );
    });

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

    this.speed$.subscribe((speed) => {
      console.log(speed)
      switch (speed) {
        case 0:
          setTimeout(() => {
            this.doorStatus$.next(ElevatorDoor.CLOSED);
            this.validateRequests();
          }, 4000);
          break;
        case 1:
          setTimeout(() => {
            this.doorStatus$.next(ElevatorDoor.CLOSED);
            this.validateRequests();
          }, 10000);
          break;
        case 2:
          setTimeout(() => {
            this.doorStatus$.next(ElevatorDoor.CLOSED);
            this.validateRequests();
          }, 1000);
          break;
      }
    });
    this.speed$.next(ElevatorSpeed.NORMAL);
  }
}
