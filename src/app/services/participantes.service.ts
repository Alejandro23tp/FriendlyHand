import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { LoadingService } from './loading.service';

interface CedulaVerificationResponse {
  success: boolean;
  nombre: string;
  existe_en_sistema: boolean;
  tiene_cuenta: boolean;
  participante: any;
}

@Injectable({
  providedIn: 'root'
})
export class ParticipantesService {
  private environment = environment.apibank

  constructor(
    private http: HttpClient,
    private loadingService: LoadingService
  ) { }

  listarParticipantes() {
    const url = `${this.environment}listarParticipantes`;
    return this.http.get<any>(url);
  }

  registrarParticipante(participante: any) {    
    const url = `${this.environment}participantes/mutate`;
    return this.http.post(url, {
      mutate: [
        {
          operation: 'create',
          attributes: {
            part_nombre: participante.nombre,
            part_cedula: participante.cedula,
            part_telefono: participante.telefono,
            part_cupos: participante.cupo
          },
        },
      ],
    });
  }

  verificarCedula(cedula: string) {
    return this.http.post<CedulaVerificationResponse>(`${this.environment}verificar-cedula`, {
      cedula: cedula
    });
  }

  actualizarParticipante(participante: any) {    
    const url = `${this.environment}participantes/mutate`; 
    return this.http.post(url, {
      mutate: [
        {
          operation: 'update',
          key : participante.id,
          attributes: {
            part_nombre: participante.nombre,
            part_cedula: participante.cedula,
            part_telefono: participante.telefono,
            part_cupos: participante.cupo
          },
        },
      ],
    });
  }

  obtenerCuposParticipante(part_id: string) {
    const url = `${this.environment}obtenerCupoParticipante/${part_id}`;
    return this.http.get<any>(url);
  }
  
  private selectedParticipanteId: string = '';

  generarPdfParticipantes() {
    let url = `generarPdfParticipantes`;
    return this.http.get<any>(this.environment + url, { responseType: 'blob' as 'json' });
  }

  setSelectedParticipanteId(id: string) {
    this.selectedParticipanteId = id;
  }

  getSelectedParticipanteId(): string {
    return this.selectedParticipanteId;
  }


  obtenerDashboardStats() {
    const url = `${this.environment}dashboard/stats`;
    return this.http.get<any>(url);
  }

  obtenerUltimasTransacciones() {
    const url = `${this.environment}dashboard/transacciones`;
    return this.http.get<any>(url);
  }

  obtenerParticipantesDeudores() {
    this.loadingService.show();
    const url = `${this.environment}dashboard/deudores`;
    return this.http.get<any>(url).pipe(
      finalize(() => this.loadingService.hide())
    );
  }

  obtenerIntereses() {
    const url = `${this.environment}dashboard/intereses`;
    return this.http.get<any>(url);
  }
}
