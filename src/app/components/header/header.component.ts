import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { InactivityService } from '../../services/inactivity.service';

interface UserData {
  usr_id: string;
  usr_correo: string;
  usr_nombre?: string;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class HeaderComponent {
  @Output() toggleSidebarEvent = new EventEmitter<void>();
  isMenuOpen: boolean = false;
  isProfileMenuOpen: boolean = false;
  userData: UserData | null = null;

  constructor(
    private router: Router,
    private loginService: LoginService,
    private inactivityService: InactivityService
  ) {
    this.loadUserData();
  }

  toggleSidebar() {
    this.toggleSidebarEvent.emit();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleProfileMenu() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  loadUserData() {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      this.userData = JSON.parse(userDataString);
    }
  }

  logout() {
    this.inactivityService.stopAndCleanup();
    this.loginService.logout();
    this.isProfileMenuOpen = false; // Cerrar el menú de perfil
  }
}