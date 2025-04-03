import { formatDate } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ClinicService } from '@services/clinic.service';
import { DataService } from '@services/data.service';
import { ResourceService } from '@services/resource.service';
import { SearchPatientPopupComponent } from '@shared/component/search-patient-popup/search-patient-popup.component';
import { GlobalSearchFilter } from '@shared/pipes/global-search.pipe';
import { FixedRoutes, Modules } from '@urls';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-laboratory',
  templateUrl: './laboratory.component.html',
  styleUrls: ['./laboratory.component.scss'],
  providers:[GlobalSearchFilter]
})
export class LaboratoryComponent implements OnInit {

  public selectedClinicDateSubscription: Subscription;
  private nextEventSUbscription: Subscription;
  private prevEventSUbscription: Subscription;
  public laboratoryList:any[]=[]
  public searchSubscription:Subscription;
  public isIPadAir = false;
  public laboratoryBilledData:any[];
  public laboratoryBilledDataBackup: any[];
  public laboratoryNotBilledData: any[];
  public laboratoryNotBilledBackup:any[];
  private laboratoryData:any[]=[];
  private SearchLaboratorySUbscription: Subscription;
  public selectedDate: Date = new Date();
  @ViewChild('searchPatient')searchPatient:SearchPatientPopupComponent
  orderService:any[]=[];
  onResizeEvent() {
    window.innerWidth < 1260 ? this.isIPadAir = true : this.isIPadAir = false;
  }
  constructor( public resourceService: ResourceService, public globalSearch:GlobalSearchFilter, private dataService: DataService,private clinicService:ClinicService,private router:Router) { 
    this.resourceService.dayOnlyAppointmentLabel = `Today`;
    window.innerWidth < 1260 ? this.isIPadAir = true : this.isIPadAir = false;
    this.resourceService.clinicDate = this.selectedDate;
    if (this.searchSubscription) { this.searchSubscription.unsubscribe(); }
    this.searchSubscription=this.resourceService.searchQuerySubject.subscribe((res) => {
      const fieldNames:string[] = ["patient.medicalRecordNumber","patient.gender","patient.familyName","patient.thirdName","patient.secondName","patient.firstName","doctors.specialities.speciality_desc","doctors.doctor_Name","dateTime","orderServices.desiredTime","dateTime","service.name","service.comment"]
      this.laboratoryBilledData = this.globalSearch.transform(this.laboratoryBilledDataBackup, res, fieldNames);
      this.laboratoryNotBilledData=this.globalSearch.transform(this.laboratoryNotBilledBackup, res, fieldNames);
    });

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
    if (this.selectedClinicDateSubscription) {this.selectedClinicDateSubscription.unsubscribe();}
    this.selectedClinicDateSubscription = this.resourceService.selectedClinicDate.subscribe((data: Date) => {
      if (data) {
        this.onload(data);
        this.selectedDate = data;
        this.resourceService.dayOnlyAppointmentLabel = this.getSelectedDate();
        this.resourceService.clinicDate = data;
      }
    });
    if (this.SearchLaboratorySUbscription) { this.SearchLaboratorySUbscription.unsubscribe() }
    this.SearchLaboratorySUbscription = this.clinicService.submitEvent.subscribe((resp) => { this.searchPatient.showPopup() })
  }

  ngOnInit(): void {
  }
  // onload(date: Date): void {
  //   const setData=JSON.parse(sessionStorage.getItem('User'));
  //     this.dataService.getData<[]>(`${Modules.getLaboratory}?Hosp_Code=${ setData.hosp_Code}&data=${formatDate(date, "MM-dd-YYYY", "en-Us")}`).then((data :any[]) => {
  //       this.laboratoryBilledData = [];
  //       this.laboratoryNotBilledData = [];
  //       this.laboratoryList=data;
  //       this.resourceService.totalRecords.next(this.laboratoryList.length);
  //       this.laboratoryData=data;
  //       data.forEach(item => {
  //         this.orderService.push(item.orderServices)
  //         this.laboratoryList=data;
  //           const allServicesPaid = item.orderServices.every(service => service.isPaid);
  //           if (allServicesPaid) {
  //               this.laboratoryBilledData.push(item);
  //               this.laboratoryBilledDataBackup=this.laboratoryBilledData;
  //           } else {
  //               this.laboratoryNotBilledData.push(item);
  //               this.laboratoryNotBilledBackup = this.laboratoryNotBilledData;

  //           }
  //       });
  //   });
  // }

  onload(date: Date): void {
    const setData=JSON.parse(sessionStorage.getItem('User'));
      this.dataService.getData<[]>(`${Modules.getLaboratory}?Hosp_Code=${ setData.hosp_Code}&data=${formatDate(date, "MM-dd-YYYY", "en-Us")}`).then((data :any[]) => {
        this.laboratoryBilledData = [];
        this.laboratoryNotBilledData = [];
        this.laboratoryList=data;
        this.resourceService.totalRecords.next(this.laboratoryList.length);
        this.laboratoryData=data;
        data.forEach(item => {
          const hasUnpaidServices = item.orderServices.some(service => !service.isPaid);
          this.orderService.push(item.orderServices)
          this.laboratoryList=data;
            if (!hasUnpaidServices) {
                this.laboratoryBilledData.push(item);
                this.laboratoryBilledDataBackup=this.laboratoryBilledData;
            } else {
                this.laboratoryNotBilledData.push(item);
                this.laboratoryNotBilledBackup = this.laboratoryNotBilledData;

            }
        });
    });
  }
  isAllOrderServicesPaid(data: any): boolean {
    return data.orderServices.every(os => os.isPaid);
  }
  getSelectedDate() {
    return `${this.convertToFormattedDate(this.selectedDate, "dd MMM, yyyy | EEEE")}` === `${this.convertToFormattedDate(new Date(), "dd MMM, yyyy | EEEE")}` ? 'Today' : `${this.convertToFormattedDate(this.selectedDate, "dd MMM, yyyy | EEEE")}`;
  }
  convertToFormattedDate(date: Date, format: string) {
    return formatDate(date, format, "en-US");
  }
  onPayment(data:any){
    this.router.navigate([`${FixedRoutes.Order}/${FixedRoutes.OrderDetails}`], { state: data });
  }
  ngOnDestroy(): void {
    if(this.selectedClinicDateSubscription) this.selectedClinicDateSubscription.unsubscribe();
    if(this.nextEventSUbscription) this.nextEventSUbscription.unsubscribe();
    if(this.prevEventSUbscription) this.prevEventSUbscription.unsubscribe();
    if(this.SearchLaboratorySUbscription) this.SearchLaboratorySUbscription.unsubscribe();  
  }
}
