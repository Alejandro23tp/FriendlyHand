import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrestamosrecordatorioComponent } from './prestamosrecordatorio.component';

describe('PrestamosrecordatorioComponent', () => {
  let component: PrestamosrecordatorioComponent;
  let fixture: ComponentFixture<PrestamosrecordatorioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrestamosrecordatorioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrestamosrecordatorioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
