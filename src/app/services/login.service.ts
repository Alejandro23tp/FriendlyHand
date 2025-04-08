import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginRequest, LoginResponse, User } from '../interfaces/auth.interface';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private apiUrl = environment.apibank;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.checkToken();
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}auth/login`, credentials)
      .pipe(
        tap(response => {
          localStorage.setItem('jwt_token', response.access_token);
          this.currentUserSubject.next(response.user);
        })
      );
  }

  logout(): void {
    const token = this.getToken();
    // Limpiar datos locales primero
    localStorage.clear();
    this.currentUserSubject.next(null);

    // Solo intentar logout en el servidor si hay un token válido
    if (token && this.isAuthenticated()) {
      this.http.post(`${this.apiUrl}/auth/logout`, {}).subscribe({
        error: () => {
          console.log('Error en logout pero sesión ya cerrada localmente');
        }
      });
    }
  }

  refreshToken(): Observable<LoginResponse> {
    const token = this.getToken();
    return this.http.post<LoginResponse>(`${this.apiUrl}auth/refresh`, {}, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    }).pipe(
      tap(response => {
        if (response.access_token) {
          localStorage.setItem('jwt_token', response.access_token);
          this.currentUserSubject.next(response.user);
        }
      })
    );
  }

  checkToken() {
    const token = this.getToken();
    if (token) {
      this.getUserProfile().subscribe();
    }
  }

  getUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}auth/me`)
      .pipe(
        tap(user => this.currentUserSubject.next(user))
      );
  }

  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      // Verificar si el token está expirado
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const expirationDate = new Date(tokenData.exp * 1000);
      if (expirationDate < new Date()) {
        this.logout();
        return false;
      }
      return true;
    } catch {
      this.logout();
      return false;
    }
  }

  // Método auxiliar para obtener headers con el token
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getUserId(): string {
    const currentUser = this.currentUserSubject.getValue();
    return currentUser ? currentUser.usr_usuario : '';
  }
}
