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
import { Order, OrderService } from '@services/model/clinic.model';
import { PaymentDetailsComponent } from '../payment-details/payment-details.component';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-payment-header',
  templateUrl: './payment-header.component.html',
  styleUrls: ['./payment-header.component.scss']
})
export class PaymentHeaderComponent  {
  
  public appointmentDetails: any;
  private routeSubscription: Subscription;
  public physician: Physician;
  public appointmentStatus = AppointmentStatus;
  public services: OrderService[] = [];
  private responseData: any;
  @ViewChild('servicesClinicOrder') servicesClinicOrder: PaymentDetailsComponent;
  constructor(private router: Router, public clinicService: ClinicService, public documentationService: DocumentationService, private resourceService: ResourceService, private dataService: DataService) {
    this.onRouting();
  }

  onRouting(): void {
    let getData = JSON.parse(sessionStorage.getItem('User'));
    if (this.routeSubscription) { this.routeSubscription.unsubscribe(); }
    this.routeSubscription = this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      if (this.router.url.indexOf(`/${FixedRoutes.Order}/${FixedRoutes.paymentHeader}`) !== -1) {
        this.resourceService.currentPatient = null;
        let appointment =this.router.getCurrentNavigation().extras.state;
          this.appointmentDetails = appointment;
          this.resourceService.currentPatient = appointment.patient;
          this.resourceService.currentPatientData=appointment;
          this.resourceService.currentSpecialities=appointment?.doctors?.specialities;
          if(!this.resourceService.currentPatient.dateOfBirth){
            this.dataService.getData(`${Modules.ByDateRangeAndDocCode}?StartDate=${formatDate(new Date(appointment.appointmentDateTime), "MM-dd-YYYY", "en-Us")}&EndDate=${formatDate(new Date(appointment.appointmentDateTime), "MM-dd-YYYY", "en-Us")}&Hosp_Code=${getData.hosp_Code}&Speciality_Code=${appointment.speciality_Code}&Doctor_Code=${appointment.doctor_Code}`).then((res:any) => {
            if(res){
              this.responseData=res.appointments.filter((d)=>d.patient.medicalRecordNumber === appointment.patient.medicalRecordNumber)
              this.resourceService.currentPatient = this.responseData[0]?.patient;
              this.resourceService.currentPatientData=this.responseData[0];
              this.appointmentDetails = this.responseData[0];
            this.resourceService.currentSpecialities=this.responseData[0]?.doctors?.specialities;
            }
            })
        }
      this.routeSubscription.unsubscribe();
      }
    });
  }

  // Save added data of document before moving to other tab
  onMoveFromDocTab(): void {

  }

  print() {

    this.services = this.clinicService.filterService();
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
