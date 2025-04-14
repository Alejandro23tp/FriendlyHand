// layout.component.ts
import { Component } from '@angular/core';
import { HeaderComponent } from '../components/header/header.component';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { LoginService } from '../services/login.service';
import { ParticipantLoginService } from '../services/participant-login.service';
import { CommonModule } from '@angular/common';
import { ParticipantSidebarComponent } from "../components/participant-sidebar/participant-sidebar.component";

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, HeaderComponent, RouterOutlet, SidebarComponent, ParticipantSidebarComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export default class LayoutComponent {
  sidebarOpen: boolean = false;
  isMobile: boolean = false;
  isParticipant: boolean = false;

  constructor(
    private adminAuth: LoginService,
    private participantAuth: ParticipantLoginService
  ) {
    this.checkUserType();
  }

  private checkUserType(): void {
    this.isParticipant = this.participantAuth.isAuthenticated();
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  openSidebar(): void {
    this.sidebarOpen = true;
  }

  updateIsMobile(isMobile: boolean) {
    this.isMobile = isMobile;
  }
}