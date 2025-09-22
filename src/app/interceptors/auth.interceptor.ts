import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { toast } from 'ngx-sonner';
import { catchError, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // Identificar si la solicitud pertenece a participante según la URL
  const isParticipantRequest = req.url.includes('/participante');

  // Seleccionar el token adecuado según el contexto
  const token = isParticipantRequest
    ? localStorage.getItem('participant_jwt_token') // Token del participante
    : localStorage.getItem('jwt_token'); // Token del administrador

  // Agregar el token si existe
  if (token) {
    req = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Manejo de errores 401
      if (error.status === 401 && token) {
        toast.error('Sesión expirada', {
          description: 'Por favor, inicie sesión nuevamente'
        });
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
