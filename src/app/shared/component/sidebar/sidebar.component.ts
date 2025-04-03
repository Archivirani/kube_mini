import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AccessDetials } from '@services/model/option.model';
import { Cashier, CashierLevel1, CashierLevel2, Clerk, FixedRoutes, FixedRoutesAdmin, FixedRoutesDoctor, FixedRoutesMaster, FixedRoutesPharmacist, Hospitalist, LabTechnician, OPDoctor, RadTencnician, SeniorCashier, SeniorClerk,FixedRoutesNursing} from '@urls';

@Component({
  selector: 'dashboard-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  public routerLink = FixedRoutes;
  constructor(private Router: Router) { }

  onCheckAccessDetails(activateRouter: string): boolean {
    if (sessionStorage && sessionStorage.UserTypeId) {
      if (sessionStorage.UserTypeId == AccessDetials.MasterAccess) {
        return this.accessDetails(activateRouter, FixedRoutesMaster)
      } else if (sessionStorage.UserTypeId == AccessDetials.AdminAccess) {
        return this.accessDetails(activateRouter, FixedRoutesAdmin)
      }else if (sessionStorage.UserTypeId == AccessDetials.DoctorDashboard) {
        return this.accessDetails(activateRouter, FixedRoutesDoctor)
      }else if (sessionStorage.UserTypeId == AccessDetials.PharmacistDashboard) {
        return this.accessDetails(activateRouter, FixedRoutesPharmacist)
      }else if (sessionStorage.UserTypeId == AccessDetials.OPDoctor) {
        return this.accessDetails(activateRouter, OPDoctor)
      }else if (sessionStorage.UserTypeId == AccessDetials.Clerk) {
        return this.accessDetails(activateRouter, Clerk)
      }else if (sessionStorage.UserTypeId == AccessDetials.Cashier) {
        return this.accessDetails(activateRouter, Cashier)
      }else if (sessionStorage.UserTypeId == AccessDetials.SeniorCashier) {
        return this.accessDetails(activateRouter, SeniorCashier)
      }else if (sessionStorage.UserTypeId == AccessDetials.LabTechnician) {
        return this.accessDetails(activateRouter, LabTechnician)
      }else if (sessionStorage.UserTypeId == AccessDetials.RadTencnician) {
        return this.accessDetails(activateRouter, RadTencnician)
      }else if (sessionStorage.UserTypeId == AccessDetials.Hospitalist) {
        return this.accessDetails(activateRouter, Hospitalist)
      }else if (sessionStorage.UserTypeId == AccessDetials.CashierLevel1) {
        return this.accessDetails(activateRouter, CashierLevel1)
      }else if (sessionStorage.UserTypeId == AccessDetials.CashierLevel2) {
        return this.accessDetails(activateRouter, CashierLevel2)
      }else if (sessionStorage.UserTypeId == AccessDetials.SeniorClerk) {
        return this.accessDetails(activateRouter, SeniorClerk)
      }else if (sessionStorage.UserTypeId == AccessDetials.NursingAccess) {
        return this.accessDetails(activateRouter, FixedRoutesNursing)
      }
    }
  }
  navigateToSettings(){
    this.Router.navigate([this.routerLink.Settings]);

  }
  accessDetails(activateRouter: string, routerAccess: Object): boolean {
    const checkRouter = Object.values(routerAccess).find(d => d === activateRouter);
    return !!checkRouter;
  }
}
