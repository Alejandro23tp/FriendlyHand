import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ParticipantesService } from '../../../services/participantes.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardComponent } from '../../../components/dashboard/dashboard.component';

@Component({
  selector: 'app-participant-home',
  imports: [CommonModule, RouterModule, DashboardComponent],
  templateUrl: './participant-home.component.html',
  styleUrls: ['./participant-home.component.scss']
})
export class ParticipantHomeComponent implements OnInit {
  greeting: string = ''; // Saludo dinámico basado en la hora
  loading: boolean = false; // Estado de carga
  error: string | null = null; // Errores en las solicitudes
  stats: any = {}; // Estadísticas del dashboard
  ultimasTransacciones: any[] = []; // Transacciones recientes
  deudores: any[] = []; // Lista de deudores
  intereses: any[] = [{ total_interes: '0', interes_por_accion: '0' }]; // Intereses iniciales
  userData: any = null; // Datos del usuario (admin o participante)

  constructor(
    private participantesService: ParticipantesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.setGreeting();
    this.loadAllData();
  }

  private loadUserData(): void {
    const participantDataString = localStorage.getItem('participant_data');
    if (participantDataString) {
      try {
        const participantData = JSON.parse(participantDataString);
        this.userData = {
          id: participantData.id,
          usr_usuario: participantData.username || 'Participante',
          usr_correo: participantData.email || '',
          participante_cedula: participantData.participante?.cedula,
          participante_cupos: participantData.participante?.cupos
        };
      } catch (e) {
        console.error('Error al parsear datos de participante:', e);
      }
    } else {
      const adminDataString = localStorage.getItem('userData');
      if (adminDataString) {
        try {
          this.userData = JSON.parse(adminDataString);
        } catch (e) {
          console.error('Error al parsear datos de admin:', e);
        }
      }
    }
  }

  private setGreeting(): void {
    const hour = new Date().getHours();
    if (hour < 12) this.greeting = '¡Buenos días';
    else if (hour < 18) this.greeting = '¡Buenas tardes';
    else this.greeting = '¡Buenas noches';
  }

  private loadAllData(): void {
    this.loading = true;
    this.error = null;

    this.participantesService.obtenerDashboardStats().subscribe({
      next: (response) => {
        this.stats = response?.data || {};
        this.checkAllRequestsComplete();
      },
      error: this.handleError.bind(this)
    });

    this.participantesService.obtenerUltimasTransacciones().subscribe({
      next: (response) => {
        this.ultimasTransacciones = response?.data || [];
        this.checkAllRequestsComplete();
      },
      error: this.handleError.bind(this)
    });

    this.participantesService.obtenerParticipantesDeudores().subscribe({
      next: (response) => {
        this.deudores = response?.data || [];
        this.checkAllRequestsComplete();
      },
      error: this.handleError.bind(this)
    });

    this.participantesService.obtenerIntereses().subscribe({
      next: (response) => {
        this.intereses = response?.data || [];
        console.log('Intereses PRUEBA:', this.intereses); // Debug log
        this.checkAllRequestsComplete();
      },
      error: this.handleError.bind(this)
    });
  }

  private checkAllRequestsComplete(): void {
    if (this.stats && this.ultimasTransacciones && this.deudores && this.intereses) {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  private handleError(error: any): void {
    console.error('Error:', error);
    this.error = 'Error al cargar los datos';
    this.loading = false;
    this.cdr.detectChanges();
  }
}
