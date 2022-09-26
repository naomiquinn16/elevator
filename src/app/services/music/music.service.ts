import { Injectable } from '@angular/core';
import { Howl, Howler } from 'howler';


@Injectable({
  providedIn: 'root'
})
export class MusicService {
  bell: Howl = new Howl({ src: './assets/sounds/elevator_bell.mp3' });
  error: Howl = new Howl({ src: './assets/sounds/elevator_error.mp3' });
  constructor() { }

	public playBell(): void {
    Howler.volume(0.8);
		this.bell.play();
	}

	public playError(): void {
    Howler.volume(0.8);
		this.error.play();
	}
}
