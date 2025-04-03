import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { LoadingInterceptor } from '@services/interceptor/loading.interceptor.guard';
import { NgxSpinnerModule } from 'ngx-spinner';
import { AppComponent } from './app.component';
import { DataService } from '@services/data.service';

export const appRoutes: Routes = [
  {
    path: '',
    children: [
      { path: '', loadChildren: () => import('./root/root.module').then((m) => m.RootModule) },
      { path: '**', loadChildren: () => import('./root/root.module').then((m) => m.RootModule) },
    ],
  },
];

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    NgxSpinnerModule,
    RouterModule.forRoot(appRoutes),
  ],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  providers: [DataService, { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true }]
})
export class AppModule { }
