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

  showPagosModal: boolean = false;
  semanaSeleccionada: string = '';
  pagos: any[] = [];
  pagosFiltrados: any[] = [];
  totalPagosSemana: number = 0;

  prestamoData = {
    part_id: '', // ID del participante
    semana: null,
    prestamo: '',
    interes: '',
    prestamofecha: formatDate(new Date(), 'yyyy-MM-dd', 'en-US'),
  };

  prestamoActual: any = null; // Nueva propiedad para almacenar el préstamo actual

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

  // Función de utilidad para extraer el número de semana
  private extraerNumeroSemana(semana: string): number {
    const numero = parseInt(semana.replace(/[^0-9]/g, ''));
    return isNaN(numero) ? 0 : numero;
  }

  // Función para ordenar préstamos por semana
  private ordenarPrestamosPorSemana(prestamos: any[]): any[] {
    return prestamos.sort((a, b) => {
      const semanaA = this.extraerNumeroSemana(a.semana);
      const semanaB = this.extraerNumeroSemana(b.semana);
      return semanaA - semanaB;
    });
  }

  cargarPrestamos(participanteId: string): void {
    this.isLoading = true;
    this.listarSemanas(participanteId);//pruebaaa
    this.prestamoService.getPrestamos_Participante(participanteId).subscribe({
      next: (response) => {
        // Mapear los datos
        const prestamosTemp = response.data.map((item: any) => ({
          id: item.id,
          semana: item.pp_semana,
          prestamo: item.pp_prestamo,
          interes: item.interes,
          fecha: item.fecha_pago,
          estado: item.estado
        }));

        // Ordenar los préstamos por semana
        this.prestamos = this.ordenarPrestamosPorSemana(prestamosTemp);
        this.prestamosFiltrados = [...this.prestamos];
        
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
          observaciones: 'Ninguna',
          prestamoId: '' // Añadimos este campo para almacenar el ID del préstamo
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
    this.limpiarCamposPagoPrestamo(); // Limpiar campos
  }
  //Registrar un pago de préstamo
  registrarPagoPrestamo(): void {
    console.log('Datos del nuevo prestamo:', this.nuevoPrestamo); // Log inicial

    if (!this.nuevoPrestamo.semana || this.nuevoPrestamo.valor <= 0) {
      this.errorMessage = 'Por favor, complete todos los campos correctamente.';
      return;
    }
  
    // Obtenemos el préstamo seleccionado de semanasDeudoras
    const prestamoSeleccionado = this.semanasDeudoras.find(
      p => p.id.toString() === this.nuevoPrestamo.semana.toString()
    );
  
    console.log('Semanas deudoras disponibles:', this.semanasDeudoras); // Log de semanas deudoras
    console.log('ID buscado:', this.nuevoPrestamo.semana); // Log del ID que estamos buscando
    console.log('Préstamo seleccionado:', prestamoSeleccionado); // Log del préstamo encontrado
  
    if (!prestamoSeleccionado) {
      console.error('No se encontró el préstamo con ID:', this.nuevoPrestamo.semana);
      this.errorMessage = 'Préstamo no encontrado.';
      return;
    }
  
    const nuevoPago = {
      part_id: prestamoSeleccionado.id, // Usamos el ID del préstamo
      semana: prestamoSeleccionado.pp_semana.replace('Semana ', ''),
      valor: this.nuevoPrestamo.valor,
      fecha: this.nuevoPrestamo.fecha,
      observaciones: this.nuevoPrestamo.observaciones
    };
  
    console.log('Datos del pago a registrar:', nuevoPago); // Log final
  
    this.prestamoService.registrarPagosPrestamo(nuevoPago).subscribe({
      next: (response) => {
        console.log('Respuesta del registro de pago:', response);
        this.cerrarModalPagoPrestamo();
        
        this.prestamoService.listarcuotapagosprestamos(this.selectedParticipanteId).subscribe({
          next: (pagosResponse) => {
            console.log('Respuesta de pagos:', pagosResponse);
            this.pagosFiltrados = pagosResponse.data.filter((pago: any) => 
              pago.semana === nuevoPago.semana
            );
            this.calcularTotalPagosSemana();
            this.cargarPrestamos(this.selectedParticipanteId);
          }
        });
      },
      error: (error) => {
        console.error('Error al registrar pago:', error);
        this.errorMessage = 'No se pudo registrar el pago.';
      }
    });
  }
  
  

  abrirModalNuevoPrestamo(): void {
    if (!this.selectedParticipanteId) {
      this.errorMessage = 'Por favor, seleccione un participante.';
      return;
    }

    this.prestamoData.part_id = this.selectedParticipanteId; // Asignar el ID del participante
    this.showNuevoPrestamoModal = true;
  }
  

  cerrarModalNuevoPrestamo(): void {
    this.showNuevoPrestamoModal = false;
    this.limpiarCamposNuevoPrestamo(); // Limpiar campos
  }

  listarSemanas(part_id: string) {
    this.semanas = [];
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
    if (!this.validarDatosNuevoPrestamo()) {
      return; // Detener si la validación falla
    }

    const nuevoPrestamo = {
      part_id: this.prestamoData.part_id, // Usar el ID del participante
      semana: this.prestamoData.semana,
      prestamo: parseFloat(this.prestamoData.prestamo),
      interes: parseFloat(this.prestamoData.interes),
      estado: 'Pendiente', // Estado por defecto
      fecha: this.prestamoData.prestamofecha,
    };

    this.prestamoService.registrarPrestamo(nuevoPrestamo).subscribe({
      next: (response) => {
       //   console.log('Nuevo préstamo registrado:', response);
        this.cerrarModalNuevoPrestamo();
        this.cargarPrestamos(this.selectedParticipanteId); // Recargar los préstamos del participante
      },
      error: (error) => {
       //   console.error('Error al registrar nuevo préstamo:', error);
        this.errorMessage = 'No se pudo registrar el nuevo préstamo.';
      }
    });
  }

  validarDatosNuevoPrestamo(): boolean {
    if (!this.prestamoData.semana || !this.prestamoData.prestamo || !this.prestamoData.interes) {
      this.errorMessage = 'Por favor, complete todos los campos requeridos.';
      return false;
    }

    if (isNaN(parseFloat(this.prestamoData.prestamo))) {
      this.errorMessage = 'El valor del préstamo debe ser un número válido.';
      return false;
    }

    if (isNaN(parseFloat(this.prestamoData.interes))) {
      this.errorMessage = 'El valor del interés debe ser un número válido.';
      return false;
    }

    return true;
  }

  limpiarCamposPagoPrestamo(): void {
    this.nuevoPrestamo = {
      semana: '',
      valor: 0,
      fecha: this.fechaActual,
      observaciones: ''
    };
  }

  limpiarCamposNuevoPrestamo(): void {
    this.prestamoData = {
      part_id: '', // ID del participante
      semana: null,
      prestamo: '',
      interes: '',
      prestamofecha: formatDate(new Date(), 'yyyy-MM-dd', 'en-US'),
    };
    this.defaultInterest = 5; // Restablecer el interés por defecto
  }

  // Método para abrir el modal y listar los pagos
  abrirModalPagos(prestpart_id: string, semana: string): void {
    console.log('=== Abriendo Modal de Historial de Pagos ===');
    console.log('ID Participante:', prestpart_id);
    console.log('Semana completa:', semana);
    
    const numeroSemana = semana.replace(/[^0-9]/g, '');
    this.semanaSeleccionada = numeroSemana;
    console.log('Número de semana extraído:', numeroSemana);
  
    // Obtener el préstamo actual y guardarlo
    this.prestamoActual = this.prestamos.find(p => p.semana === semana);
    console.log('Préstamo encontrado:', this.prestamoActual);
  
    this.prestamoService.listarcuotapagosprestamos(prestpart_id).subscribe({
      next: (response) => {
        console.log('Respuesta del servicio:', response);
        
        // Filtrar los pagos por semana
        this.pagosFiltrados = response.data.filter((pago: any) => {
          console.log('Comparando pago semana:', pago.semana, 'con numero semana:', numeroSemana);
          return pago.semana === numeroSemana;
        });
        
        console.log('Pagos filtrados para la semana:', this.pagosFiltrados);
        this.calcularTotalPagosSemana();
        this.showPagosModal = true;
      },
      error: (error) => {
        console.error('Error al cargar historial de pagos:', error);
        this.errorMessage = 'No se pudo cargar el historial de pagos.';
      }
    });
  }
  
  // Método para cerrar el modal
  cerrarModalPagos(): void {
    this.showPagosModal = false;
    this.pagosFiltrados = [];
    this.semanaSeleccionada = '';
    this.totalPagosSemana = 0;
    this.prestamoActual = null;
  }

  calcularTotalPagosSemana(): void {
    this.totalPagosSemana = this.pagosFiltrados.reduce((total, pago) => {
      return total + parseFloat(pago.valor);
    }, 0);

    console.log('=== Resumen de Pagos ===');
    console.log('Semana:', this.semanaSeleccionada);
    console.log('Total de pagos:', this.totalPagosSemana);
    console.log('Cantidad de pagos:', this.pagosFiltrados.length);
    
    this.verificarCancelacionPrestamo();
  }

  verificarCancelacionPrestamo(): void {
    if (!this.prestamoActual) return;
    
    const totalPrestamo = parseFloat(this.prestamoActual.prestamo) + parseFloat(this.prestamoActual.interes);
    console.log('Total del préstamo (préstamo + interés):', totalPrestamo);
    console.log('Total pagado:', this.totalPagosSemana);
      console.log('Semana a verificar:', this.prestamoActual.semana);

    if (this.totalPagosSemana >= totalPrestamo && this.prestamoActual.estado !== 'Cancelado') {
       console.log('El préstamo ha sido completamente pagado, actualizando estado...');
      this.prestamoService.cancelarPrestamo(this.selectedParticipanteId, this.prestamoActual.semana)
        .subscribe({
          next: (response) => {
             console.log('Préstamo marcado como cancelado:', response);
            this.cargarPrestamos(this.selectedParticipanteId); // Recargar los préstamos
          },
          error: (error) => {
           console.error('Error al cancelar el préstamo:', error);
          }
        });
    }
  }
}