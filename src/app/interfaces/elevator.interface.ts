import { ElevatorCallOrigin } from "../enums/elevator.enum";

export interface IElevatorCall {
	floor: number;
	callOrigin: ElevatorCallOrigin;
}