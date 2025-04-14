import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-participant-sidebar',
  standalone: true,
  templateUrl: './participant-sidebar.component.html',
  styleUrls: ['./participant-sidebar.component.scss'],
  imports: [RouterModule, CommonModule], // Asegúrate de incluir estos módulos
})
export class ParticipantSidebarComponent {
  // Código del componente
  @Input() isOpen: boolean = false;
  @Output() closeSidebar = new EventEmitter<void>();
  @Output() isMobileChange = new EventEmitter<boolean>(); // Detecta cambios de estado móvil

  submenuStates: { [key: string]: boolean } = {
    pagos: false,
    prestamos: false,
  };

  isMobile: boolean = false;

  ngOnInit() {
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
  }

  ngOnDestroy() {
    window.removeEventListener('resize', () => this.checkScreenSize());
  }

  // Detecta si el dispositivo es móvil
  checkScreenSize() {
    this.isMobile = window.innerWidth < 640; // Menor a 640px (móvil)
    this.isMobileChange.emit(this.isMobile);
  }

  // Abre o cierra el sidebar
  toggleSidebar() {
    this.isOpen = !this.isOpen;
  }

  // Cierra el sidebar y emite el evento
  closeSidebarHandler() {
    this.closeSidebar.emit();
    this.isOpen = false;
  }

  // Gestiona la apertura y cierre de submenús
  async toggleSubmenu(menu: string) {
    await new Promise(resolve => setTimeout(resolve, 0)); // Microtask para garantizar la actualización
    this.submenuStates[menu] = !this.submenuStates[menu];
  }

  // Cierra el sidebar al hacer clic en un enlace si es móvil
  handleLinkClick() {
    if (this.isMobile) {
      this.isOpen = false;
    }
  }
}
