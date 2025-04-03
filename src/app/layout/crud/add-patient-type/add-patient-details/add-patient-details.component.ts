import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CrudService } from '@services/crud.service';
import { DataService } from '@services/data.service';
import { eMessageIcon, eMessageType } from '@services/model/data.service.model';
import { PatientType } from '@services/model/option.model';
import { NotificationService } from '@services/notification.service';
import { FixedRoutes, Modules } from '@urls';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-patient-details',
  templateUrl: './add-patient-details.component.html',
  styleUrls: ['./add-patient-details.component.scss'],
})
export class AddPatientDetailsComponent implements OnInit {
  public PatientData: PatientType[];
  public PatientDataBackup: PatientType[];
  public responsedatas: PatientType[] = []
  public confirmSubscription: Subscription;

  @ViewChild('getPatientIdDetails', { static: true }) getPatientIdDetails: TemplateRef<any>;
  constructor(public crudService: CrudService, private dataService: DataService, private router: Router, private notificationService: NotificationService) {
    this.onLoadPatient();
  }
  ngOnInit(): void {
    setTimeout(() => {
      this.crudService.dayOnlyCrud = true;
    }, 100)
  }
  onLoadPatient(): void {
    this.dataService.getData<PatientType[]>(Modules.PatientType).then((data) => {
      this.PatientData = [];
      if (data && data.length) {
        this.PatientDataBackup = data.slice();
        this.PatientData = data;
        console.log(this.PatientData, 'pATIENTrELATIONSHIP')
      }
    })
  }
  onPatientDelete(data: PatientType) {
    this.dataService.notify.next({ key: eMessageType.Warning, value: "Do You really want to delete this Patient?", icon: eMessageIcon.Warning })

    if (this.confirmSubscription) { this.confirmSubscription.unsubscribe(); }
    this.confirmSubscription = this.notificationService.confirmationProcess.subscribe((resp) => {
      if (resp) { this.dataService.delete(Modules.PatientType, data.id).then(() => this.onLoadPatient()); }
    })
  }
  onPatientEdit(data: PatientType) {
    { this.router.navigate([`${FixedRoutes.Settings}/${FixedRoutes.PatientIdEdit}`], { state: data }); }
  }
  ngOnDestroy(): void {
    if (this.confirmSubscription) { this.confirmSubscription.unsubscribe() };
  }

}
