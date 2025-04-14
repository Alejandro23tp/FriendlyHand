import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSonnerToaster, toast } from 'ngx-sonner';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { LoginService } from '../../services/login.service';
import { ParticipanteLoginResponse, ParticipantLoginService } from '../../services/participant-login.service'; // Importar nuevo servicio
import { InactivityService } from '../../services/inactivity.service';
import { LoginFieldsComponent } from '../../components/login-fields/login-fields.component';
import { LoginResponse } from '../../interfaces/auth.interface';
import { Observable } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';


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
    private participantLoginService: ParticipantLoginService, // Inyectar servicio de participantes
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
  
      const loginRequest: Observable<LoginResponse | ParticipanteLoginResponse> = 
        this.isAdminView
          ? this.loginService.login(loginData)
          : this.participantLoginService.login(loginData);
  
      loginRequest.pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      ).subscribe({
        next: (response: LoginResponse | ParticipanteLoginResponse) => {
          this.handleLoginResponse(response);
          toast.success('Ingreso Exitoso');
          this.inactivityService.setupInactivityTimer();
          
          const redirectPath = this.isAdminView 
            ? '/admin/home' 
            : '/participante/home';
          this.router.navigate([redirectPath]);
        },
        error: (error: HttpErrorResponse) => {
          const errorMessage = error.error?.message 
            || 'Error de autenticación. Verifique sus credenciales';
          toast.error(errorMessage);
        }
      });
    } else {
      toast.error('Por favor, complete los campos correctamente.');
    }
  }
  

  private handleLoginResponse(response: any): void {
    const rememberKey = this.isAdminView ? 'remembered_user' : 'remembered_participant';
    const dataKey = this.isAdminView ? 'userData' : 'participant_data';
    
    if (this.loginForm.value.rememberMe) {
      localStorage.setItem(rememberKey, this.loginForm.value.login);
    } else {
      localStorage.removeItem(rememberKey);
    }

    // Guardar datos según tipo de usuario
    localStorage.setItem(dataKey, JSON.stringify(response.user));
    
    if (this.isAdminView) {
      localStorage.setItem('jwt_token', response.access_token);
    } else {
      localStorage.setItem('participant_jwt_token', response.access_token);
    }
  }

  toggleLoginView() {
    this.isAdminView = !this.isAdminView;
    this.errorMessage = '';
    this.clearFormCredentials();
  }

  private clearFormCredentials(): void {
    this.loginForm.patchValue({
      password: ''
    });
  }

  ngOnInit() {
    const rememberKey = this.isAdminView ? 'remembered_user' : 'remembered_participant';
    const rememberedUser = localStorage.getItem(rememberKey);
    
    if (rememberedUser) {
      this.loginForm.patchValue({
        login: rememberedUser,
        rememberMe: true
      });
    }
  }
}