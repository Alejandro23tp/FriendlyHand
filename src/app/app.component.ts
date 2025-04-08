import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxSonnerToaster } from 'ngx-sonner';
import { CommonModule } from '@angular/common';
import { LoadingService } from './services/loading.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgxSonnerToaster, CommonModule],
  template: `
    <div class="relative">
      <router-outlet></router-outlet>
      <ngx-sonner-toaster theme="dark" richColors />
      
      <!-- Global Loading -->
      <div *ngIf="loadingService.loading$ | async" 
           class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    </div>
  `
})
export class AppComponent {
  constructor(public loadingService: LoadingService) {}
}
