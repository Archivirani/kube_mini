import { Component, OnInit, ViewChild } from '@angular/core';
import { Appointment, AppointmentIsClinic, AppointmentStatus } from '@services/model/appointment.model';
import { Physician } from '@services/model/physician.model';
import { Subscription } from 'rxjs';
import { ClinicService } from '@services/clinic.service';
import { DocumentationService } from '@services/documentation.service';
import { NavigationEnd, Router } from '@angular/router';
import { ResourceService } from '@services/resource.service';
import { filter } from 'rxjs/operators';
import { FixedRoutes, Modules } from '@urls';
import { EmergencyServicesComponent } from '../emergency-services/emergency-services.component';
import { OrderService } from '@services/model/clinic.model';
import { DataService } from '@services/data.service';
import { eMessageIcon, eMessageType, StatusFlags } from '@services/model/data.service.model';

@Component({
  selector: 'app-emergency-patient-detail',
  templateUrl: './emergency-patient-detail.component.html',
  styleUrls: ['./emergency-patient-detail.component.scss']
})
export class EmergencyPatientDetailComponent  {

  public appointmentDetails: any;
  public appointment: any;
  private routeSubscription: Subscription;
  public physician: Physician;
  public currentActiveTab: string = 'Services';
  public services: OrderService[] = [];
  @ViewChild('patientService') servicesClinicOrder: EmergencyServicesComponent;
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
      if (this.router.url.indexOf(`/${FixedRoutes.ErPatient}/${FixedRoutes.Erpatientdetails}`) !== -1) {
        this.resourceService.currentPatient = null;
        let appointment = <Appointment>(this.router.getCurrentNavigation().extras.state);
        if (appointment && appointment.id) {
          this.appointmentDetails = appointment?.patientAdmission;
          this.appointment = <Appointment>(this.router.getCurrentNavigation().extras.state);
          this.resourceService.currentPatient = appointment.patientAdmission.patient;
          this.resourceService.currentPatientData=appointment;
          this.resourceService.currentSpecialities=appointment.specialities;
          this.resourceService.currentFloors=appointment.floors;
          this.resourceService.currentRooms=appointment.rooms;
          this.resourceService.currentBeds=appointment.bads;
        }
        else {
          this.router.navigate([FixedRoutes.ErPatient]);
        }
      }
      this.routeSubscription.unsubscribe();
    });
  }

  onTabNavigation(data: any): void {
    if (this.appointment.appointmentStatus === AppointmentStatus.ClosedEncounter && data === "Services") {
     this.currentActiveTab=data;
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
    this.dataService.post<AppointmentIsClinic>(Modules.AppointmentPatientCloseEncounter, { id: id, appointmentStatus: AppointmentStatus.ClosedEncounter }).then((response) => {
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
