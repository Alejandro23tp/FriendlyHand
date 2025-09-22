import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticipantSemanasComponent } from './participant-semanas.component';

describe('ParticipantSemanasComponent', () => {
  let component: ParticipantSemanasComponent;
  let fixture: ComponentFixture<ParticipantSemanasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParticipantSemanasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParticipantSemanasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
