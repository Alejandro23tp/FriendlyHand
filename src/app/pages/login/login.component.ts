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
      usr_correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  async onLogin() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const loginData = this.loginForm.value;

      this.loginService.login(loginData).subscribe(
        (response) => {
          this.isLoading = false;
          if (response.cant === 1) {
            this.errorMessage = '';
            this.loginService.setUsrId(response.data.usr_usuario);
            toast.success('Ingreso Exitoso');

            // Guardar el correo electrónico en localStorage si la casilla "Recordarme" está marcada
            if (loginData.rememberMe) {
              localStorage.setItem('usr_correo', loginData.usr_correo);
            } else {
              localStorage.removeItem('usr_correo');
            }

            this.router.navigate(['/home']); // Redirigir a la página principal
          } else {
            toast.error(response.mensaje || 'Credenciales incorrectas');
          }
        },
        (error) => {
          this.isLoading = false;
          toast.error('Ha ocurrido un error. Por favor, inténtelo de nuevo.');
        }
      );
    } else {
      toast.error('Por favor, complete los campos correctamente.');
    }
  }

  ngOnInit() {
    // Cargar el correo electrónico guardado en localStorage si existe
    const savedEmail = localStorage.getItem('usr_correo');
    if (savedEmail) {
      this.loginForm.patchValue({ usr_correo: savedEmail, rememberMe: true });
    }
  }
}
