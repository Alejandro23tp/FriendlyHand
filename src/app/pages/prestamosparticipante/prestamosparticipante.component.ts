import { SemanasService } from './../../services/semanas.service';
import { Component, HostListener, OnInit } from '@angular/core';
import { PrestamosService } from '../../services/prestamos.service';
import { ParticipantesService } from '../../services/participantes.service';
import { CommonModule, formatDate } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-prestamosparticipante',
  imports: [CommonModule, FormsModule],
  templateUrl: './prestamosparticipante.component.html',
  styleUrls: ['./prestamosparticipante.component.scss']
})
export class PrestamosparticipanteComponent implements OnInit {
  participantes: any[] = [];
  prestamos: any[] = [];
  semanasDeudoras: any[] = [];
  selectedParticipanteId: string = '';
  selectedParticipante: any = null;
  isLoading: boolean = false;
  errorMessage: string = '';
  fechaActual: string = '';
  showPagoPrestamoModal: boolean = false;
  showNuevoPrestamoModal: boolean = false;
  nuevoPrestamo: any = {};
  defaultInterest: number = 5;
  semanas: string[] = [];
  searchTerm: string = '';
  prestamosFiltrados: any[] = [];
  participantesFiltrados: any[] = [];
  showDropdown = false;
  allParticipantes: any[] = [];

  prestamoData = {
    part_id: '', // ID del participante
    semana: null,
    prestamo: '',
    interes: '',
    prestamofecha: formatDate(new Date(), 'yyyy-MM-dd', 'en-US'),
  };

  constructor(
    private prestamoService: PrestamosService,
    private participantesService: ParticipantesService,
    private semanasService: SemanasService
  ) {}

  @HostListener('document:click', ['$event'])
  onClickOutside(event: any) {
    if (!event.target.closest('.relative')) {
      this.showDropdown = false;
    }
  }

  ngOnInit(): void {
    this.fechaActual = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
    this.cargarParticipantes();
  }
  
  cargarParticipantes(): void {
    this.participantesService.listarParticipantes().subscribe({
      next: (response) => {
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
      this.participantesFiltrados = [...this.allParticipantes];
      this.searchTerm = '';
    }
  }

  onParticipanteSelect(participante: any): void {
    this.selectedParticipanteId = participante.id;
    this.searchTerm = participante.part_nombre;
    this.showDropdown = false;
    this.cargarPrestamos(participante.id);
  }


  cargarPrestamos(participanteId: string): void {
    this.isLoading = true;
    this.listarSemanas(participanteId);//pruebaaa
    this.prestamoService.getPrestamos_Participante(participanteId).subscribe({
      next: (response) => {
        this.prestamos = response.data.map((item: any) => ({
          id: item.id,
          semana: item.pp_semana,
          prestamo: item.pp_prestamo,
          interes: item.interes,
          fecha: item.fecha_pago,
          estado: item.estado
        }));
        this.prestamosFiltrados = [...this.prestamos]; // Inicializar el array filtrado con todos los datos
        this.selectedParticipante = this.participantes.find(p => p.id === participanteId);
        this.cargarSemanasDeudoras(participanteId); // Cargar semanas deudoras
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar préstamos:', error);
        this.errorMessage = 'No se pudieron cargar los préstamos del participante.';
        this.isLoading = false;
      }
    });
  }

  cargarSemanasDeudoras(participanteId: string): void {
    this.prestamoService.getPrestamos_Participante(participanteId).subscribe({
      next: (response) => {
        this.semanasDeudoras = response.data.filter((item: any) => item.estado !== 'Cancelado');
      },
      error: (error) => {
        console.error('Error al cargar semanas deudoras:', error);
        this.errorMessage = 'No se pudieron cargar las semanas deudoras.';
      }
    });
  }

  onParticipanteChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const participanteId = target.value;

    this.selectedParticipanteId = participanteId;
    if (participanteId) {
      this.cargarPrestamos(participanteId);
    } else {
      this.prestamos = [];
      this.selectedParticipante = null;
    }
  }

  abrirModalPagoPrestamo(): void {
    if (!this.selectedParticipanteId) {
      this.errorMessage = 'Por favor, seleccione un participante.';
      return;
    }
    
    this.prestamoService.getPrestamos_Participante(this.selectedParticipanteId).subscribe({
      next: (response) => {
        this.semanasDeudoras = response.data.filter((item: any) => item.estado !== 'Cancelado');
        this.showPagoPrestamoModal = true;
        this.nuevoPrestamo = {
          semana: '',
          valor: 0,
          fecha: this.fechaActual,
          observaciones: ''
        };
      },
      error: (error) => {
        console.error('Error al cargar semanas deudoras:', error);
        this.errorMessage = 'No se pudieron cargar las semanas deudoras.';
      }
    });
  }
  

  cerrarModalPagoPrestamo(): void {
    this.showPagoPrestamoModal = false;
  }
  //Registrar un pago de préstamo
  registrarPagoPrestamo(): void {
    if (!this.nuevoPrestamo.semana || this.nuevoPrestamo.valor <= 0) {
      this.errorMessage = 'Por favor, complete todos los campos correctamente.';
      return;
    }
  
    const nuevoPago = {
      part_id: this.selectedParticipanteId,
      semana: this.nuevoPrestamo.semana,
      valor: this.nuevoPrestamo.valor,
      fecha: this.nuevoPrestamo.fecha,
      observaciones: this.nuevoPrestamo.observaciones
    };
  
    this.prestamoService.registrarPagosPrestamo(nuevoPago).subscribe({
      next: (response) => {
        console.log('Pago registrado:', response);
        this.cerrarModalPagoPrestamo();
        this.cargarPrestamos(this.selectedParticipanteId);
      },
      error: (error) => {
        console.error('Error al registrar pago:', error);
        this.errorMessage = 'No se pudo registrar el pago.';
      }
    });
  }
  
  

  abrirModalNuevoPrestamo(): void {
    
    console.log('Método abrirModalNuevoPrestamo ejecutado', this.selectedParticipanteId);
    this.prestamoData.part_id = this.selectedParticipanteId; //agg
    this.showNuevoPrestamoModal = true;
    this.nuevoPrestamo = {
      part_id: this.selectedParticipanteId,
      semana: '',
      prestamo: '',
      interes: '',
      fecha: this.fechaActual,
      observaciones: 'Ninguna.'
    };
  }
  

  cerrarModalNuevoPrestamo(): void {
    this.showNuevoPrestamoModal = false;
  }

  listarSemanas(part_id: string) {
    this.semanasService.getSemanas_Participante(part_id).subscribe((Response) => {
      Response.data.forEach((item: any) => {
        this.semanas.push(item.nombre_semana);
      });
    });
  }
  
  calcularInteres() {
    const prestamo = parseFloat(this.prestamoData.prestamo);
    const interes = this.defaultInterest / 100;

    if (!isNaN(prestamo) && !isNaN(interes)) {
      this.prestamoData.interes = (prestamo * interes).toFixed(2);
    }
  }

  
  //Registrar un nuevo préstamo
  onSubmit(): void {
    if (this.validarDatosNuevoPrestamo()) {
      const nuevoPrestamo = {
        part_id: this.selectedParticipanteId, //agg
        semana: this.nuevoPrestamo.semana,
        prestamo: this.nuevoPrestamo.prestamo,
        interes: parseFloat(this.nuevoPrestamo.interes),
        estado: 'Pendiente',
        fecha: this.nuevoPrestamo.fecha,
        observaciones: this.nuevoPrestamo.observaciones
      };
  
      // Ajuste realizado: usar registrarPagoPrestamo en lugar de registrarPagosPrestamo
      this.prestamoService.registrarPrestamo(nuevoPrestamo).subscribe({
        next: (response) => {
          console.log('Nuevo préstamo registrado:', response);
          this.cerrarModalNuevoPrestamo();
          this.cargarPrestamos(this.selectedParticipanteId); // Recargar los préstamos del participante
        },
        error: (error) => {
          console.error('Error al registrar nuevo préstamo:', error);
          this.errorMessage = 'No se pudo registrar el nuevo préstamo.';
        }
      });
    }
  }
  

  validarDatosNuevoPrestamo(): boolean {
    if (!this.nuevoPrestamo.semana || !this.nuevoPrestamo.prestamo) {
      this.errorMessage = 'Por favor, complete todos los campos requeridos.';
      return false;
    }

    if (isNaN(parseFloat(this.nuevoPrestamo.prestamo)) || parseFloat(this.nuevoPrestamo.prestamo) <= 0) {
      this.errorMessage = 'El valor del préstamo debe ser un número positivo.';
      return false;
    }

    return true;
  }

}
