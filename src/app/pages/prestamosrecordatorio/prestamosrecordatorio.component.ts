import { Component } from '@angular/core';
import { PrestamosService } from '../../services/prestamos.service';
import { ParticipantesService } from '../../services/participantes.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-prestamosrecordatorio',
  imports: [CommonModule, FormsModule],
  templateUrl: './prestamosrecordatorio.component.html',
  styleUrl: './prestamosrecordatorio.component.scss'
})
export class PrestamosrecordatorioComponent {
  selectedSemana: string = '';
  semanas: string[] = [];
  participantes: any[] = [];
  loading: boolean = false;
  error: string = '';

  constructor(
    private prestamoService: PrestamosService,
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
    this.participantes = [];
    this.loading = true;
    this.prestamoService.prestamistasCancelaron("Pendiente", this.selectedSemana).subscribe(
      (response: any) => {
        if (response && response.data) {
          //this.participantes = response.data;
          //Ocupar la funcion obtenerCuposParticipante y cargarlos en participantes
          for (let i = 0; i < response.data.length; i++) {
            this.participantesService.obtenerCuposParticipante(response.data[i].pp_partId).subscribe(
              (response: any) => {
                if (response && response.data) {
                  response.data.part_cupos = response.data.pp_cupos;
                  this.participantes.push(response.data);
                }
              },
              (error) => {
                this.error = 'Error al cargar participantes';
              }
            );
          }
          
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
    const message = `Estimado/a ${participante.part_nombre},\n\nLe recordamos que tiene pagos de préstamos e intereses pendientes. Es fundamental que realice su pago a tiempo para evitar cualquier inconveniente y mantener su historial crediticio en buen estado.\n\nGracias por su colaboración y por ser parte del Banco Manos Amigas. Su compromiso con el cumplimiento de sus obligaciones nos permite seguir apoyando a todos los socios.\n\n¡No olvide realizar su pago a la brevedad posible!\n\nAtentamente,\nBanco Manos Amigas`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/+593${participante.part_telefono}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  }
}
