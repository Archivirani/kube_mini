import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Modules } from '@urls';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class DownloadInterceptor implements HttpInterceptor {
  constructor(public router: Router) { }

  isDownloadApiResponse: false;
  isGetStaticApiResponse: false;
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (localStorage.AccessToken) { request = request.clone({ headers: request.headers.set('Authorization', `Bearer ${localStorage.AccessToken}`) }); }

    if (!this.isDownloadApiResponse && this.isGetStaticApiResponse) {
      request = request.clone({ url: `${(request.url)?.replace(Modules.Base, 'assets/')}.json`, method: 'GET' })
    }

    return next.handle(request).pipe(
      tap(event => {
        if (this.isDownloadApiResponse && event instanceof HttpResponse && event.body) {
          const link: HTMLAnchorElement = document.createElement('a');
          link.href = window.URL.createObjectURL(new Blob([JSON.stringify(event.body)], { type: 'text/json' }));
          link.download = `${(request.url)?.replace(Modules.Base, '').split('/').join('---')}.json`;
          link.click();
        }
      }),
      catchError((error) => {
        if (error.status === 401) { localStorage.clear(); this.router.navigateByUrl(''); }
        return throwError((error && error.error && error.error.message) || error.statusText);
      })
    );
  }
}
