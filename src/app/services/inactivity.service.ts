import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root'
})
export class InactivityService {
  private readonly INACTIVITY_TIME = 5 * 60 * 1000; // 5 minutos
  private readonly WARNING_TIME = 4 * 60 * 1000; // 4 minutos
  private inactivityTimer: any;
  private warningTimer: any;
  private autoLogoutTimer: any;
  private showWarningDialog = new BehaviorSubject<boolean>(false);
  showWarningDialog$ = this.showWarningDialog.asObservable();

  constructor(
    private router: Router,
    private loginService: LoginService
  ) {}

  setupInactivityTimer() {
    this.resetTimers();
    this.setupEventListeners();
  }

  private setupEventListeners() {
    ['mousedown', 'keydown', 'touchstart', 'mousemove'].forEach(event => {
      document.addEventListener(event, () => this.resetTimers());
    });
  }

  private resetTimers() {
    // No reiniciar timers si el diálogo está visible
    if (this.showWarningDialog.value) {
      return;
    }

    this.clearAllTimers();

    this.warningTimer = setTimeout(() => {
      this.showWarningDialog.next(true);
      
      // Solo configurar el auto-logout cuando se muestra la advertencia
      this.autoLogoutTimer = setTimeout(() => {
        this.clearAllTimers();
        this.endSession();
      }, 60000); // 1 minuto
      
    }, this.WARNING_TIME);

    this.inactivityTimer = setTimeout(() => {
      this.endSession();
    }, this.INACTIVITY_TIME);
  }

  private clearAllTimers() {
    clearTimeout(this.inactivityTimer);
    clearTimeout(this.warningTimer);
    clearTimeout(this.autoLogoutTimer);
    this.showWarningDialog.next(false);
  }

  extendSession() {
    this.loginService.refreshToken().subscribe({
      next: (response) => {
        if (response.access_token) {
          this.showWarningDialog.next(false);
          this.resetTimers();
        } else {
          this.endSession();
        }
      },
      error: (error) => {
        console.error('Error refreshing token:', error);
        this.endSession();
      }
    });
  }

  stopTimers() {
    this.clearAllTimers();
  }

  endSession() {
    this.clearAllTimers();
    this.loginService.logout();
    this.router.navigate(['/login']);
  }
}
