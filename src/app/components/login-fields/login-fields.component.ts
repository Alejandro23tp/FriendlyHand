import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-login-fields',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-fields.component.html',
  styleUrl: './login-fields.component.scss'
})
export class LoginFieldsComponent {
  @Input() parentForm!: FormGroup; // Cambiado de 'form' a 'parentForm'
  @Input() isAdminView: boolean = false;
  @Input() formPrefix: string = '';
}