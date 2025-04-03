import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CrudService } from '@services/crud.service';
import { DataService } from '@services/data.service';
import { eMessageIcon, eMessageType } from '@services/model/data.service.model';
import { AppointmentType } from '@services/model/option.model';
import { NotificationService } from '@services/notification.service';
import { ResourceService } from '@services/resource.service';
import { FixedRoutes, Modules } from '@urls';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-add-appointment-details',
  templateUrl: './add-appointment-details.component.html',
  styleUrls: ['./add-appointment-details.component.scss'],
})
export class AddAppointmentDetailsComponent implements OnInit {
  public confirmSubscription: Subscription;
  public AppointmentData: AppointmentType[];
  public responsedatas: AppointmentType[] = []
  public appointmentDataBackup: AppointmentType[];

  constructor(public crudService: CrudService, private dataService: DataService, private router: Router, private notificationService: NotificationService, private resourceService: ResourceService) {
    this.onLoadAppointmentData();
  }
  ngOnInit(): void {
    setTimeout(() => {
      this.crudService.dayOnlyCrud = true;
    }, 100)
  }
  onLoadAppointmentData(): void {
    this.dataService.getData<AppointmentType[]>(Modules.AppointmentType).then((data) => {
      this.AppointmentData = [];
      if (data && data.length) {
        this.appointmentDataBackup = data.slice();
        this.AppointmentData = data;
        console.log(this.AppointmentData, 'Appointment Datass');
      }
    })
  }
  onDeleteAppointment(data: AppointmentType) {
    this.dataService.notify.next({ key: eMessageType.Warning, value: "Do You really want to delete this Appointment?", icon: eMessageIcon.Warning })
    if (this.confirmSubscription) { this.confirmSubscription.unsubscribe(); }
    this.confirmSubscription = this.notificationService.confirmationProcess.subscribe((resp) => {
      if (resp) { this.dataService.delete(Modules.AppointmentType, data.id).then(() => this.onLoadAppointmentData()); }
    })
  }
  onEditAppointment(data: AppointmentType) {
    { this.router.navigate([`${FixedRoutes.Settings}/${FixedRoutes.AppointmentEdit}`], { state: data }); }
  }
  openAppointmentPopup(data: AppointmentType) {
    this.showAppointmentProfile(data);
  }
  showAppointmentProfile(data: AppointmentType) {
    if (data) {
      this.dataService.getData<AppointmentType[]>(Modules.AppointmentType, `${data.id}`).then((response) => {
        if (response && response.length) {
          this.responsedatas = response;
        }
      })
    }
  }
  ngOnDestroy(): void {
    if (this.confirmSubscription) { this.confirmSubscription.unsubscribe() };
  }
}
