import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { toast } from 'ngx-sonner';
import { catchError, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // Validar si la solicitud pertenece al participante (más estricta)
  const isParticipantRequest =
    req.url.startsWith('/participante') || // Rutas del prefijo participante
    req.url.startsWith('/auth/participante'); // Rutas de autenticación para participante

  // Seleccionar el token correcto dependiendo del contexto
  const token = isParticipantRequest
    ? localStorage.getItem('participant_jwt_token') // Token del participante
    : localStorage.getItem('jwt_token'); // Token del administrador

  const isLoginRequest = req.url.includes('auth/login');

  if (token && !isLoginRequest) {
    req = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isLoginRequest && token) {
        toast.error('Sesión expirada', {
          description: 'Por favor, inicie sesión nuevamente'
        });
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};

