import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ParticipantClienteService {
  private apiUrl = environment.apibank;

  constructor(private http: HttpClient) {}

  // Endpoint para semanas
  getSemanas(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}participante/semanas`);
  }

  // Endpoint para perfil
  getPerfil(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}participante/perfil`);
  }

  // Endpoint para pagos
  getPagos(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}participante/pagos`);
  }

  // Endpoint para préstamos
  getPrestamos(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}participante/prestamos`);
  }

  // Endpoint para estado de cuenta
  getEstadoCuenta(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}participante/estado-cuenta`);
  }
}
