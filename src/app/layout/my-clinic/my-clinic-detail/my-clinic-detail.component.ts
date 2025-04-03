import { Component, OnDestroy, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ClinicService } from '@services/clinic.service';
import { DataService } from '@services/data.service';
import { DocumentationService } from '@services/documentation.service';
import { Appointment, AppointmentIsClinic, AppointmentStatus } from '@services/model/appointment.model';
import { StatusFlags, eMessageIcon, eMessageType } from '@services/model/data.service.model';
import { Physician } from '@services/model/physician.model';
import { ResourceService } from '@services/resource.service';
import { FixedRoutes, Modules } from '@urls';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ServicesClinicOrderComponent } from './services-clinic-order/services-clinic-order.component';
import { Order, OrderService } from '@services/model/clinic.model';

@Component({
  selector: 'my-clinic-detail',
  templateUrl: './my-clinic-detail.component.html',
  styleUrls: ['./my-clinic-detail.component.scss'],
})
export class MyClinicDetailComponent implements OnDestroy {
  public appointmentDetails: Appointment;
  private routeSubscription: Subscription;
  public physician: Physician;
  public appointmentStatus = AppointmentStatus;
  public currentActiveTab: string = 'Services';
  public services: OrderService[] = [];
  @ViewChild('servicesClinicOrder') servicesClinicOrder: ServicesClinicOrderComponent;
  constructor(private router: Router, public clinicService: ClinicService, public documentationService: DocumentationService, private resourceService: ResourceService, private dataService: DataService) {
    this.onRouting();
    this.clinicService.changeTab.subscribe((resp) => {
      this.currentActiveTab = resp;
      this.onTabNavigation(resp)
    })
  }

  onRouting(): void {
    if (this.routeSubscription) { this.routeSubscription.unsubscribe(); }
    this.routeSubscription = this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      if (this.router.url.indexOf(`/${FixedRoutes.MyClinic}/${FixedRoutes.MyClinicDetails}`) !== -1) {
        this.resourceService.currentPatient = null;
        let appointment = <Appointment>(this.router.getCurrentNavigation().extras.state);
        if (appointment && appointment.id) {
          this.appointmentDetails = appointment;
          this.resourceService.currentPatient = appointment.patient;
          this.resourceService.currentPatientData=appointment;
          this.resourceService.currentSpecialities=appointment.specialities;
        }
        else {
          this.router.navigate([FixedRoutes.MyClinic]);
        }
      }
      this.routeSubscription.unsubscribe();
    });
  }

  onTabNavigation(data: any): void {
    if (this.appointmentDetails.appointmentStatus === AppointmentStatus.ClosedEncounter && data === "Services") {
      this.dataService.notify.next({ key: eMessageType.Error, value: "Patient is Closed Encounter!", icon: eMessageIcon.Error });
    } else {
      if (data) {
        if (this.currentActiveTab === 'Documentation') {
          this.clinicService.currentNavigatedTab.next({ type: 'navigation', data: data });
        } else {
          this.clinicService.currentSubActiveTab = 'Visit-Note';
          this.currentActiveTab = data;
        }
      }
    }

    if(this.currentActiveTab === 'Patient-Profile'){
      this.clinicService.displayConsultation.next(true);
    } 
  }

  // Save added data of document before moving to other tab
  onMoveFromDocTab(): void {

  }

  print() {

    this.services = this.clinicService.filterService();
  }

  onSubTabNavigation(data: any): void {
    if (data) {
      if (this.currentActiveTab === 'Documentation') {
        this.clinicService.currentNavigatedTab.next({ type: 'sub-navigation', data: data });
      }
    }
  }

  AppointmentPatientCloseEncounter(id: number) {
    this.dataService.post<AppointmentIsClinic>(Modules.AppointmentPatientCloseEncounter, { id: id, appointmentStatus: AppointmentStatus.ClosedEncounter, updatedBy:this.appointmentDetails.updatedBy }).then((response) => {
      if (response.status === StatusFlags.Success) {
        this.router.navigate([FixedRoutes.MyClinic]);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) { this.routeSubscription.unsubscribe(); }
  }
  showhidePatients() {
    this.servicesClinicOrder.showhidePatients();
  }


}
