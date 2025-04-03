import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '@services/data.service';
import { AccessDetials } from '@services/model/option.model';
import { User } from '@services/model/user.model';
import {
  FixedRoutes,
  FixedRoutesAdmin,
  FixedRoutesMaster,
  FixedRoutesDoctor,
  Modules,
  FixedRoutesPharmacist,
  OPDoctor,
  Clerk,
  Cashier,
  SeniorCashier,
  FixedRoutesUsers,
  LabTechnician,
  RadTencnician,
  Hospitalist,
  CashierLevel1,
  CashierLevel2,
  SeniorClerk,
  FixedRoutesNursing
} from '@urls';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  public loginForm: FormGroup;
  public showPassword: boolean = false;
  constructor(private dataService: DataService, private router: Router) {
    if (sessionStorage.AccessToken) {
      if (sessionStorage && sessionStorage.UserTypeId) {
        if (sessionStorage.UserTypeId == AccessDetials.MasterAccess) {
          const accessValues = Object.values(FixedRoutesMaster);
          this.router.navigateByUrl(accessValues[0]);
        } else if (sessionStorage.UserTypeId == AccessDetials.AdminAccess) {
          const accessValues = Object.values(FixedRoutesAdmin);
          this.router.navigateByUrl(accessValues[0]);
        } else if (sessionStorage.UserTypeId == AccessDetials.DoctorDashboard) {
          const accessValues = Object.values(FixedRoutesDoctor);
          this.router.navigateByUrl(accessValues[0]);
        }else if (sessionStorage.UserTypeId == AccessDetials.PharmacistDashboard) {
          const accessValues = Object.values(FixedRoutesPharmacist);
          this.router.navigateByUrl(accessValues[0]);
        }else if ((sessionStorage.UserTypeId == AccessDetials.AllUsers) ) {
          const accessValues = Object.values(FixedRoutesUsers);
          this.router.navigateByUrl(accessValues[0]);
        }
      }
    }
  }

  ngOnInit() {
    const tenantCode = window.location.hostname
      .replace('http://', '')
      .replace('https://', '')
      .replace('www.', '')
      .replace('.com', '')
      .replace('.co', '')
      .replace('.co.in', '')
      .replace('.in', '');
    this.loginForm = new FormGroup({
      username: new FormControl('Admin', Validators.required),
      password: new FormControl('Admin', Validators.required),
      tenantCode: new FormControl("Master"),
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.dataService
        .postData<User>(Modules.AuthUrl, this.loginForm.value)
        .then((response) => {
          if (response && response.accessToken) {
            sessionStorage.AccessToken = response.accessToken;
            sessionStorage.TenantCode = response.tenantCode;
            sessionStorage.UserName = response.username;
            sessionStorage.UserTypeId = response.userTypeId;
            sessionStorage.User = JSON.stringify(response);
            if (sessionStorage && sessionStorage.UserTypeId) {
              if (sessionStorage.UserTypeId == AccessDetials.MasterAccess) {
                const accessValues = Object.values(FixedRoutesMaster);
                this.router.navigateByUrl(accessValues[0]);
              } else if (
                sessionStorage.UserTypeId == AccessDetials.AdminAccess
              ) {
                const accessValues = Object.values(FixedRoutesAdmin);
                this.router.navigateByUrl(accessValues[0]);
              }else if (sessionStorage.UserTypeId == AccessDetials.DoctorDashboard) {
                const accessValues = Object.values(FixedRoutesDoctor);
                this.router.navigateByUrl(accessValues[0]);
              }else if (sessionStorage.UserTypeId == AccessDetials.PharmacistDashboard) {
                const accessValues = Object.values(FixedRoutesPharmacist);
                this.router.navigateByUrl(accessValues[0]);
              }else if (sessionStorage.UserTypeId == AccessDetials.OPDoctor) {
                const accessValues = Object.values(OPDoctor);
                this.router.navigateByUrl(accessValues[0]);
              }else if (sessionStorage.UserTypeId == AccessDetials.Clerk) {
                const accessValues = Object.values(Clerk);
                this.router.navigateByUrl(accessValues[0]);
              }else if (sessionStorage.UserTypeId == AccessDetials.Cashier) {
                const accessValues = Object.values(Cashier);
                this.router.navigateByUrl(accessValues[0]);
              }else if (sessionStorage.UserTypeId == AccessDetials.SeniorCashier) {
                const accessValues = Object.values(SeniorCashier);
                this.router.navigateByUrl(accessValues[0]);
              }else if ((sessionStorage.UserTypeId == AccessDetials.AllUsers)) {
                const accessValues = Object.values(FixedRoutesUsers);
                this.router.navigateByUrl(accessValues[0]);
              }else if ((sessionStorage.UserTypeId == AccessDetials.LabTechnician)) {
                const accessValues = Object.values(LabTechnician);
                this.router.navigateByUrl(accessValues[0]);
              }else if ((sessionStorage.UserTypeId == AccessDetials.RadTencnician)) {
                const accessValues = Object.values(RadTencnician);
                this.router.navigateByUrl(accessValues[0]);
              }else if ((sessionStorage.UserTypeId == AccessDetials.Hospitalist)) {
                const accessValues = Object.values(Hospitalist);
                this.router.navigateByUrl(accessValues[0]);
              }else if ((sessionStorage.UserTypeId == AccessDetials.CashierLevel1)) {
                const accessValues = Object.values(CashierLevel1);
                this.router.navigateByUrl(accessValues[0]);
              }else if ((sessionStorage.UserTypeId == AccessDetials.CashierLevel2)) {
                const accessValues = Object.values(CashierLevel2);
                this.router.navigateByUrl(accessValues[0]);
              }else if ((sessionStorage.UserTypeId == AccessDetials.SeniorClerk)) {
                const accessValues = Object.values(SeniorClerk);
                this.router.navigateByUrl(accessValues[0]);
              }else if ((sessionStorage.UserTypeId == AccessDetials.NursingAccess)) {
                const accessValues = Object.values(FixedRoutesNursing);
                this.router.navigateByUrl(accessValues[0]);
              }
            }
          }
        });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
