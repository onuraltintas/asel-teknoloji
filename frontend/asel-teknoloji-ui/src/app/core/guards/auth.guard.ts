import { inject } from '@angular/core';
import { CanActivateFn, CanActivateChildFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

const checkAccess = (route: ActivatedRouteSnapshot): boolean => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    router.navigate(['/admin/login']);
    return false;
  }

  const requiredRoles = route.data?.['roles'] as string[] | undefined;
  if (requiredRoles && !requiredRoles.includes(auth.getRole() ?? '')) {
    router.navigate(['/admin/technical']);
    return false;
  }

  return true;
};

export const authGuard: CanActivateFn      = (route) => checkAccess(route);
export const authGuardChild: CanActivateChildFn = (route) => checkAccess(route);
