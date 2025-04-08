import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { NgxSonnerToaster, toast } from 'ngx-sonner';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export default class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private loginService: LoginService,
  ) {
    this.loginForm = this.fb.group({
      usr_usuario: ['', [Validators.required]], // Cambiado de usr_correo a usr_usuario
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  async onLogin() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const loginData = this.loginForm.value;

      this.loginService.login(loginData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.errorMessage = '';
          // Guardar información del usuario
          localStorage.setItem('userData', JSON.stringify(response.user));
          toast.success('Ingreso Exitoso');

          if (loginData.rememberMe) {
            localStorage.setItem('usr_usuario', loginData.usr_usuario); // Cambiado de usr_correo a usr_usuario
          } else {
            localStorage.removeItem('usr_usuario'); // Cambiado de usr_correo a usr_usuario
          }

          this.router.navigate(['/home']);
        },
        error: (error) => {
          this.isLoading = false;
          toast.error(error.error?.message || 'Credenciales incorrectas');
        }
      });
    } else {
      toast.error('Por favor, complete los campos correctamente.');
    }
  }

  ngOnInit() {
    const savedUsername = localStorage.getItem('usr_usuario'); // Cambiado de usr_correo a usr_usuario
    if (savedUsername) {
      this.loginForm.patchValue({ usr_usuario: savedUsername, rememberMe: true }); // Cambiado de usr_correo a usr_usuario
    }
  }
}
