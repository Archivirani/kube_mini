import { formatDate } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ClinicService } from '@services/clinic.service';
import { DataService } from '@services/data.service';
import { ResourceService } from '@services/resource.service';
import { SearchPatientPopupComponent } from '@shared/component/search-patient-popup/search-patient-popup.component';
import { GlobalSearchFilter } from '@shared/pipes/global-search.pipe';
import { FixedRoutes, Modules } from '@urls';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-radiology',
  templateUrl: './radiology.component.html',
  styleUrls: ['./radiology.component.scss'],
  providers:[GlobalSearchFilter]
})
export class RadiologyComponent implements OnInit,OnDestroy {
  public selectedClinicDateSubscription: Subscription;
  private nextEventSUbscription: Subscription;
  private SearchPatientSUbscription: Subscription;
  private prevEventSUbscription: Subscription;
  public selectedDate: Date = new Date();
  public radiologyBilledData:any;
  public radiologyNotBilledData:any[]=[]
  public searchSubscription:Subscription;
  public radiologyNotBilledDataBackup:any[]=[];
  public radiologyBilledDataBackup:any[]=[]
  public radiologyList: any[] = [];
  public orderId:any;
  public checkDropdown: boolean = false;

  @ViewChild('searchPatient')searchPatient:SearchPatientPopupComponent
  constructor(private dataService:DataService , private resourceService:ResourceService , private clinicService:ClinicService, private router:Router,private globalSearch: GlobalSearchFilter) {  this.resourceService.dayOnlyAppointmentLabel = `Today`;
    this.resourceService.clinicDate = this.selectedDate;

    if (this.nextEventSUbscription) { this.nextEventSUbscription.unsubscribe(); }
    this.nextEventSUbscription = this.resourceService.nextEvent.subscribe((data: any) => {
      if (data) {
        this.onload(new Date(this.selectedDate.setDate(this.selectedDate.getDate() + 1)));
        this.resourceService.dayOnlyAppointmentLabel = this.getSelectedDate();
        this.resourceService.clinicDate = this.selectedDate;
      }
    });
    if (this.prevEventSUbscription) { this.prevEventSUbscription.unsubscribe(); }
    this.prevEventSUbscription = this.resourceService.prevEvent.subscribe((data: any) => {
      if (data) {
        this.onload(new Date(this.selectedDate.setDate(this.selectedDate.getDate() - 1)));
        this.resourceService.dayOnlyAppointmentLabel = this.getSelectedDate();
        this.resourceService.clinicDate = this.selectedDate;
      }
    });
    if (this.searchSubscription) { this.searchSubscription.unsubscribe(); }
    this.searchSubscription=this.resourceService.searchQuerySubject.subscribe((res) => {
      const fieldNames = ["patient.medicalRecordNumber", "patient.firstName","patient.secondName","patient.thirdName" ,"patient.familyName", "patient.gender","patient.contactNo1", "patient.dateOfBirth", "doctors.doctor_Name", "doctors.specialities.speciality_desc" ,"dateTime" ,"orderServices.desiredTime","service.name"]
      this.radiologyBilledData = this.globalSearch.transform(this.radiologyBilledDataBackup, res, fieldNames);
      this.radiologyNotBilledData = this.globalSearch.transform(this.radiologyNotBilledDataBackup, res, fieldNames);
    });
    if (this.selectedClinicDateSubscription) {
      this.selectedClinicDateSubscription.unsubscribe();
    }
    this.selectedClinicDateSubscription = this.resourceService.selectedClinicDate.subscribe((data: Date) => {
      if (data) {
        this.onload(data);
        this.selectedDate = data;
        this.resourceService.dayOnlyAppointmentLabel = this.getSelectedDate();
        this.resourceService.clinicDate = data;
      }
    });

    if (this.SearchPatientSUbscription) { this.SearchPatientSUbscription.unsubscribe() }
    this.SearchPatientSUbscription = this.clinicService.submitEvent.subscribe((resp) => { this.searchPatient.showPopup() })
  }
  
  
  ngOnInit(): void {
  }
  getSelectedDate() {
    return `${this.convertToFormattedDate(this.selectedDate, "dd MMM, yyyy | EEEE")}` === `${this.convertToFormattedDate(new Date(), "dd MMM, yyyy | EEEE")}` ? 'Today' : `${this.convertToFormattedDate(this.selectedDate, "dd MMM, yyyy | EEEE")}`;
  }
  convertToFormattedDate(date: Date, format: string) {
    return formatDate(date, format, "en-US");
  }
  onEdit(data){
    if(data.appointment?.appointmentType.name === "walk-in"){
    this.checkDropdown = true
    this.orderId=data.orderServices[0].orderId;
    }
  }
  // onload(date: Date): void {
  //   const setData=JSON.parse(sessionStorage.getItem('User'));
  //     this.dataService.getData<[]>(`${Modules.getRadiologyPatients}?Hosp_Code=${ setData.hosp_Code}&data=${formatDate(date, "MM-dd-YYYY", "en-Us")}`).then((data:any) => {
  //       this.radiologyBilledData=[];
  //       this.radiologyNotBilledData=[]
  //       this.radiologyList = data;
  //       this.resourceService.totalRecords.next(this.radiologyList.length);
  //       data.forEach((item ,index)=> {
  //         const allServicesPaid = item.orderServices.every(service => service.isPaid);
  //         if (allServicesPaid) {
  //             this.radiologyBilledData.push(item);
  //             this.radiologyBilledDataBackup=this.radiologyBilledData;
  //             item.orderServices.map((s)=>{
  //               if(s.reportStatus === null){
  //                 s.reportStatus="Not Done"
  //               }

  //             })
  //         } else {
  //             this.radiologyNotBilledData.push(item);
  //             this.radiologyNotBilledDataBackup=this.radiologyNotBilledData;
  //             item.orderServices.map((s)=>{
  //               if(s.reportStatus === null){
  //                 s.reportStatus="Not Done"
  //               }
  //             })
  //         }
  //     });
  //     });
  // }

  onload(date: Date): void {
    const setData = JSON.parse(sessionStorage.getItem('User'));
    this.dataService.getData<[]>(`${Modules.getRadiologyPatients}?Hosp_Code=${setData.hosp_Code}&data=${formatDate(date, "MM-dd-YYYY", "en-Us")}`).then((data: any) => {
        this.radiologyBilledData = [];
        this.radiologyNotBilledData = [];
        this.radiologyList = data;
        this.resourceService.totalRecords.next(this.radiologyList.length);

        data.forEach((item) => {
            const hasUnpaidServices = item.orderServices.some(service => !service.isPaid);

            if (!hasUnpaidServices) {
                this.radiologyBilledData.push(item);
                this.radiologyBilledDataBackup = this.radiologyBilledData;
                item.orderServices.forEach((s) => {
                    if (s.reportStatus === null) {
                        s.reportStatus = "Not Done";
                    }
                });
            } else {
                this.radiologyNotBilledData.push(item);
                this.radiologyNotBilledDataBackup = this.radiologyNotBilledData;

                item.orderServices.forEach((s) => {
                    if (s.reportStatus === null) {
                        s.reportStatus = "Not Done"; 
                    }
                });
            }
        });
    });
}


  onPayment(data){
    this.router.navigate([`${FixedRoutes.Order}/${FixedRoutes.OrderDetails}`], { state: data });
  }
  isAllOrderServicesPaid(data: any): boolean {
    return data.orderServices.every(os => os.isPaid);
  }
  saveReportStatus(data,event:any){
   const reportStatus=event
    const getData=JSON.parse(sessionStorage.getItem('User'))
    let payload = data.orderServices.map(ele => {
      return {
        id: ele.id  
      }});

      let ids = payload.map(obj => obj.id);
   this.dataService.post(`${Modules.changeOrderReportStatus}?Report=${reportStatus}`, ids.join(',').split(',')).then((res:any)=>{
    Swal.fire({
      title: 'Report Status Changed Successfully',
      icon: 'success',
      showCancelButton: false,
      showConfirmButton: true,
      confirmButtonText: "Ok",
      confirmButtonColor: '#3f7473',
      customClass: {
        container: 'notification-popup'
      }
    })
      this.onload(this.selectedDate)
   });
 }

 saveRadiologyStatus(data,event:any){
  this.checkDropdown=false;
  const radStatus = event
  this.dataService.postData(`${Modules.changeRadiologyStatus}?Id=${this.orderId}&Status=${radStatus}`).then((res:any)=>{
    Swal.fire({
      title: 'Appointment Status Changed Successfully',
      icon: 'success',
      showCancelButton: false,
      showConfirmButton: true,
      confirmButtonText: "Ok",
      confirmButtonColor: '#3f7473',
      customClass: {
        container: 'notification-popup'
      }
    })
      this.onload(this.selectedDate)
   });
 }
  
  ngOnDestroy(): void {
  if (this.SearchPatientSUbscription) { this.SearchPatientSUbscription.unsubscribe()}
  if (this.prevEventSUbscription) { this.prevEventSUbscription.unsubscribe(); }
  if (this.nextEventSUbscription) { this.nextEventSUbscription.unsubscribe(); }
  if (this.selectedClinicDateSubscription) {
    this.selectedClinicDateSubscription.unsubscribe();
  }
}
}