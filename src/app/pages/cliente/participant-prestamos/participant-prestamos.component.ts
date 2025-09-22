import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParticipantClienteService } from '../../../services/participant-cliente.service';

@Component({
  selector: 'app-participant-prestamos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './participant-prestamos.component.html',
  styleUrl: './participant-prestamos.component.scss'
})
export class ParticipantPrestamosComponent implements OnInit {
  prestamos: any[] = [];
  pagos: any[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private participantService: ParticipantClienteService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.error = null;

    // Contador para rastrear las solicitudes completadas
    let completedRequests = 0;
    const totalRequests = 2;

    const checkLoadingComplete = () => {
      completedRequests++;
      if (completedRequests === totalRequests) {
        this.loading = false;
        this.cdr.detectChanges(); // Forzar la detección de cambios
      }
    };

    // Cargar préstamos
    this.participantService.getPrestamos().subscribe({
      next: (response) => {
        this.prestamos = response.data || [];
        checkLoadingComplete();
      },
      error: (err) => {
        this.error = 'Error al cargar los préstamos';
        console.error(err);
        checkLoadingComplete();
      }
    });

    // Cargar pagos
    this.participantService.getPagos().subscribe({
      next: (response) => {
        this.pagos = response.data || [];
        checkLoadingComplete();
      },
      error: (err) => {
        this.error = 'Error al cargar los pagos';
        console.error(err);
        checkLoadingComplete();
      }
    });
  }
}