import { ChangeDetectorRef, Component } from '@angular/core';
import { ParticipantClienteService } from '../../../services/participant-cliente.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Semana {
  id: number;
  nombre_semana: string;
  part_id: number;
  fecha_pago: string;
  valor: number;
  responsable: string;
  inicioSemana: string;
  created_at: string;
  updated_at: string;
}

interface SemanasResponse {
  mensaje: string;
  cant: number;
  data: Semana[];
}

@Component({
  selector: 'app-participant-semanas',
  imports: [CommonModule, FormsModule],
  templateUrl: './participant-semanas.component.html',
  styleUrl: './participant-semanas.component.scss'
})
export class ParticipantSemanasComponent {
  semanas: Semana[] = [];
  loading: boolean = true;
  error: string | null = null;
  semanasFiltradas: Semana[] = [];
  searchTerm: string = '' // Initialize searchTerm to an empty string;
 

  constructor(private participantService: ParticipantClienteService,
    private cdr: ChangeDetectorRef // Inject ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSemanas();
  }

  loadSemanas(): void {
    console.log('Starting to load semanas...'); // Debug log
    this.loading = true;
    this.error = null;
    this.participantService.getSemanas().subscribe({
      next: (response: SemanasResponse) => {
        console.log('Semanas loaded:', response); // Debug log
        this.semanas = response.data;
        this.semanasFiltradas = [...this.semanas]; // Initialize filtered array
        this.loading = false;
        this.cdr.detectChanges(); // Force change detection
        console.log('Loading set to false, semanas:', this.semanas); // Debug log
      },
      error: (err) => {
        console.error('Error fetching semanas:', err); // Debug log
        this.error = 'Error al cargar las semanas. Intenta de nuevo más tarde.';
        this.loading = false;
        this.cdr.detectChanges(); // Force change detection
      },
      complete: () => {
        console.log('Request completed'); // Debug log
      }
    });
  }

  aplicarFiltros(): void {
    if (this.searchTerm) {
      const termLower = this.searchTerm.toLowerCase();
      this.semanasFiltradas = this.semanas.filter(semana => 
        semana.nombre_semana.toLowerCase().includes(termLower) ||
        semana.responsable.toLowerCase().includes(termLower)
      );
    } else {
      this.semanasFiltradas = [...this.semanas];
    }
  }

  calcularTotal(): number {
    return this.semanasFiltradas.reduce((total, semana) => total + semana.valor, 0);
  }
}
