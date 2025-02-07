import { Component, OnInit, HostListener } from '@angular/core';
import { SemanasService } from '../../services/semanas.service';
import { ParticipantesService } from '../../services/participantes.service';
import { LoginService } from '../../services/login.service';
import { formatDate } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-semanasparticipante',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './semanasparticipante.component.html',
  styleUrls: ['./semanasparticipante.component.scss']
})
export class SemanasparticipanteComponent implements OnInit {
  participantes: any[] = [];
  semanas: any[] = [];
  selectedParticipanteId: string = '';
  selectedParticipante: any = null;
  isLoading: boolean = false;
  errorMessage: string = '';
  showRegistroModal: boolean = false;
  nuevoPago: any = {};
  fechaActual: string = '';
  cupoParticipante: number = 0;
  searchTerm: string = '';
  semanasFiltradas: any[] = [];
  participantesFiltrados: any[] = [];
  showDropdown = false;
  allParticipantes: any[] = []; // Para mantener la lista completa

  constructor(
    private semanasService: SemanasService,
    private participantesService: ParticipantesService,
    private loginService: LoginService
  ) {}

  ngOnInit(): void {
    this.fechaActual = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
    // Eliminamos la duplicidad de carga de participantes
    this.cargarParticipantes();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: any) {
    if (!event.target.closest('.relative')) {
      this.showDropdown = false;
    }
  }

  cargarParticipantes(): void {
    this.participantesService.listarParticipantes().subscribe({
      next: (response) => {
        // Aseguramos que los datos se guarden en ambos arrays
        this.participantes = response.data;
        this.allParticipantes = [...this.participantes];
        this.participantesFiltrados = [...this.participantes];
      },
      error: (error) => {
        console.error('Error al cargar participantes:', error);
        this.errorMessage = 'No se pudo cargar la lista de participantes.';
      }
    });
  }

  cargarSemanas(participanteId: string): void {
    this.isLoading = true;
    this.semanasService.getSemanas_Participante(participanteId).subscribe({
      next: (response) => {
        this.semanas = response.data.map((item: any) => ({
          nombre_semana: item.nombre_semana,
          valor: item.valor,
          fecha_pago: item.fecha_pago,
          responsable: item.responsable
        }));
        this.semanasFiltradas = [...this.semanas]; // Inicializar el array filtrado con todos los datos
        this.selectedParticipante = this.participantes.find(p => p.id === participanteId);
        this.sugerirProximaSemana();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar semanas:', error);
        this.errorMessage = 'No se pudieron cargar las semanas del participante.';
        this.isLoading = false;
      }
    });
  }

  onParticipanteChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const participanteId = target.value;

    this.selectedParticipanteId = participanteId;
    if (participanteId) {
      this.cargarSemanas(participanteId);
      this.obtenerCupoParticipante(participanteId);
    } else {
      this.semanas = [];
      this.selectedParticipante = null;
      this.cupoParticipante = 0;
    }
  }

  mostrarModalRegistro(): void {
    console.log('Mostrando modal, cupo participante:', this.cupoParticipante);
    this.showRegistroModal = true;
    this.nuevoPago.fecha = this.fechaActual; // Inicializa la fecha de pago con la fecha actual
    this.nuevoPago.valor = this.cupoParticipante * 10;
  }

  cerrarModalRegistro(): void {
    this.showRegistroModal = false;
  }

  registrarPago(): void {
    this.nuevoPago.inicioSemana = this.calcularInicioSemana(this.nuevoPago.semana);
    const pagoData = {
      part_id: this.selectedParticipanteId,
      semana: `Semana ${this.nuevoPago.semana}`,
      valor: this.nuevoPago.valor,
      fecha: this.nuevoPago.fecha,
      responsable: this.loginService.getUsserId(),
      inicioSemana: this.nuevoPago.inicioSemana
    };

    this.semanasService.registrarPagoSemanal(pagoData).subscribe({
      next: (response) => {
        console.log('Pago registrado:', response);
        this.cerrarModalRegistro();
        this.cargarSemanas(this.selectedParticipanteId);
      },
      error: (error) => {
        console.error('Error al registrar el pago:', error);
      }
    });
  }

  calcularInicioSemana(numeroSemana: number): string | null {
    if (numeroSemana) {
      const currentYear = new Date(this.nuevoPago.fecha).getFullYear();
      const inicioAnio = new Date(currentYear, 0, 1);
      const inicioSemana = new Date(inicioAnio);
      inicioSemana.setDate(inicioAnio.getDate() + (numeroSemana - 1) * 7);
      return inicioSemana.toISOString().substring(0, 10);
    }
    return null;
  }

  sugerirProximaSemana(): void {
    if (this.semanas.length > 0) {
      const ultimaSemana = this.semanas[this.semanas.length - 1].nombre_semana;
      const numeroUltimaSemana = parseInt(ultimaSemana.replace('Semana ', ''));
      this.nuevoPago.semana = (numeroUltimaSemana + 1).toString();
    } else {
      this.nuevoPago.semana = '1';
    }
  }

  obtenerCupoParticipante(participanteId: string): void {
    this.participantesService.obtenerCuposParticipante(participanteId).subscribe({
      next: (response) => {
        const participante = response.data;
        if (participante && participante.part_cupos) {
          this.cupoParticipante = participante.part_cupos;
        } else {
          this.cupoParticipante = 0;
          console.log('Cupo participante no encontrado:', participanteId);
        }
      },
      error: (error) => {
        console.error('Error al cargar cupo del participante:', error);
      }
    });
  }

  onSearch(event: any): void {
    const searchTerm = (event.target.value || '').toLowerCase().trim();
    if (searchTerm === '') {
      this.participantesFiltrados = [...this.allParticipantes];
    } else {
      this.participantesFiltrados = this.allParticipantes.filter(participante =>
        participante.part_nombre.toLowerCase().includes(searchTerm)
      );
    }
    this.showDropdown = true;
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.showDropdown = !this.showDropdown;
    if (this.showDropdown) {
      // Mostrar lista completa al abrir
      this.participantesFiltrados = [...this.allParticipantes];
      // Limpiar término de búsqueda
      this.searchTerm = '';
    }
  }

  // Mejora del método de selección
  onParticipanteSelect(participante: any): void {
    this.selectedParticipanteId = participante.id;
    this.searchTerm = participante.part_nombre;
    this.showDropdown = false;
    this.cargarSemanas(participante.id);
    this.obtenerCupoParticipante(participante.id);
  }
}