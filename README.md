# Elevator

This is an interactive elevator system simulation implemented in Javascript (ES6). It's been tested on current desktop versions of Chrome and Safari and project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 12.2.16.

The type of elevator I have built can be operated both from within the elevator itself using the panel controller and by using the call buttons outside the elevators to make up/down requests on each floor.

# Features:

1. Operating Panel

- When a user makes a call from the operating panel, I check if the call can be made using the canAddNewCall() method which checks that the user has not exceeded the max pending call requests & that the elevator is not in a paused state. If the user cannot add a new request, a warning sound will play using Howler module. The new call is added to the queue/array depending on where the callOrigin was. A check is done to ensure the elevator can move (not paused, stopped with doors closed). The GoToFloor async method is then called, the elevator state is set to MOVING and the current floor number is set in real time every time the lift moves. Finally, when the lift reaches the correct floor, the lifts state is set to STOPPED, a bell rings, the doors state is set to OPEN and the currentFloor is passed to the arrived Subject.
- When a floor is selected it will stay highlighted until the floor has been reached. Depending on the speed state of the lifts, the doors close and the next floor is the queue is navigated to. I use a switch statement and timeouts for this but it could be implemented in a better way.
- Clicking the alarm button will pause the elevator and raise an alarm (toggleAlarm()) and trigger and window alert. The lift is considered to be in a paused state in this case (Elevator.PAUSED). Users will not be able to move to another floor by using either the controller panel or the call buttons at each floor, Attempting to do so while the lift is a paused state will result in the alarm ringing again (See the callElevator() method for the call button which checks if the elevator is paused). By clicking the alarm button again, the elevator will resume order & complete any pending requests queued prior to the pause.
- Clicking the open door button will increase the time the elevator is on the current floor for(only when the elevator is stationary - timeout of 1s for quick close of the doors).
- Using the close door button will decrease the time the elevator is on the current floor for(only when the elevator is stationary - timeout of 10s for pushing the button to see the doors opened longer).

2. Floor Designator

In my solution the floor designator can be seen above the buttons in the controller panel.

- When stationary, the current floor of the elevator is visible.
- When moving, the direction the elevator is moving in is highlighted by an arrow and the floor number is updated in real time as the elevator moves to different floors. Note, the floor designator also works if you use the separate call buttons on each floor. I conditionally display the up/down arror icon to signify direction.

3. Call Buttons

- Call buttons have been implemented for each floor and the are visible to the left of each floor in the building. The selected call button will stay highlighted until the elevator has stopped at the floor while moving in the requested direction.

4.  The Elevator

- I included an very crude elevator for visual purposes and to see it all working properly.

# Future work / What I would do different with more time

- Using Angular CLI for this was definitely overkill. Given the nature of the excercise, it was pretty much doable in vanilla JS, HTML & SCSS
- If I had more time, I would have scrapped all the Subjects & Behaviour Subjects and used Redux to handle the states of elevators movements, doors, speed etc. This would have made life a lot easier and of course it would make the code a lot leaner. The way I have done it is okay because I'm using Angular but its not my preferred approach.
- Similiar to above, with more time, I would handle the speed of the elevators better so as to avoid using timeouts(()=>).
- With more time, I would also implement an Abort Controller in order to interupt async tasks when the elevator is paused. Typical usage of AbortController that I was aware of was using it with fetch requests like below:
  let abortController = new AbortController();
  fetch('/url', { signal: abortController.signal });
  abortController.abort();
  Calling the abort method cancels the HTTP request and rejects the promise. AbortControllerSignals implement the DOM's EventTarget interface, or in other words, are an event emitter with an addEventListener method. They provides a standardized, composable solution to cancel async tasks.
- A further feature requirement could be to ensure elevators are prepositioned (e.g., send all elevators to the ground floor when they are idle. I commented this out in my code).
- As with all of these coding challenges, with more time I would write more tests - most of the unit testing effort wad covered in the elevator service for example!

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
