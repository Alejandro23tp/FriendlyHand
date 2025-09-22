import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticipantPrestamosComponent } from './participant-prestamos.component';

describe('ParticipantPrestamosComponent', () => {
  let component: ParticipantPrestamosComponent;
  let fixture: ComponentFixture<ParticipantPrestamosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParticipantPrestamosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParticipantPrestamosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
