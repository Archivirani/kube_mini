import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CrudService } from '@services/crud.service';
import { DataService } from '@services/data.service';
import { AddService } from '@services/model/AddService.model';
import { eMessageIcon, eMessageType } from '@services/model/data.service.model';
import { NotificationService } from '@services/notification.service';
import { ResourceService } from '@services/resource.service';
import { FixedRoutes, Modules } from '@urls';
import { Subscription } from 'rxjs';


@Component({
  selector: 'add-service',
  templateUrl: './add-service-details.component.html',
  styleUrls: ['./add-service-details.component.scss'],
})
export class AddServiceDetailsComponent implements OnInit {
  public serviceData: AddService[];
  public responsedatas: AddService[]=[]
  public serviceDataBackup: AddService[];
  public confirmSubscription: Subscription;
  @ViewChild('getServiceDetails', { static: true }) getServiceDetails: TemplateRef<any>;
  constructor(public crudService: CrudService,public resourceService: ResourceService, private dataService: DataService, private router: Router, private notificationService: NotificationService) { 
    this.onload();
    setTimeout(() => {
      this.crudService.dayOnlyCrud = true;
    }, 100)
  }
  ngOnInit(): void { 
  }
  onload(): void { this.dataService.getData<AddService[]>(Modules.Service).then((data) => { this.serviceData = []; if (data && data.length) { this.serviceDataBackup = data.slice(); this.serviceData = data; } }); }
  onEdit(data: AddService) { 
     this.router.navigate([`${FixedRoutes.Settings}/${FixedRoutes.ServiceEdit}`], { state: data }); }
  onDelete(data: AddService) {
    this.dataService.notify.next({ key: eMessageType.Warning, value: "Do You really want to delete this Service?", icon: eMessageIcon.Warning })

    if (this.confirmSubscription) { this.confirmSubscription.unsubscribe(); }
    this.confirmSubscription = this.notificationService.confirmationProcess.subscribe((resp) => {
      if (resp) { this.dataService.delete(Modules.Service, data.id).then(() => this.onload()); }
    })
  }
  ngOnDestroy(): void {
    if (this.confirmSubscription) { this.confirmSubscription.unsubscribe() };
    
  }
}
