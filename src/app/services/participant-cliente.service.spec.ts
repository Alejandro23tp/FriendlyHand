import { TestBed } from '@angular/core/testing';

import { ParticipantClienteService } from './participant-cliente.service';

describe('ParticipantClienteService', () => {
  let service: ParticipantClienteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ParticipantClienteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
