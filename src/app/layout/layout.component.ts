import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '@services/data.service';
import { AccessDetials } from '@services/model/option.model';
import { NotificationService } from '@services/notification.service';
import { ResourceService } from '@services/resource.service';
import { Cashier, CashierLevel1, CashierLevel2, Clerk, FixedRoutesAdmin, FixedRoutesDoctor, FixedRoutesMaster, FixedRoutesPharmacist, FixedRoutesUsers, Hospitalist, LabTechnician, OPDoctor, RadTencnician, SeniorCashier, SeniorClerk,FixedRoutesNursing } from '@urls';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnDestroy {
  public isValidRoute: boolean = false;
  private confirmSubscription: Subscription;

  constructor(public resourceService: ResourceService, private Router: Router, private dataService: DataService, private notificationService: NotificationService) {
    if (sessionStorage && sessionStorage.UserTypeId) {
      const activateRouter = this.Router.url.split('/')[1];
      const childRouter = this.Router.url.split('/')[2];
      if (sessionStorage.UserTypeId == AccessDetials.MasterAccess) {
       this.accessDetails(activateRouter, FixedRoutesMaster)
       } else if (sessionStorage.UserTypeId == AccessDetials.AdminAccess) {
        this.accessDetails(activateRouter, FixedRoutesAdmin)
      }
      else if (sessionStorage.UserTypeId == AccessDetials.DoctorDashboard) {
        this.accessDetails(activateRouter, FixedRoutesDoctor)
      }else if (sessionStorage.UserTypeId == AccessDetials.PharmacistDashboard) {
        this.accessDetails(activateRouter, FixedRoutesPharmacist)
      }else if (sessionStorage.UserTypeId == AccessDetials.OPDoctor) {
        this.accessDetails(activateRouter, OPDoctor)
      }else if (sessionStorage.UserTypeId == AccessDetials.Clerk) {
        this.accessDetails(activateRouter, Clerk)
      }else if (sessionStorage.UserTypeId == AccessDetials.Cashier) {
        this.accessDetails(activateRouter, Cashier)
      }else if (sessionStorage.UserTypeId == AccessDetials.SeniorCashier) {
        this.accessDetails(activateRouter, SeniorCashier)
      }else if ((sessionStorage.UserTypeId == AccessDetials.AllUsers)) {
        this.accessDetails(activateRouter, FixedRoutesUsers)
      }else if ((sessionStorage.UserTypeId == AccessDetials.RadTencnician)) {
        this.accessDetails(activateRouter, RadTencnician)
      }
      else if ((sessionStorage.UserTypeId == AccessDetials.LabTechnician)) {
        this.accessDetails(activateRouter, LabTechnician)
      }else if ((sessionStorage.UserTypeId == AccessDetials.Hospitalist)) {
        this.accessDetails(activateRouter, Hospitalist)
      }else if ((sessionStorage.UserTypeId == AccessDetials.CashierLevel1)) {
        this.accessDetails(activateRouter, CashierLevel1)
      }else if ((sessionStorage.UserTypeId == AccessDetials.CashierLevel2)) {
        this.accessDetails(activateRouter, CashierLevel2)
      }else if ((sessionStorage.UserTypeId == AccessDetials.SeniorClerk)) {
        this.accessDetails(activateRouter, SeniorClerk)
      }else if ((sessionStorage.UserTypeId == AccessDetials.NursingAccess)) {
        this.accessDetails(activateRouter, FixedRoutesNursing)
      }
      childRouter ? this.Router.navigateByUrl(activateRouter) : null;
    }
  }

  accessDetails(activateRouter: string, routerAccess: Object): void {
    const checkRouter = Object.values(routerAccess).find(d => d === activateRouter);
    this.isValidRoute = !!checkRouter;
    this.timeforamate();
  }

  timeforamate(){

  }

  ngOnDestroy(): void {
    if (this.confirmSubscription) { this.confirmSubscription.unsubscribe(); };
  }
}
