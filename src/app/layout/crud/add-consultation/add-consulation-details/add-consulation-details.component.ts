import { Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { CrudService } from '@services/crud.service';
import { DataService } from '@services/data.service';
import { eMessageIcon, eMessageType } from '@services/model/data.service.model';
import { Consultation } from '@services/model/option.model';
import { NotificationService } from '@services/notification.service';
import { ResourceService } from '@services/resource.service';
import { FixedRoutes, Modules } from '@urls';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-add-consulation-details',
  templateUrl: './add-consulation-details.component.html',
  styleUrls: ['./add-consulation-details.component.scss'],
})
export class AddConsulationDetailsComponent implements OnInit {
  public ConsultantData: Consultation[];
  public consultantDataBuckup: Consultation[];
  public responsedatas: Consultation[]=[]
  public confirmSubscription: Subscription;
  constructor(public crudService: CrudService, private dataService: DataService, private router: Router, private notificationService: NotificationService, private resourceService: ResourceService) { 
    this.onLoadConsulation();
  }
  ngOnInit(): void {
    setTimeout(()=>{
      this.crudService.dayOnlyCrud =true;
    },100)
  }
   onLoadConsulation(): void {
    this.dataService.getData<Consultation[]>(Modules.Consultation).then((data) => {
      this.ConsultantData = [];
      if (data && data.length) {
        this.consultantDataBuckup = data.slice();
        this.ConsultantData = data;
        console.log(this.ConsultantData, 'CONSULATION')
      }
    })
  }
  onConsulationDelete(data: Consultation) {
    this.dataService.notify.next({ key: eMessageType.Warning, value: "Do You really want to delete this consulation?", icon: eMessageIcon.Warning })

    if (this.confirmSubscription) { this.confirmSubscription.unsubscribe(); }
    this.confirmSubscription = this.notificationService.confirmationProcess.subscribe((resp) => {
      if (resp) { this.dataService.delete(Modules.Consultation, data.id).then(() => this.onLoadConsulation()); }
    })
  }
  onConsulationEdit(data: Consultation) {
    { this.router.navigate([`${FixedRoutes.Settings}/${FixedRoutes.ConsultationEdit}`], { state: data }); }
  }
  ngOnDestroy(): void {
    if (this.confirmSubscription) { this.confirmSubscription.unsubscribe() };
  }
}
