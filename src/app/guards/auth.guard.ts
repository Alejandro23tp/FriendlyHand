import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { LoginService } from '../services/login.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const loginService = inject(LoginService);

  if (!loginService.isAuthenticated()) {
    console.log('No autenticado, redirigiendo a login');
    router.navigate(['/login']);
    return false;
  }

  console.log('Usuario autenticado');
  return true;
};
