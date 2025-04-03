import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { DataService } from '@services/data.service';
import { AddService } from '@services/model/AddService.model';
import { eMessageIcon, eMessageType } from '@services/model/data.service.model';
import { OptionsTransfer } from '@services/model/option.model';
import { NotificationService } from '@services/notification.service';
import { ResourceService } from '@services/resource.service';
import { FixedRoutes, Modules } from '@urls';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'add-service',
  templateUrl: './add-service.component.html',
  styleUrls: ['./add-service.component.scss']
})
export class AddServiceComponent implements OnInit, OnDestroy {
  public dyForm: FormGroup;
  private submitSubscription: Subscription;
  private routeSubscription: Subscription;
  private closeSubscription: Subscription;
  public confirmSubscription: Subscription;
  private confirmationProcessSubscription: Subscription;
  private searchEventSubscription: Subscription;
  constructor(private resourceService: ResourceService, private router: Router, public dataService: DataService, private notificationService: NotificationService) {
    this.dyForm = this.createForm();
    this.onRouting();
  }
  public optionsToGet: OptionsTransfer[] = [
  ];

  ngOnInit(): void {
    if (this.submitSubscription) { this.submitSubscription.unsubscribe(); }
    this.submitSubscription = this.resourceService.submitEvent.subscribe(event => {
      if (event) {
        this.submitForm();
      }
    });

    if (this.closeSubscription) { this.closeSubscription.unsubscribe(); }
    this.closeSubscription = this.resourceService.cancelEvent.subscribe(() => {
      this.dataService.notify.next({ key: eMessageType.Warning, value: "Are you sure you want to cancel?", icon: eMessageIcon.Warning });
      if (this.confirmationProcessSubscription) { this.confirmationProcessSubscription.unsubscribe() }
      this.confirmationProcessSubscription = this.notificationService.confirmationProcess.subscribe((data) => {
        if (data) { this.router.navigateByUrl(`${FixedRoutes.Settings}/${FixedRoutes.Service}`); }
      });
    });
  }
  createForm(): FormGroup {
    return new FormGroup({
      code: new FormControl('', [Validators.required]),
      name: new FormControl('', [Validators.required]),
      defaultPrice: new FormControl('', [Validators.required])
    });
  }
  submitForm() {
    let data = {
      ...this.dyForm.value
    }
    if (this.dyForm.valid) {
      this.dataService.postData(Modules.Service, { ...data }).then((response) => {
        this.dyForm.patchValue(data)
        this.router.navigateByUrl(`${FixedRoutes.Settings}/${FixedRoutes.Service}`);

      });
    }
    else {
      this.dyForm.markAllAsTouched();
      this.dyForm.updateValueAndValidity();
    }
  }
  onRouting(): void {
    this.routeSubscription = this.router.events.pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        if (this.router.url === `/${FixedRoutes.Settings}/${FixedRoutes.ServiceEdit}`) {
          let servicedata1 = <AddService>this.router.getCurrentNavigation().extras.state;
          if (servicedata1 || servicedata1.id) {
            servicedata1 = { ...servicedata1 };
            this.dyForm.patchValue(servicedata1);
          }
        }
        this.routeSubscription.unsubscribe();
      });
  }
  getPatient(data: string) {
    if (data.length >= 6) {
      this.dataService.getData<AddService[]>(Modules.ServiceById, data).then((resp) => {
        if (resp && resp.length) {
          this.dyForm.patchValue({ ...this.dyForm.value });
        }
      });
    }
  }
  ngOnDestroy(): void {
    if (this.confirmSubscription) { this.confirmSubscription.unsubscribe() };
    if (this.searchEventSubscription) { this.searchEventSubscription.unsubscribe() };
    if (this.closeSubscription) { this.closeSubscription.unsubscribe(); }
    if (this.submitSubscription) { this.submitSubscription.unsubscribe(); }
    if (this.routeSubscription) { this.routeSubscription.unsubscribe(); }
  }
}
