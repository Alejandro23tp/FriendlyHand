import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSonnerToaster, toast } from 'ngx-sonner';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { LoginService } from '../../services/login.service';
import { InactivityService } from '../../services/inactivity.service';
import { LoginFieldsComponent } from '../../components/login-fields/login-fields.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, LoginFieldsComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export default class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;
  isAdminView: boolean = true;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private loginService: LoginService,
    private cdr: ChangeDetectorRef,
    private inactivityService: InactivityService
  ) {
    this.loginForm = this.fb.group({
      login: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  onLogin() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const loginData = this.loginForm.value;

      const loginRequest = this.loginService.login(loginData);

      loginRequest.pipe(
        finalize(() => this.isLoading = false)
      ).subscribe({
        next: (response) => {
          if (loginData.rememberMe) {
            localStorage.setItem('remembered_user', loginData.login);
          } else {
            localStorage.removeItem('remembered_user');
          }

          localStorage.setItem('userData', JSON.stringify(response.user));
          localStorage.setItem('jwt_token', response.access_token);

          toast.success('Ingreso Exitoso');
          this.inactivityService.setupInactivityTimer();
          this.router.navigate([this.isAdminView ? '/admin' : '/home']);
        },
        error: (error) => {
          toast.error(error.error?.message || 'Credenciales incorrectas');
        }
      });
    } else {
      toast.error('Por favor, complete los campos correctamente.');
    }
  }

  toggleLoginView() {
    this.isAdminView = !this.isAdminView;
    this.errorMessage = '';
  }

  ngOnInit() {
    const rememberedUser = localStorage.getItem('remembered_user');
    if (rememberedUser) {
      this.loginForm.patchValue({
        login: rememberedUser,
        rememberMe: true
      });
    }
  }
}