export enum ElevatorDirection {
	UP = 'UP',
	DOWN = 'DOWN'
}

export enum ElevatorDoor {
	CLOSED = 'CLOSED',
	OPENED = 'OPENED',
	STALLED = 'STALLED'
}

export enum ElevatorState {
	STOPPED = 0,
	MOVING = 1,
	PAUSED = 2
}

export enum ElevatorCallOrigin {
	FLOOR = 0,
	CONTROLLER = 1
}
