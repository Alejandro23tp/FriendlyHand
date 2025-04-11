import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { ParticipantLoginService } from '../services/participant-login.service';

export const participantAuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(ParticipantLoginService);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }
  return true;
};