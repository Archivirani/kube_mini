import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthInterceptor implements HttpInterceptor {
  constructor(public router: Router) { }

  // intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  //   // if (sessionStorage.AccessToken) { request = request.clone({ headers: request.headers.set('Authorization', `Bearer ${sessionStorage.AccessToken}`) }); }
  //   return next.handle(request).pipe(
  //     catchError((error) => {
  //       if (error.status === 401) { sessionStorage.clear(); this.router.navigateByUrl(''); }
  //       return throwError((error && error.error && error.error.message) || error.statusText);
  //     })
  //   );
  // }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (sessionStorage.AccessToken) { request = request.clone({ headers: request.headers.set('Authorization', `Bearer ${sessionStorage.AccessToken}`) }); }
    return next.handle(request).pipe(
      catchError((error) => {
        if (error.status === 401) { sessionStorage.clear(); this.router.navigateByUrl(''); }
        return throwError((error && error.error && error.error.message) || error.statusText);
      })
    );
  }
}
