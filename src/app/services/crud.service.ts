import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Injectable, NgZone, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { FixedRoutes } from '@urls';
import { Subject, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { DataService } from './data.service';
import { AddService } from './model/AddService.model';

@Injectable({
  providedIn: 'root'
})
export class CrudService implements OnDestroy {
  public addServicess: AddService[] = [];
  public submitEvent: Subject<boolean> = new Subject<boolean>();
  public routeSubscription: Subscription;
  public dayOnlyCrud: boolean = false;
  constructor(public http: HttpClient, private zone: NgZone, public router: Router, private dataService: DataService) {
    this.routeSubscription = router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        if (this.router.url === `/${FixedRoutes.Settings}/${FixedRoutes.Service}`) {
          setTimeout(() => {
            this.dayOnlyCrud = true;
          },);
        } else {
          this.dayOnlyCrud = false
        }
      });
  }
  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }
}
