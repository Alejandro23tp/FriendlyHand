// participantes.interface.ts
export interface Participante {
  id: number;
  part_nombre: string;
  part_telefono: string;
  part_cupos: number;
  created_at: string;
  updated_at: string;
}

export interface ParticipantesResponse {
  message: string;
  data: Participante[];
}

export interface ParticipanteForm {
  id: number;
  nombre: string;
  telefono: string;
  cupo: number;
}


// participantes.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParticipantesService } from '../../services/participantes.service';
import { FormsModule } from '@angular/forms';  // Asegúrate de tener esta importación

@Component({
  selector: 'app-participantes',
  standalone: true,
  imports: [CommonModule,
    FormsModule
  ],
  templateUrl: './participantes.component.html',
  styleUrl: './participantes.component.scss'
})
export default class ParticipantesComponent implements OnInit {
  showRegistroModal: boolean = false;
  nuevoParticipante = {
    nombre: '',
    cedula: '',  // Campo adicional para el diseño
    telefono: '',
    cupo: 0
  };

  participantes: Participante[] = [];
  loading: boolean = true;
  error: string | null = null;
  editingParticipante: ParticipanteForm | null = null;

  constructor(private participantesService: ParticipantesService) {}

  ngOnInit() {
    this.cargarParticipantes();
  }

  cargarParticipantes() {
    this.loading = true;
    this.participantesService.listarParticipantes().subscribe({
      next: (response: ParticipantesResponse) => {
        this.participantes = response.data;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar los participantes';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }

  editarParticipante(participante: Participante) {
    this.editingParticipante = {
      id: participante.id,
      nombre: participante.part_nombre,
      telefono: participante.part_telefono,
      cupo: participante.part_cupos
    };
  }

  guardarEdicion() {
    if (this.editingParticipante) {
      this.participantesService.actualizarParticipante(this.editingParticipante).subscribe({
        next: () => {
          this.cargarParticipantes();
          this.editingParticipante = null;
        },
        error: (error) => {
          console.error('Error al actualizar:', error);
          // Aquí podrías agregar un mensaje de error para el usuario
        }
      });
    }
  }

  cancelarEdicion() {
    this.editingParticipante = null;
  }

  // Agregar estos métodos
mostrarModalRegistro() {
  this.showRegistroModal = true;
  this.nuevoParticipante = {
    nombre: '',
    cedula: '',
    telefono: '',
    cupo: 0
  };
}

cerrarModalRegistro() {
  this.showRegistroModal = false;
}

registrarParticipante(event: Event) {
  event.preventDefault();
  
  this.participantesService.registrarParticipante(this.nuevoParticipante).subscribe({
    next: () => {
      this.cargarParticipantes();
      this.cerrarModalRegistro();
    },
    error: (error) => {
      console.error('Error al registrar:', error);
      // Aquí podrías agregar un mensaje de error para el usuario
    }
    });
  }
}