import { CanActivateFn,Router } from '@angular/router';
import { Token } from '../services/token';
import { inject } from '@angular/core';


export const authGuard: CanActivateFn = (route, state) => {
  const tokenService = inject(Token);
  const router = inject(Router);

  if (tokenService.hasToken()) {
    return true;
  }
  
  tokenService.removeToken();
  tokenService.removeUsuario();
  tokenService.removeRol();
  router.navigateByUrl('/login');
  return false;
};
