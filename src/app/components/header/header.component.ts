import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

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

  constructor(private router: Router) {
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
    localStorage.removeItem('userData');
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}