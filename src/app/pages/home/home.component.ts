import { Component } from '@angular/core';
import { ParticipantesService } from '../../services/participantes.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export default class HomeComponent {
  greeting: string = '';
  loading: boolean = false;
  error: string | null = null;
  stats = {
    participantes: 0,
    prestamosActivos: 0
  };
  userData: any = null;

  constructor(private participantesService: ParticipantesService) {
    this.loadUserData();
    this.setGreeting();
  }

  ngOnInit() {
    this.loadStats();
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

  private loadStats() {
    this.loading = true;
    this.error = null;

    // Cargar participantes
    this.participantesService.listarParticipantes().subscribe({
      next: (response) => {
        if (response?.data) {
          this.stats.participantes = response.data.length;
        }
      },
      error: (error) => {
        console.error('Error:', error);
        this.error = 'Error al cargar los datos';
        this.loading = false;
      }
    });

    // Cargar préstamos activos
    this.participantesService.obtenerPrestamosActivos().subscribe({
      next: (response) => {
        if (response?.data) {
          this.stats.prestamosActivos = response.data.length;
        }
      },
      error: (error) => {
        console.error('Error:', error);
        this.error = 'Error al cargar los datos';
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}
