export enum ElevatorDirection {
	UP = 'UP',
	DOWN = 'DOWN'
}

export enum ElevatorDoor {
	CLOSED = 'CLOSED',
	OPENED = 'OPENED',
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

export enum ElevatorSpeed {
	NORMAL = 0,
	SLOWDOWN = 1,
	SPEEDUP = 2
}
