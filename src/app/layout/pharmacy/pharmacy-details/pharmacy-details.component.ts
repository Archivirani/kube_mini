import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ClinicService } from '@services/clinic.service';
import { DataService } from '@services/data.service';
import { DocumentationService } from '@services/documentation.service';
import { Appointment } from '@services/model/appointment.model';
import { ResourceService } from '@services/resource.service';
import { FixedRoutes, Modules } from '@urls';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-pharmacy-details',
  templateUrl: './pharmacy-details.component.html',
  styleUrls: ['./pharmacy-details.component.scss']
})
export class PharmacyDetailsComponent implements OnInit {
  public pharmacyUserData :any;
  public routeSubscription:Subscription
  public pharmacyDetails:Appointment;
  private responseData: any;
  constructor(private resourceService:ResourceService,private router:Router,public documentationService:DocumentationService,public clinicService:ClinicService,private dataService:DataService) { 
    this.onRouting();
    this.pharmacyUserData = this.router.getCurrentNavigation()?.extras?.state
    
  }

  ngOnInit(): void {
  }

  onRouting(): void {
    let getData = JSON.parse(sessionStorage.getItem('User'));
    if (this.routeSubscription) { this.routeSubscription.unsubscribe(); }
    this.routeSubscription = this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      if (this.router.url.indexOf(`/${FixedRoutes.Radiology}/${FixedRoutes.RadiologyDetails}`) !== -1) {
        this.resourceService.currentPatient = null;
        let appointment = <any>(this.router.getCurrentNavigation().extras.state);
        if (appointment) {
          this.pharmacyDetails = appointment;
          this.resourceService.currentPatient = appointment?.patient;
          this.resourceService.currentPatientData=appointment;
          // if(!this.resourceService.currentPatient.dateOfBirth){
          //   this.dataService.getData<Appointment[]>(`${Modules.ByDateRangeAndDocCode}?StartDate=${formatDate(new Date(appointment.appointmentDateTime), "MM-dd-YYYY", "en-Us")}&EndDate=${formatDate(new Date(appointment.appointmentDateTime), "MM-dd-YYYY", "en-Us")}&Hosp_Code=${getData.hosp_Code}&Speciality_Code=${appointment.speciality_Code}&Doctor_Code=${appointment.doctor_Code}`).then((res:any) => {
          //   if(res){
          //     this.responseData=res.appointments.filter((d)=>d.patient.medicalRecordNumber === appointment.patient.medicalRecordNumber)
          //     this.resourceService.currentPatient = this.responseData[0]?.patient;
          //     this.resourceService.currentPatientData=this.responseData[0];
          //   this.resourceService.currentSpecialities=this.responseData[0]?.doctors?.specialities;
          //   }
          // })
          // }
        }
      }
      this.routeSubscription.unsubscribe();
    });
  }
}