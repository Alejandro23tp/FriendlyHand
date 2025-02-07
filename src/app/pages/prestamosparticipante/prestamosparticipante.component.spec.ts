import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrestamosparticipanteComponent } from './prestamosparticipante.component';

describe('PrestamosparticipanteComponent', () => {
  let component: PrestamosparticipanteComponent;
  let fixture: ComponentFixture<PrestamosparticipanteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrestamosparticipanteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrestamosparticipanteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
