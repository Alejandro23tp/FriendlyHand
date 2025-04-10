import { TestBed } from '@angular/core/testing';

import { ParticipantLoginService } from './participant-login.service';

describe('ParticipantLoginService', () => {
  let service: ParticipantLoginService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ParticipantLoginService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
