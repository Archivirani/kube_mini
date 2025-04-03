import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AccessDetials } from '@services/model/option.model';
import { ResourceService } from '@services/resource.service';
import { ChangePasswordPopupComponent } from '@shared/change-password-popup/change-password-popup.component';
import { FixedRoutes } from '@urls';

@Component({
  selector: 'layout-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class LayoutHeaderComponent {
  public routerLink = FixedRoutes
  public userName: string = "";
  public isAccess: string = "";
  public searchValue: any;
  @ViewChild('changepasswordpopup') changepasswordpopup: ChangePasswordPopupComponent;

  constructor(private router: Router, public resourceService: ResourceService) {
    this.userName = sessionStorage.UserName
    if (sessionStorage && sessionStorage.UserTypeId) {
      if (sessionStorage.UserTypeId == AccessDetials.MasterAccess) {
        this.isAccess = "Configuration | Notification";
      } else if (sessionStorage.UserTypeId == AccessDetials.AdminAccess) {
        this.isAccess = "Dashboard | Configuration | Notification";
      } else if (sessionStorage.UserTypeId == AccessDetials.NursingAccess) {
        this.isAccess = "Notification";
      }
    }
  }

  logOut() {
    this.router.navigateByUrl(FixedRoutes.Login);
    sessionStorage.clear();
  }

  ChangePassword(){
    this.changepasswordpopup.showpopup()
  }
  public onSearchChange(event: any): void {
    this.resourceService.searchQuerySubject.next(event.target.value) 
  }
}
