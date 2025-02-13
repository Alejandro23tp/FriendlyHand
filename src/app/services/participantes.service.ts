import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ParticipantesService {
  private environment = environment.apibank

  constructor(
    private http: HttpClient
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
            part_telefono: participante.telefono,
            part_cupos: participante.cupo
          },
        },
      ],
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
    const url = `${this.environment}dashboard/deudores`;
    return this.http.get<any>(url);
  }

  obtenerIntereses() {
    const url = `${this.environment}dashboard/intereses`;
    return this.http.get<any>(url);
  }
}
