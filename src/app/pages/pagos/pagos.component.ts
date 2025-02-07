import { Component } from '@angular/core';
import { SemanasService } from '../../services/semanas.service';
import { ParticipantesService } from '../../services/participantes.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pagos',
  imports: [CommonModule, FormsModule],
  templateUrl: './pagos.component.html',
  styleUrl: './pagos.component.scss'
})
export class PagosComponent {
  selectedSemana: string = '';
  semanas: string[] = [];
  participantes: any[] = [];
  loading: boolean = false;
  error: string = '';

  constructor(
    private semanasService: SemanasService,
    private participantesService: ParticipantesService
  ) {}

  ngOnInit() {
    this.generarSemanasHastaActual();
  }

  generarSemanasHastaActual(): void {
    const fecha = new Date();
    const inicioAno = new Date(fecha.getFullYear(), 0, 1);
    const diff = fecha.getTime() - inicioAno.getTime();
    const semanaActual = Math.ceil((diff / (1000 * 60 * 60 * 24 * 7)));
    
    this.semanas = [];
    // Generar desde la semana 1 hasta la actual
    for (let i = 1; i <= semanaActual; i++) {
      this.semanas.push(`Semana ${i}`);
    }
    
    // Establecer la semana actual como seleccionada
    this.selectedSemana = `Semana ${semanaActual}`;
    this.cargarParticipantes();
  }

  onSemanaChange() {
    if (this.selectedSemana) {
      this.cargarParticipantes();
    }
  }

  cargarParticipantes() {
    this.loading = true;
    this.semanasService.ObenerParticipantesSinCancelarSemanal(this.selectedSemana).subscribe(
      (response: any) => {
        if (response && response.data) {
          this.participantes = response.data;
        }
        this.loading = false;
      },
      (error) => {
        this.error = 'Error al cargar participantes';
        this.loading = false;
      }
    );
  }

  enviarWhatsApp(participante: any) {
    const valor = participante.part_cupos * 10;
    const message = `Hola ${participante.part_nombre}, este es un recordatorio de tu pago de la ${this.selectedSemana} con un valor de $${valor}.`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/+593${participante.part_telefono}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  }
}
