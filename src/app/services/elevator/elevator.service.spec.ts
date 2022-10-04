import { TestBed } from '@angular/core/testing';
import { MusicService } from '../music/music.service';

import { ElevatorService } from './elevator.service';

import {
  ElevatorCallOrigin,
  ElevatorDirection,
  ElevatorDoor,
  ElevatorSpeed,
  ElevatorState,
} from '../../enums/elevator.enum';
import { IElevatorCall } from 'src/app/interfaces/elevator.interface';

describe('ElevatorService', () => {
  let service: ElevatorService;
  let musicService: MusicService;
  let handleCallsSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MusicService],
    });

    handleCallsSpy = spyOn(ElevatorService.prototype, 'handleCalls');
    service = TestBed.inject(ElevatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    expect(service).toBeTruthy();

    expect(service.individualFloorCall$).toBeDefined();
    expect(service.elevatorControllerCall$).toBeDefined();
    expect(service.arrived$).toBeDefined();
    expect(service.speed$).toBeDefined();

    expect(service.maxRequests).toEqual(5);
    expect(service.pendingRequests).toEqual([]);

    expect(service.elevatorStatus$.value).toEqual(ElevatorState.STOPPED);
    expect(service.doorStatus$.value).toEqual(ElevatorDoor.CLOSED);
    expect(service.movementDirection$.value).toEqual(ElevatorDirection.UP);
    expect(service.currentFloor$.value).toEqual(1);
    expect(handleCallsSpy).toHaveBeenCalledTimes(1);
  });

  it('should call handleCalls on class constructor', () => {
    expect(handleCallsSpy).toHaveBeenCalledTimes(1);
  });

  describe('handleCalls method', () => {
    let subscriptionFromFloorsSpy: jasmine.Spy;
    let subscriptionFromControllerSpy: jasmine.Spy;

    beforeEach(() => {
      handleCallsSpy.and.callThrough();

      subscriptionFromFloorsSpy = spyOn(
        service.individualFloorCall$,
        'subscribe'
      );
      subscriptionFromControllerSpy = spyOn(
        service.elevatorControllerCall$,
        'subscribe'
      );
    });

    it('should subscribe to new floor calls', () => {
      service.handleCalls();

      expect(subscriptionFromFloorsSpy).toHaveBeenCalled();
    });

    it('should subscribe to new elevator panel calls', () => {
      service.handleCalls();

      expect(subscriptionFromControllerSpy).toHaveBeenCalled();
    });

    it('should call subscriptionFromFloors and call method', () => {
      subscriptionFromFloorsSpy.and.callThrough();
      const spy: jasmine.Spy = spyOn(service, 'call');
      service.handleCalls();

      service.individualFloorCall$.next(2);
      expect(spy).toHaveBeenCalled();
    });

    it('should call subscriptionFromFloors and call method', () => {
      subscriptionFromControllerSpy.and.callThrough();
      const spy: jasmine.Spy = spyOn(service, 'call');
      service.handleCalls();

      service.elevatorControllerCall$.next(2);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('call', () => {
		let checkCallsSpy: jasmine.Spy;

    beforeEach(() => {
			checkCallsSpy = spyOn(service, 'checkNextCall');
		});

    it('should call canAddNewCall', () => {
			const spy: jasmine.Spy = spyOn(service, 'canAddNewCall');

			service.call({ callOrigin: ElevatorCallOrigin.FLOOR, floor: 2 });

			expect(spy).toHaveBeenCalled();
		});


		it('should not add call to stack if canAddNewCall returns false', () => {
			const spy: jasmine.Spy = spyOn(service.pendingRequests, 'push');
			spyOn(service, 'canAddNewCall').and.returnValue(false);

			service.call({ callOrigin: ElevatorCallOrigin.FLOOR, floor: 4});

			expect(spy).not.toHaveBeenCalled();
		});

    it('should make error  noise if #canAddNewCall returns false', () => {
			const spy: jasmine.Spy = spyOn(service.musicService, 'playError');
			spyOn(service, 'canAddNewCall').and.returnValue(false);

			service.call({ callOrigin: ElevatorCallOrigin.FLOOR, floor: 2 });

			expect(spy).toHaveBeenCalled();
		});

    it('should add new call to pending requests in start of list, after the existent panel calls (if them exist\'s), if call type is panel', () => {
			const pendingReqs: Array<IElevatorCall> = [
				{ callOrigin: ElevatorCallOrigin.CONTROLLER, floor: 4},
				{ callOrigin: ElevatorCallOrigin.FLOOR, floor: 4}
			];

			Object.defineProperty(service, 'pendingRequests', { value: pendingReqs });
			spyOn(service, 'canAddNewCall').and.returnValue(true);

			service.call({ callOrigin: ElevatorCallOrigin.CONTROLLER, floor: 3 });

			expect(service.pendingRequests).toEqual(
				[
					{ callOrigin: ElevatorCallOrigin.CONTROLLER, floor: 4 },
					{ callOrigin: ElevatorCallOrigin.CONTROLLER, floor: 3 },
					{ callOrigin: ElevatorCallOrigin.FLOOR, floor: 4 }
				]
			);
		});



  });
});
