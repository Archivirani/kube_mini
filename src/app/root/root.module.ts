import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DataService } from '@services/data.service';
import { AuthGuard } from '@services/interceptor/auth.guard';
import { AuthInterceptor } from '@services/interceptor/auth.interceptor.guard';
import { LoadingInterceptor } from '@services/interceptor/loading.interceptor.guard';
import { NotificationService } from '@services/notification.service';
import { FixedRoutes } from '@urls';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { RootComponent } from './root.component';

export const rootRoutes: Routes = [
  {
    path: FixedRoutes.Login,
    component: RootComponent,
    loadChildren: () => import('../auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: '',
    component: RootComponent,
    canActivate: [AuthGuard],
    loadChildren: () => import('../layout/layout.module').then((m) => m.LayoutModule),
  },
  {
    path: '**',
    component: RootComponent,
    canActivate: [AuthGuard],
    loadChildren: () => import('../layout/layout.module').then((m) => m.LayoutModule),
  }
];



@NgModule({
  declarations: [RootComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule.forChild(rootRoutes),
    SimpleNotificationsModule.forRoot({
      timeOut: 5000,
      clickToClose: true,
      theClass: 'outline primary',
      position: ['bottom', 'center'],
    }),
  ],
  providers: [
    DataService,
    NotificationService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true },
  ],
})
export class RootModule { }
