import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SemanasparticipanteComponent } from './semanasparticipante.component';

describe('SemanasparticipanteComponent', () => {
  let component: SemanasparticipanteComponent;
  let fixture: ComponentFixture<SemanasparticipanteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SemanasparticipanteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SemanasparticipanteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
