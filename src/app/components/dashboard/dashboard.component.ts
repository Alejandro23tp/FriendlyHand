import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
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
  mes_de_pago: string;
  total_interes: string;
  interes_por_accion: string;
  interes: number;
  prestamo: number;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  @Input() greeting: string = '';
  @Input() loading: boolean = false;
  @Input() error: string | null = null;
  @Input() stats!: DashboardStats;
  @Input() ultimasTransacciones: Transaccion[] = [];
  @Input() deudores: Deudor[] = [];
  @Input() intereses: Interes[] = [{
    total_interes: '0', interes_por_accion: '0',
    id: 0,
    nombre: '',
    mes_de_pago: '',
    interes: 0,
    prestamo: 0
  }];
  @Input() userData: any = null;

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
