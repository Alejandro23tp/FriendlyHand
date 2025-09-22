import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticipantEstadoCuentaComponent } from './participant-estado-cuenta.component';

describe('ParticipantEstadoCuentaComponent', () => {
  let component: ParticipantEstadoCuentaComponent;
  let fixture: ComponentFixture<ParticipantEstadoCuentaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParticipantEstadoCuentaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParticipantEstadoCuentaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
