import { Component } from '@angular/core';
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
export default class HomeComponent {
  greeting: string = '';
  loading: boolean = false;
  error: string | null = null;
  stats!: DashboardStats;
  ultimasTransacciones: Transaccion[] = [];
  deudores: Deudor[] = [];
  intereses: Interes[] = [];
  userData: any = null;

  constructor(private participantesService: ParticipantesService) {
    this.loadUserData();
    this.setGreeting();
  }

  ngOnInit() {
    this.loadAllData();
  }

  private loadUserData() {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      this.userData = JSON.parse(userDataString);
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

    // Cargar estadísticas del dashboard
    this.participantesService.obtenerDashboardStats().subscribe({
      next: (response) => {
        if (response?.data) {
          this.stats = response.data;
        }
      },
      error: this.handleError.bind(this)
    });

    // Cargar últimas transacciones
    this.participantesService.obtenerUltimasTransacciones().subscribe({
      next: (response) => {
        if (response?.data) {
          this.ultimasTransacciones = response.data;
        }
      },
      error: this.handleError.bind(this)
    });

    // Cargar deudores
    this.participantesService.obtenerParticipantesDeudores().subscribe({
      next: (response) => {
        if (response?.data) {
          this.deudores = response.data;
        }
      },
      error: this.handleError.bind(this)
    });

    // Cargar intereses
    this.participantesService.obtenerIntereses().subscribe({
      next: (response) => {
        if (response?.data) {
          this.intereses = response.data;
        }
      },
      error: this.handleError.bind(this),
      complete: () => {
        this.loading = false;
      }
    });
  }

  private handleError(error: any) {
    console.error('Error:', error);
    this.error = 'Error al cargar los datos';
    this.loading = false;
  }

  // Agregar método para traducir mes
  translateMonth(month: string): string {
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
    
    return months[month.trim()] || month;
  }
}
