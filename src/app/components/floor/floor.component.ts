import { Component, Input } from '@angular/core';
import { ElevatorState } from 'src/app/enums/elevator.enum';
import { ElevatorService } from 'src/app/services/elevator/elevator.service';
import { MusicService } from 'src/app/services/music/music.service';

@Component({
  selector: 'app-floor',
  templateUrl: './floor.component.html',
  styleUrls: ['./floor.component.scss'],
})
export class FloorComponent {
  @Input() public floorNumber: number = 1;
  @Input() public firstFloor: boolean = true;
  @Input() public lastFloor: boolean = false;
  isUpActive = false;
  isDownActive = false;
  constructor(
    public musicService: MusicService,
    public elevatorService: ElevatorService
  ) {}

  public callElevator(direction: string): void {
    if (this.elevatorService.isElevatorPaused()) {
      this.musicService.playError();
      return;
    } else {
      this.elevatorService.individualFloorCall$.next(this.floorNumber);
      if (direction === 'down') {
        this.isDownActive = true;
      } else {
        this.isUpActive = true;
      }

      this.elevatorService.arrived$.subscribe((floor) => {
        if (floor === this.floorNumber)
        {
          if (direction === 'down') {
            this.isDownActive = false;
          } else {
            this.isUpActive = false;
          }
        }
      });
    }
  }
}
