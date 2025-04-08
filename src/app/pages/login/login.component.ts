import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { NgxSonnerToaster, toast } from 'ngx-sonner';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { InactivityService } from '../../services/inactivity.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export default class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private loginService: LoginService,
    private cdr: ChangeDetectorRef,
    private inactivityService: InactivityService
  ) {
    this.loginForm = this.fb.group({
      usr_usuario: ['', [Validators.required]], // Cambiado de usr_correo a usr_usuario
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  onLogin() {
    if (this.loginForm.valid) {
      // Set loading before async operation
      this.isLoading = true;
      const loginData = this.loginForm.value;

      this.loginService.login(loginData).pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        })
      ).subscribe({
        next: (response) => {
          localStorage.setItem('userData', JSON.stringify(response.user));
          if (loginData.rememberMe) {
            localStorage.setItem('usr_usuario', loginData.usr_usuario);
          } else {
            localStorage.removeItem('usr_usuario');
          }
          toast.success('Ingreso Exitoso');
          this.inactivityService.setupInactivityTimer(); // Iniciar timer después del login
          this.router.navigate(['/home']);
        },
        error: (error) => {
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
