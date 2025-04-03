import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { FixedRoutes } from '@urls';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router) { }

  canActivate(): boolean {
    if (!sessionStorage.AccessToken) {
      this.router.navigateByUrl(FixedRoutes.Login);
    }
    return true;
  }
}
