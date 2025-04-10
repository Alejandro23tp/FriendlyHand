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
      login: ['', [Validators.required]], // Cambiado de usr_usuario a login
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  onLogin() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const loginData = this.loginForm.value;

      this.loginService.login(loginData).pipe(
        finalize(() => this.isLoading = false)
      ).subscribe({
        next: (response) => {
          // Manejar recordar usuario
          if (loginData.rememberMe) {
            localStorage.setItem('remembered_user', loginData.login); // Cambiado de usr_usuario a login
          } else {
            localStorage.removeItem('remembered_user');
          }

          localStorage.setItem('userData', JSON.stringify(response.user));
          localStorage.setItem('jwt_token', response.access_token);
          
          toast.success('Ingreso Exitoso');
          this.inactivityService.setupInactivityTimer();
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
    const rememberedUser = localStorage.getItem('remembered_user');
    if (rememberedUser) {
      this.loginForm.patchValue({
        login: rememberedUser, // Cambiado de usr_usuario a login
        rememberMe: true
      });
    }
  }
}
