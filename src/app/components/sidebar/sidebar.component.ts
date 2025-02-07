import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { trigger, state, style, transition, animate, group } from '@angular/animations';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule],
  animations: [
    trigger('submenuAnimation', [
      state('closed', style({
        height: '0',
        opacity: '0',
        overflow: 'hidden',
        paddingTop: '0',
        paddingBottom: '0'
      })),
      state('open', style({
        height: '*',
        opacity: '1'
      })),
      transition('closed <=> open', [
        group([
          animate('200ms ease-in-out', style({ height: '*' })),
          animate('300ms ease-in-out', style({ opacity: '*' }))
        ])
      ])
    ])
  ]
})
export class SidebarComponent {
  submenuStates: { [key: string]: boolean } = {
    participantes: false,
    recordatorios: false
  };

  @Input() isOpen: boolean = false;
  @Output() closeSidebar = new EventEmitter<void>();
  @Output() isMobileChange = new EventEmitter<boolean>(); // NUEVO
  isMobile: boolean = false;


  ngOnInit() {
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
  }

  ngOnDestroy() {
    window.removeEventListener('resize', () => this.checkScreenSize());
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth < 640; // Solo móviles, no tablets
    this.isMobileChange.emit(this.isMobile); // Emitimos el cambio
  }

  async toggleSubmenu(menu: string) {
    await new Promise(resolve => setTimeout(resolve, 0));
    this.submenuStates[menu] = !this.submenuStates[menu];
  }

  closeSidebarHandler() {
    this.closeSidebar.emit();
    this.isOpen = false;
  }

  toggleSidebar() {
    this.isOpen = !this.isOpen;
  }

  handleLinkClick() {
    if (this.isMobile) {
      this.isOpen = false;
    }
  }
}