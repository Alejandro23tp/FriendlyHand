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
import { toast } from 'ngx-sonner';
import { finalize } from 'rxjs/operators';

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
  isLoading: boolean = false;
  nombreVerificado = false;
  verificando = false;

  constructor(private participantesService: ParticipantesService) {}

  ngOnInit() {
    this.cargarParticipantes();
  }

  cargarParticipantes() {
    this.loading = true;
    this.participantesService.listarParticipantes().subscribe({
      next: (response: ParticipantesResponse) => {
        this.participantes = response.data.sort((a, b) => a.id - b.id);
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
      this.isLoading = true;
      this.participantesService.actualizarParticipante(this.editingParticipante)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: () => {
            toast.success('Participante actualizado', {
              description: 'Los datos se han guardado correctamente'
            });
            this.cargarParticipantes(); // Esto recargará y ordenará los participantes
            this.editingParticipante = null;
          },
          error: (error) => {
            console.error('Error al actualizar:', error);
            toast.error('Error al actualizar', {
              description: error.error?.message || 'No se pudo actualizar el participante'
            });
          }
        });
    }
  }

  cancelarEdicion() {
    this.editingParticipante = null;
  }

  verificarCedula() {
    if (!this.nuevoParticipante.cedula || this.verificando) return;
    
    this.verificando = true;
    this.participantesService.verificarCedula(this.nuevoParticipante.cedula)
      .pipe(finalize(() => this.verificando = false))
      .subscribe({
        next: (response) => {
          if (response.success) {
            if (response.existe_en_sistema) {
              toast.error('Esta cédula ya está registrada en el sistema');
              this.nuevoParticipante.nombre = '';
              this.nombreVerificado = false;
            } else {
              this.nuevoParticipante.nombre = response.nombre;
              this.nombreVerificado = true;
              toast.success('Cédula verificada correctamente');
            }
          } else {
            toast.error('No se pudo verificar la cédula');
            this.nombreVerificado = false;
          }
        },
        error: (error) => {
          toast.error('Error al verificar la cédula');
          this.nombreVerificado = false;
        }
      });
  }

  mostrarModalRegistro() {
    this.showRegistroModal = true;
    this.nombreVerificado = false;
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
    if (!this.nombreVerificado) {
      toast.error('Por favor verifique la cédula primero');
      return;
    }
    this.isLoading = true;
    
    this.participantesService.registrarParticipante(this.nuevoParticipante)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: () => {
          toast.success('Participante registrado', {
            description: 'El participante se ha registrado correctamente'
          });
          this.cargarParticipantes();
          this.cerrarModalRegistro();
        },
        error: (error) => {
          console.error('Error al registrar:', error);
          toast.error('Error al registrar', {
            description: error.error?.message || 'No se pudo registrar el participante'
          });
        }
      });
  }
}