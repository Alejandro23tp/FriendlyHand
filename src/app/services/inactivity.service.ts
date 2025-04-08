import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InactivityService {
  private readonly WARNING_TIME = 50000; // 50 segundos antes de mostrar advertencia
  private warningTimer: any;
  private autoLogoutTimer: any;
  private showWarningDialog = new BehaviorSubject<boolean>(false);
  private router = inject(Router);
  private eventListeners: { event: string; listener: () => void }[] = [];
  private isSessionActive = false;

  showWarningDialog$ = this.showWarningDialog.asObservable();

  setupInactivityTimer() {
    this.isSessionActive = true;
    this.removeEventListeners();
    this.startTimer();
    this.setupEventListeners();
  }

  private startTimer() {
    this.clearTimers();
    
    this.warningTimer = setTimeout(() => {
      console.log('Warning dialog shown');
      this.showWarningDialog.next(true);
      
      this.autoLogoutTimer = setTimeout(() => {
        console.log('Session ended');
        this.endSession();
      }, 10000); // 10 segundos para cerrar sesión después de la advertencia
    }, this.WARNING_TIME);
  }

  private setupEventListeners() {
    ['mousedown', 'keydown', 'mousemove'].forEach(event => {
      const listener = () => {
        if (!this.showWarningDialog.value && this.isSessionActive) {
          this.startTimer();
        }
      };
      document.addEventListener(event, listener);
      this.eventListeners.push({ event, listener });
    });
  }

  private removeEventListeners() {
    this.eventListeners.forEach(({ event, listener }) => {
      document.removeEventListener(event, listener);
    });
    this.eventListeners = [];
  }

  private clearTimers() {
    clearTimeout(this.warningTimer);
    clearTimeout(this.autoLogoutTimer);
    this.showWarningDialog.next(false);
  }

  stopTimers() {
    clearTimeout(this.warningTimer);
    clearTimeout(this.autoLogoutTimer);
    this.showWarningDialog.next(false);
  }

  extendSession() {
    this.clearTimers();
    this.startTimer();
  }

  endSession() {
    this.isSessionActive = false;
    this.removeEventListeners();
    this.stopTimers();
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
