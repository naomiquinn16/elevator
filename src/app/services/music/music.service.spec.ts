import { TestBed } from '@angular/core/testing';
import { Howl, Howler } from 'howler';

import { MusicService } from './music.service';

describe('DingService', () => {
  let service: MusicService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MusicService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();

    expect(service.bell).toBeDefined();
    expect(service.bell).toBeInstanceOf(Howl);

    expect(service.error).toBeDefined();
    expect(service.error).toBeInstanceOf(Howl);
  });

  describe('play sounds', () => {
    it('should be created', () => {
      const spyHowler = spyOn(Howler, 'volume');
      service.playBell();
      expect(spyHowler).toHaveBeenCalledWith(0.8);
    });
    it('should be created', () => {
      const spyHowler = spyOn(Howler, 'volume');
      service.playError();
      expect(spyHowler).toHaveBeenCalledWith(0.8);
    });
  });
});
