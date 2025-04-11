import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { InactivityService } from './inactivity.service';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

export interface ParticipanteLoginRequest {
  login: string; // Puede ser email o username
  password: string;
}

export interface ParticipanteLoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: number;
    email: string;
    username: string;
    participante: {
      id: number;
      part_nombre: string;
      part_cedula: string;
      // Agrega más campos según necesites
    };
  };
}

export interface ParticipanteUser {
  id: number;
  email: string;
  username: string;
  participante: {
    id: number;
    part_nombre: string;
    part_cedula: string;
    // Agrega más campos según necesites
  };
}

@Injectable({
  providedIn: 'root'
})
export class ParticipantLoginService {
  private apiUrl = environment.apibank;
  private currentParticipantSubject = new BehaviorSubject<ParticipanteUser | null>(null);
  public currentParticipant$ = this.currentParticipantSubject.asObservable();

  constructor(
    private http: HttpClient,
    private inactivityService: InactivityService,
    private router: Router
  ) {
    this.checkToken();
  }

  /**
   * Login para participantes
   * @param credentials Puede usar email o username en el campo 'login'
   */
  login(credentials: ParticipanteLoginRequest): Observable<ParticipanteLoginResponse> {
    return this.http.post<ParticipanteLoginResponse>(
      `${this.apiUrl}auth/participante/login`, 
      credentials
    ).pipe(
      tap(response => {
        this.handleLoginResponse(response);
      })
    );
  }

  /**
   * Registro para nuevos participantes
   */
  register(participanteData: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}auth/participante/register`,
      participanteData
    );
  }

  logout(): void {
    const shouldRemember = localStorage.getItem('remembered_participant') !== null;
    const rememberedParticipant = localStorage.getItem('remembered_participant');
    
    // Limpiar datos de participante
    localStorage.removeItem('participant_jwt_token');
    localStorage.removeItem('participant_data');
    this.currentParticipantSubject.next(null);

    // Restaurar participante recordado si existe
    if (shouldRemember && rememberedParticipant) {
      localStorage.setItem('remembered_participant', rememberedParticipant);
    }

    this.router.navigate(['/login']);

    // Intentar logout en el servidor si hay token
    const token = this.getToken();
    if (token) {
      this.http.post(`${this.apiUrl}auth/participante/logout`, {}, {
        headers: this.getAuthHeaders()
      }).subscribe({
        error: () => {
          console.log('Error en logout pero sesión ya cerrada localmente');
        }
      });
    }
  }

  refreshToken(): Observable<ParticipanteLoginResponse> {
    return this.http.post<ParticipanteLoginResponse>(
      `${this.apiUrl}auth/participante/refresh`, 
      {}, 
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(response => {
        this.handleLoginResponse(response);
      })
    );
  }

  checkToken() {
    const token = this.getToken();
    if (token) {
      this.getParticipantProfile().subscribe();
    }
  }

  getParticipantProfile(): Observable<ParticipanteUser> {
    return this.http.get<ParticipanteUser>(
      `${this.apiUrl}auth/participante/me`,
      { headers: this.getAuthHeaders() }
    ).pipe(
      tap(participant => this.currentParticipantSubject.next(participant))
    );
  }

  getToken(): string | null {
    return localStorage.getItem('participant_jwt_token');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
  
    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const expirationDate = new Date(tokenData.exp * 1000);
      return expirationDate > new Date(); // Solo devuelve true si el token está vigente
    } catch {
      return false;
    }
  }
  

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getParticipantId(): number | null {
    const currentParticipant = this.currentParticipantSubject.getValue();
    return currentParticipant?.participante?.id || null;
  }

  // Métodos privados
  private handleLoginResponse(response: ParticipanteLoginResponse): void {
    if (response.access_token) {
      localStorage.setItem('participant_jwt_token', response.access_token);
      localStorage.setItem('participant_data', JSON.stringify(response.user));
      this.currentParticipantSubject.next(response.user);
      this.inactivityService.setupInactivityTimer();
    }
  }
}
