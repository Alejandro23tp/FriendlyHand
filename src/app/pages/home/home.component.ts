import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ParticipantesService } from '../../services/participantes.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';


interface DashboardStats {
  total_participantes: number;
  total_prestamos: number;
  total_pagos: string;
  prestamos_pendientes: number;
}

interface Transaccion {
  id: number;
  created_at: string;
  monto: string;
  participante: string;
}

interface Deudor {
  id: number;
  nombre: string;
  monto_total: number;
  monto_pagado: number;
  monto_restante: number;
}

interface Interes {
  id: number;
  nombre: string;
  prestamo: number;
  interes: string;
  mes_de_pago: string;
  total_interes: string;
  interes_por_accion: string;
}


@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export default class HomeComponent implements OnInit {
  greeting: string = '';
  loading: boolean = false;
  error: string | null = null;
  stats!: DashboardStats;
  ultimasTransacciones: Transaccion[] = [];
  deudores: Deudor[] = [];
  intereses: any[] = [{ total_interes: 0, interes_por_accion: 0 }]; // Inicializar con valores por defecto
  userData: any = null;
  private completedRequests = 0;
  private totalRequests = 4; // Total de peticiones que hacemos (stats, transacciones, deudores, intereses)

  constructor(
    private participantesService: ParticipantesService,
    private cdr: ChangeDetectorRef
  ) {
    this.loadUserData();
    this.setGreeting();
  }

  ngOnInit() {
    this.loadAllData();
  }

  private loadUserData() {
    // 1. Primero intentamos cargar como participante
    const participantDataString = localStorage.getItem('participant_data');
    
    if (participantDataString) {
      try {
        const participantData = JSON.parse(participantDataString);
        console.log('Datos del participante:', participantData);
        // Transformamos los datos del participante al formato del admin
        this.userData = {
          id: participantData.id,
          usr_usuario: participantData.username || 'Participante',
          usr_correo: participantData.email || '',
          created_at: new Date().toISOString(), // O usar fecha real si está disponible
          updated_at: new Date().toISOString(),
          // Campos adicionales específicos del participante si los necesitas
          participante_cedula: participantData.participante.cedula,
          participante_cupos: participantData.participante.cupos
        };
        return;
      } catch (e) {
        console.error('Error al parsear datos de participante:', e);
      }
    }
  
    // 2. Si no es participante, cargamos como admin (sin cambios)
    const adminDataString = localStorage.getItem('userData');
    console.log('Datos del admin:', adminDataString);
    if (adminDataString) {
      try {
        this.userData = JSON.parse(adminDataString);
      } catch (e) {
        console.error('Error al parsear datos de admin:', e);
      }
    }
  }

  private setGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) this.greeting = '¡Buenos días';
    else if (hour < 18) this.greeting = '¡Buenas tardes';
    else this.greeting = '¡Buenas noches';
  }

  private loadAllData() {
    this.loading = true;
    this.error = null;
    this.completedRequests = 0;
    this.cdr.detectChanges(); // Forzar detección de cambios inicial

    this.participantesService.obtenerDashboardStats().subscribe({
      next: (response) => {
        if (response?.data) {
          this.stats = response.data;
        }
        this.checkAllRequestsComplete();
      },
      error: this.handleError.bind(this)
    });

    this.participantesService.obtenerUltimasTransacciones().subscribe({
      next: (response) => {
        if (response?.data) {
          this.ultimasTransacciones = response.data;
        }
        this.checkAllRequestsComplete();
      },
      error: this.handleError.bind(this)
    });

    this.participantesService.obtenerParticipantesDeudores().subscribe({
      next: (response) => {
        if (response?.data) {
          this.deudores = response.data;
        }
        this.checkAllRequestsComplete();
      },
      error: this.handleError.bind(this)
    });

    this.participantesService.obtenerIntereses().subscribe({
      next: (response) => {
        if (response?.data) {
          this.intereses = response.data;
        }
        this.checkAllRequestsComplete();
      },
      error: this.handleError.bind(this)
    });
  }

  private checkAllRequestsComplete() {
    this.completedRequests++;
    if (this.completedRequests === this.totalRequests) {
      this.loading = false;
      this.cdr.detectChanges(); // Forzar detección de cambios
    }
  }

  private handleError(error: any) {
    console.error('Error:', error);
    this.error = 'Error al cargar los datos';
    this.checkAllRequestsComplete();
  }

  // Agregar método para traducir mes
  translateMonth(month: string | undefined): string {
    if (!month) return '';
    
    const months: { [key: string]: string } = {
      'January': 'Enero',
      'February': 'Febrero',
      'March': 'Marzo',
      'April': 'Abril',
      'May': 'Mayo',
      'June': 'Junio',
      'July': 'Julio',
      'August': 'Agosto',
      'September': 'Septiembre',
      'October': 'Octubre',
      'November': 'Noviembre',
      'December': 'Diciembre'
    };

    const mesLimpio = month.trim();
    return months[mesLimpio] || mesLimpio;
  }
}
