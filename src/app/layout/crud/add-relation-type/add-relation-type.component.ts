import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { CrudService } from '@services/crud.service';
import { DataService } from '@services/data.service';
import { eMessageIcon, eMessageType } from '@services/model/data.service.model';
import { PatientRelationship } from '@services/model/option.model';
import { NotificationService } from '@services/notification.service';
import { ResourceService } from '@services/resource.service';
import { FixedRoutes, Modules } from '@urls';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'add-relation-type',
  templateUrl: './add-relation-type.component.html',
  styleUrls: ['./add-relation-type.component.scss']
})
export class AddRelationTypeComponent implements OnInit, OnDestroy {
  public dyForm: FormGroup;
  private submitSubscription: Subscription;
  private routeSubscription: Subscription;
  private closeSubscription: Subscription;
  private confirmationProcessSubscription: Subscription;

  constructor(public crudService: CrudService, private resourceService: ResourceService, private router: Router, public dataService: DataService, private notificationService: NotificationService) {
    this.dyForm = this.createForm();
    this.onRouting()
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
        if (data) { this.router.navigateByUrl(`${FixedRoutes.Settings}/${FixedRoutes.PatientRelations}`); }
      });
    });
  }
  createForm(): FormGroup {
    return new FormGroup({
      name: new FormControl('', Validators.required),
    })
  }
  onSubmitForm(): void {
    let data = {
      ...this.dyForm.value
    }
    if (this.dyForm.valid) {
      this.dataService.postData(Modules.PatientRelationship, { ...data }).then((response) => {
        this.dyForm.patchValue(data);
        this.router.navigateByUrl(`${FixedRoutes.Settings}/${FixedRoutes.PatientRelations}`);
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
        if (this.router.url === `/${FixedRoutes.Settings}/${FixedRoutes.RegisterRelationEdit}`) {
          let PatientData = <PatientRelationship>this.router.getCurrentNavigation().extras.state;
          if (PatientData || PatientData.id) {
            this.dyForm.patchValue(PatientData)
          }
          // else { this.router.navigate([FixedRoutes.Crud]); }
        }
        this.routeSubscription.unsubscribe();
      });
  }
  getPatient(data: string) {
    if (data.length >= 6) {
      this.dataService.getData<PatientRelationship[]>(Modules.PatientRelationshipById, data).then((resp) => {
        if (resp && resp.length) {
          this.dyForm.patchValue({ ...this.dyForm.value });
        }
      });
    }
  }
  ngOnDestroy(): void {
    if (this.closeSubscription) { this.closeSubscription.unsubscribe(); }
    if (this.submitSubscription) { this.submitSubscription.unsubscribe(); }
    if (this.routeSubscription) { this.routeSubscription.unsubscribe(); }
  }
}
