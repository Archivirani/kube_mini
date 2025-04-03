import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { DataService } from '@services/data.service';
import { eMessageIcon, eMessageType } from '@services/model/data.service.model';
import { Consultation } from '@services/model/option.model';
import { NotificationService } from '@services/notification.service';
import { ResourceService } from '@services/resource.service';
import { FixedRoutes, Modules } from '@urls';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
@Component({
  selector: 'add-consultation',
  templateUrl: './add-consultation.component.html',
  styleUrls: ['./add-consultation.component.scss']
})
export class AddConsultationComponent implements OnInit, OnDestroy {

  public dyForm: FormGroup;
  private submitSubscription: Subscription;
  private routeSubscription: Subscription;
  private closeSubscription: Subscription;
  private confirmationProcessSubscription: Subscription;

  constructor(private resourceService: ResourceService, private router: Router, private sanitizer: DomSanitizer, public dataService: DataService, private notificationService: NotificationService) {
    this.dyForm = this.createForm();
    this.onRouting();
  }
  ngOnInit(): void {
    if (this.submitSubscription) { this.submitSubscription.unsubscribe(); }
    this.submitSubscription = this.resourceService.submitEvent.subscribe(event => {
      if (event) {
        this.onSubmitForm();
      }
    });

    if (this.closeSubscription) { this.closeSubscription.unsubscribe(); }
    this.closeSubscription = this.resourceService.cancelEvent.subscribe(() => {
      this.dataService.notify.next({ key: eMessageType.Warning, value: "Are you sure you want to cancel?", icon: eMessageIcon.Warning });
      if (this.confirmationProcessSubscription) { this.confirmationProcessSubscription.unsubscribe() }
      this.confirmationProcessSubscription = this.notificationService.confirmationProcess.subscribe((data) => {
        if (data) { this.router.navigateByUrl(`${FixedRoutes.Settings}/${FixedRoutes.ConsultationDetails}`); }
      });
    });
  }
  createForm(): FormGroup {
    return new FormGroup({
      code: new FormControl('', Validators.required),
      name: new FormControl('', Validators.required),
      defaultPrice: new FormControl('', Validators.required)
    })
  }

  onSubmitForm(): void {
    if (this.dyForm.valid) {
      let data = {
        ...this.dyForm.value
      }
      this.dataService.postData(Modules.Consultation, { ...data }).then((response) => {
        this.dyForm.patchValue(data);
        this.router.navigateByUrl(`${FixedRoutes.Settings}/${FixedRoutes.ConsultationDetails}`);

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
        if (this.router.url === `/${FixedRoutes.Settings}/${FixedRoutes.ConsultationEdit}`) {
          let cosultationData = <Consultation>this.router.getCurrentNavigation().extras.state;
          if (cosultationData || cosultationData.id) {
            cosultationData = { ...cosultationData }
            this.dyForm.patchValue(cosultationData)
            this.dyForm.patchValue(cosultationData)
          }
          else { this.router.navigate([FixedRoutes.Settings]); }
        }
        this.routeSubscription.unsubscribe();
      });
  }
  ngOnDestroy(): void {
    if (this.closeSubscription) { this.closeSubscription.unsubscribe(); }
    if (this.submitSubscription) { this.submitSubscription.unsubscribe(); }
    if (this.routeSubscription) { this.routeSubscription.unsubscribe(); }
  }
}
