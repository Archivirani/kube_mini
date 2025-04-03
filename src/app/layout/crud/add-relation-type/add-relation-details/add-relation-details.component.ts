import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CrudService } from '@services/crud.service';
import { DataService } from '@services/data.service';
import { eMessageIcon, eMessageType } from '@services/model/data.service.model';
import { PatientRelationship } from '@services/model/option.model';
import { NotificationService } from '@services/notification.service';
import { FixedRoutes, Modules } from '@urls';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-add-relation-details',
  templateUrl: './add-relation-details.component.html',
  styleUrls: ['./add-relation-details.component.scss'],
})
export class AddRelationDetailsComponent implements OnInit {
  public PatientRelationshipData: PatientRelationship[];
  public PatientRelationshipDataBackup: PatientRelationship[];
  public responsedatas: PatientRelationship[] = []
  public confirmSubscription: Subscription;
  constructor(public crudService: CrudService, private dataService: DataService, private router: Router, private notificationService: NotificationService) {
    this.onLoadPatientRelation()
  }
  ngOnInit(): void {
    setTimeout(() => {
      this.crudService.dayOnlyCrud = true;
    }, 100)
  }
  onLoadPatientRelation(): void {
    this.dataService.getData<PatientRelationship[]>(Modules.PatientRelationship).then((data) => {
      this.PatientRelationshipData = [];
      if (data && data.length) {
        this.PatientRelationshipDataBackup = data.slice();
        this.PatientRelationshipData = data;
        console.log(this.PatientRelationshipData)
      }
    })
  }
  onPatientRelationDelete(data: PatientRelationship) {
    this.dataService.notify.next({ key: eMessageType.Warning, value: "Do You really want to delete this Relationship Type?", icon: eMessageIcon.Warning })

    if (this.confirmSubscription) { this.confirmSubscription.unsubscribe(); }
    this.confirmSubscription = this.notificationService.confirmationProcess.subscribe((resp) => {
      if (resp) { this.dataService.delete(Modules.PatientRelationship, data.id).then(() => this.onLoadPatientRelation()); }
      this.router.navigateByUrl(`${FixedRoutes.Settings}/${FixedRoutes.PatientRelations}`);
    })
  }
  onPatientRelationEdit(data: PatientRelationship) {
    { this.router.navigate([`${FixedRoutes.Settings}/${FixedRoutes.RegisterRelationEdit}`], { state: data }); }
  }
  ngOnDestroy(): void {
    if (this.confirmSubscription) { this.confirmSubscription.unsubscribe() };
  }
}
