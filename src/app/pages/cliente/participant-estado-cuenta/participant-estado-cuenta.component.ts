import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

import { CommonModule } from '@angular/common';
import { ParticipantClienteService } from '../../../services/participant-cliente.service';

@Component({
  selector: 'app-participant-estado-cuenta',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './participant-estado-cuenta.component.html',
  styleUrl: './participant-estado-cuenta.component.scss'
})
export class ParticipantEstadoCuentaComponent implements OnInit {
  estadoCuenta: any = null;
  prestamosActivos: any[] = [];
  loading: boolean = false;
  error: string | null = null;

  constructor(
    private participantClienteService: ParticipantClienteService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarEstadoCuenta();
  }

  cargarEstadoCuenta(): void {
    this.loading = true;
    this.error = null;

    this.participantClienteService.getEstadoCuenta().subscribe({
      next: (response) => {
        this.estadoCuenta = response.data;
        this.prestamosActivos = response.data.prestamos_activos || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Error al cargar el estado de cuenta. Intenta de nuevo más tarde.';
        this.loading = false;
        this.cdr.detectChanges();
        console.error('Error al obtener el estado de cuenta:', err);
      }
    });
  }
}