import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxSonnerToaster } from 'ngx-sonner';
import { InactivityDialogComponent } from './components/inactivity-dialog/inactivity-dialog.component';
import { InactivityService } from './services/inactivity.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgxSonnerToaster, InactivityDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <router-outlet></router-outlet>
    <ngx-sonner-toaster theme="dark" richColors />
    <app-inactivity-dialog></app-inactivity-dialog>
  `
})
export class AppComponent implements OnInit {
  constructor(private inactivityService: InactivityService) {}

  ngOnInit() {
    // Iniciar el timer de inactividad después de un login exitoso
    if (localStorage.getItem('jwt_token')) {
      this.inactivityService.setupInactivityTimer();
    }
  }
}
