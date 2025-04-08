import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InactivityService } from '../../services/inactivity.service';

@Component({
  selector: 'app-inactivity-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="inactivityService.showWarningDialog$ | async"
         class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-black-color-900 rounded-xl p-6 max-w-sm mx-4 border border-white/10">
        <h2 class="text-xl font-bold mb-4 text-white">¿Sigues ahí?</h2>
        <p class="mb-6 text-primary-200">Tu sesión está a punto de expirar por inactividad.</p>
        <div class="flex justify-end gap-4">
          <button (click)="logout()"
                  class="px-4 py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors">
            Cerrar sesión
          </button>
          <button (click)="extendSession()"
                  class="px-4 py-2 bg-primary-500/20 text-primary-500 rounded-lg hover:bg-primary-500/30 transition-colors">
            Continuar
          </button>
        </div>
      </div>
    </div>
  `
})
export class InactivityDialogComponent {
  constructor(public inactivityService: InactivityService) {}

  extendSession() {
    this.inactivityService.extendSession();
  }

  logout() {
    this.inactivityService.stopTimers();
    this.inactivityService.endSession();
  }
}
