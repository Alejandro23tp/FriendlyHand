import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { InactivityDialogComponent } from './components/inactivity-dialog/inactivity-dialog.component';
import { InactivityService } from './services/inactivity.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, InactivityDialogComponent],
  template: `
    <router-outlet></router-outlet>
    <app-inactivity-dialog></app-inactivity-dialog>
  `
})
export class AppComponent implements OnInit {
  constructor(private inactivityService: InactivityService) {}

  ngOnInit() {
    this.inactivityService.setupInactivityTimer();
  }
}
