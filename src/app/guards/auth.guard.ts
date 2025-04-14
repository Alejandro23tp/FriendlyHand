import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { LoginService } from '../services/login.service';
import { ParticipantLoginService } from '../services/participant-login.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const adminAuth = inject(LoginService);
  const participantAuth = inject(ParticipantLoginService);

  // Verificar si es ruta de participante
  const isParticipantRoute = state.url.includes('/participante');

  if (isParticipantRoute) {
    if (participantAuth.isAuthenticated()) {
      return true;
    }
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // Rutas normales (admin)
  if (adminAuth.isAuthenticated()) {
    return true;
  }

  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
