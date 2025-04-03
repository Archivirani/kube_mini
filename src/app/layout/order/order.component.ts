import { DatePipe, formatDate } from '@angular/common';
import { Component, ComponentRef, HostListener, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '@services/data.service';
import { Patient } from '@services/model/patient.model';
import { FixedRoutes, Modules } from '@urls';
import { InvoiceGeneratorComponent } from './invoice-generator/invoice-generator.component';
import { Order, OrderService } from '@services/model/clinic.model';
import { InvoiceHistoryPopupComponent } from './invoice-history-popup/invoice-history-popup.component';
import { ResourceService } from '@services/resource.service';
import { Subscription } from 'rxjs';
import { FilterModel } from '@services/model/filter.model';
import { FilterPipe } from '@shared/pipes/filter.pipe';
import Swal from 'sweetalert2';
import { AppointmentService } from '@services/appointment.service';
import { GlobalSearchFilter } from '@shared/pipes/global-search.pipe';
import { ReasonPopupComponent } from '@shared/component/reason-popup/reason-popup.component';
import { NotificationService } from '@services/notification.service';
import { ReciptPopupComponent } from './recipt-popup/recipt-popup.component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ClinicService } from '@services/clinic.service';
import { SearchPatientPopupComponent } from '@shared/component/search-patient-popup/search-patient-popup.component';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss'],
  providers: [FilterPipe,GlobalSearchFilter,BsModalService]
})
export class OrderComponent implements OnDestroy,OnInit {
  public visibleData: Order[];
  private modalRef: BsModalRef;
  public visibleDataBackup:any[];
  public visibleNotBilledBackup:any[];
  public visibleBilledData: Order[];
  public visibleNotBilledData: Order[];
  private invoice: boolean = false;
  public searchSubscription:Subscription;
  public isIPadAir = false;
  public selectedDate: Date = new Date();
  private nextEventSUbscription: Subscription;
  private prevEventSUbscription: Subscription;
  private searchEventSubscription: Subscription;
  public selectedClinicDateSubscription: Subscription;
  private downloadPaymentSubscription: Subscription;
  private confirmationSubscription: Subscription;
  public onCloseSubscription: Subscription;
  public filterSubscription:Subscription
  private admitPatientEventSUbscription: Subscription;
  public userTypeId:number;
  public startDate:any;
  public endDate:any;
  public isFilter: boolean = false;
  public orderList: Order[] = [];
  @HostListener('window:load', ['$event'])
  @HostListener('window:resize', ['$event'])
  onResizeEvent() {
    window.innerWidth < 1260 ? this.isIPadAir = true : this.isIPadAir = false;
  }
  @ViewChild("generateInvoice") generateInvoice: InvoiceGeneratorComponent;
  @ViewChild("invoiceHistoryPopup") invoiceHistoryPopup: InvoiceHistoryPopupComponent;
  @ViewChild('reasonPopup') reasonPopup: ReasonPopupComponent;
  @ViewChild('reciptpopup') reciptpopup: ReciptPopupComponent;
  @ViewChild('filterPopup', { static: true }) filterPopup: TemplateRef<any>;
  @ViewChild("searchPopup") SearchPatientPopupComponent: SearchPatientPopupComponent;
  constructor(private filter: FilterPipe, private dataService: DataService, private router: Router, private resourceService: ResourceService , private appointmentService : AppointmentService,private globalSearch:GlobalSearchFilter , private notificationService : NotificationService , private modalService: BsModalService ,private clinicService:ClinicService) {
    this.onload(this.selectedDate); window.innerWidth < 1260 ? this.isIPadAir = true : this.isIPadAir = false;
    this.resourceService.paymentDate = this.selectedDate;
    this.resourceService.dayOnlyAppointmentLabel = this.getSelectedDate();
    if (this.searchSubscription) { this.searchSubscription.unsubscribe(); }
    this.searchSubscription=this.resourceService.searchQuerySubject.subscribe((res) => {
      const fieldNames = ["patient.medicalRecordNumber","comment","patient.contactNo1","patient.dateOfBirth","patient.gender","patient.familyName","patient.thirdName","patient.secondName","patient.firstName","patientRoomsAssigned.patientAdmission.caseTypesTbl.caseName","caseTypesTbl.caseName","patientRoomsAssigned.patientAdmission.attendDoctor.doctor_Name","appointment.doctors.doctor_Name","appointment.specialities.speciality_desc","patientRoomsAssigned.specialities.speciality_desc"]
      this.visibleBilledData = this.globalSearch.transform(this.visibleDataBackup, res, fieldNames);
      this.visibleNotBilledData=this.globalSearch.transform(this.visibleNotBilledBackup, res, fieldNames);
    });
    if(this.downloadPaymentSubscription) { this.downloadPaymentSubscription.unsubscribe(); }
    this.downloadPaymentSubscription =this.appointmentService.downloadAppointment.subscribe((data) => {
      if (data) {
       this.onDownloadPaymentFile()
      }
    });
    if(this.filterSubscription) { this.filterSubscription.unsubscribe(); }
    this.filterSubscription =this.resourceService.submitEvent.subscribe((data) => {
      if (data) {
        this.startDate='';
        this.endDate='';
        this.modalRef = this.modalService.show(this.filterPopup, { backdrop: true, ignoreBackdropClick: false ,class:'filterPopup'});
      }
    });
    if (this.nextEventSUbscription) { this.nextEventSUbscription.unsubscribe(); }
    this.nextEventSUbscription = this.resourceService.nextEvent.subscribe((data: any) => {
      if (data) {
        this.onload(new Date(this.selectedDate.setDate(this.selectedDate.getDate() + 1)));
        this.resourceService.dayOnlyAppointmentLabel = this.getSelectedDate();
        this.resourceService.paymentDate = this.selectedDate;
      }
    });

    if (this.prevEventSUbscription) { this.prevEventSUbscription.unsubscribe(); }
    this.prevEventSUbscription = this.resourceService.prevEvent.subscribe((data: any) => {
      if (data) {
        this.onload(new Date(this.selectedDate.setDate(this.selectedDate.getDate() - 1)));
        this.resourceService.dayOnlyAppointmentLabel = this.getSelectedDate();
        this.resourceService.paymentDate = this.selectedDate;
      }
    });
    this.searchEventSubscription = this.resourceService.searchEvent.subscribe((resp) => {
      const filterConfig: FilterModel = { fields: ['medicalRecordNumber', 'firstName', 'familyName', 'contactNo1'], searchText: resp };
      const data = this.filter.transform(this.visibleData, filterConfig);
      this.visibleBilledData = data.filter(d => d.isPaid);
      this.visibleNotBilledData = data.filter(d => !d.isPaid);
    })

    if (this.selectedClinicDateSubscription) {
      this.selectedClinicDateSubscription.unsubscribe();
    }
    this.selectedClinicDateSubscription = this.resourceService.selectedClinicDate.subscribe((data: Date) => {
      if (data) {
        this.onload(data);
        this.selectedDate = data;
        this.resourceService.dayOnlyAppointmentLabel = this.getSelectedDate();
        this.resourceService.paymentDate = data;
        // document.getElementById('calToday').setAttribute("style", "display:none;");
        // this.resourceService.isShowCalender = false;
        // this.resourceService.isShowArrow = true;
      }
    });
   
    if (this.admitPatientEventSUbscription) { this.admitPatientEventSUbscription.unsubscribe(); }
    this.admitPatientEventSUbscription = this.clinicService.admitPatientEvent.subscribe((res) => {
      this.SearchPatientPopupComponent.showPopup()  
      });
  }
ngOnInit() {
  this.clinicService.getServiceData();
  let setData=JSON.parse(sessionStorage.getItem('User'))
  this.userTypeId=setData.userTypeId
}
  onFilterCancel() {
    this.startDate= ' ';
    this.endDate= ' ';
    this.modalRef.hide();
  }
  onDownloadPaymentFile() {
    let getdata = JSON.parse(sessionStorage.getItem('User'));
    const formattedStartDate = this.startDate ? formatDate(this.startDate, "MM-dd-YYYY", "en-Us") : '';
    const formattedEndDate = this.endDate ? formatDate(this.endDate, "MM-dd-YYYY", "en-Us") : '';
    if (this.isFilter == true) {
      this.dataService.downloadFile(
        `${Modules.DownloadPaymentList}?startDate=${formattedStartDate}&EndDate=${formattedEndDate}&Hosp_Code=${getdata.hosp_Code}`,
        { startDate: formattedStartDate, endDate: formattedEndDate },
        `${new DatePipe('en-US').transform(new Date(), 'ddMMyyyyHHmmss')}.xlsx`
      );
    } else {
      const formattedStartDate = `${formatDate(this.selectedDate, "MM-dd-YYYY", "en-Us")}`;
      this.dataService.downloadFile(
        `${Modules.DownloadPaymentList}?startDate=${formattedStartDate}&EndDate=${formattedStartDate}&Hosp_Code=${getdata.hosp_Code}`,
        { startDate: formattedStartDate, endDate: formattedStartDate },
        `${new DatePipe('en-US').transform(new Date(), 'ddMMyyyyHHmmss')}.xlsx`
      );
    }
  }
  filterData(){
    this.isFilter = true;
    this.dataService.getData<Order[]>(`${Modules.PatientInOrder}?startDate=${formatDate(this.startDate, "MM-dd-YYYY", "en-Us")}&EndDate=${formatDate(this.endDate, "MM-dd-YYYY", "en-Us")}`).then((data: Order[]) => {
      this.orderList = data;
      this.resourceService.totalRecords.next(this.orderList.length);
      this.visibleBilledData = [];
      this.visibleNotBilledData = [];
      if (data && data.length) {
        data.forEach((element) => {
          element.patient.profileUrl = !!element.patient.profileUrl ? `${Modules.Images}${sessionStorage.TenantCode}/Images/${element.patient.profileUrl}` : ""
        });
        this.resourceService.dayOnlyAppointmentLabel=`${formatDate(this.startDate, "dd-MM-YYYY", "en-Us")} To ${formatDate(this.endDate, "dd-MM-YYYY", "en-Us")}`
        this.visibleData = data;
        this.visibleBilledData = data.filter(d => d.isPaid);
        this.visibleDataBackup=data.filter(d => d.isPaid);
        this.visibleNotBilledData = data.filter(d => !d.isPaid);
        this.visibleNotBilledBackup= data.filter(d => !d.isPaid);
        this.modalRef.hide();
      }
    });
  }
  onload(date: Date): void {
    this.dataService.getData<Order[]>(`${Modules.PatientInOrder}?startDate=${formatDate(date, "MM-dd-YYYY", "en-Us")}&EndDate=${formatDate(date, "MM-dd-YYYY", "en-Us")}`).then((data: Order[]) => {
      this.isFilter = false;
      this.orderList = data;
      this.resourceService.totalRecords.next(this.orderList.length);
      this.visibleBilledData = [];
      this.visibleNotBilledData = [];
      this.visibleDataBackup=[];
      if (data && data.length) {
        data.forEach((element) => {
          element.patient.profileUrl = !!element.patient.profileUrl ? `${Modules.Images}${sessionStorage.TenantCode}/Images/${element.patient.profileUrl}` : "";
          if(!element.orderServices.length && element.isPaid){
            this.visibleBilledData.push(element);
            return this.visibleDataBackup=this.visibleBilledData;
          }
          const allServicesPaid = element.orderServices.some(service => service.isPaid);
          if (allServicesPaid) {
            this.visibleBilledData.push(element);
            this.visibleDataBackup=this.visibleBilledData;
          }
        });
        this.visibleData = data;
        // this.visibleBilledData = data.filter(d => d.isPaid);
        // this.visibleDataBackup=data.filter(d => d.isPaid);
        this.visibleNotBilledData = data.filter(d => !d.isPaid);
        this.visibleNotBilledBackup= data.filter(d => !d.isPaid);
      }
    });
  }

  convertToFormattedDate(date: Date, format: string) {
    return formatDate(date, format, "en-US");
  }

  getSelectedDate() {
    return `${this.convertToFormattedDate(this.selectedDate, "dd MMM, yyyy | EEEE")}` === `${this.convertToFormattedDate(new Date(), "dd MMM, yyyy | EEEE")}` ? 'Today' : `${this.convertToFormattedDate(this.selectedDate, "dd MMM, yyyy | EEEE")}`;
  }


  openListOldInvoice(patientId: number) {
    this.invoice = true;
    this.dataService.getData<Order[]>(`${Modules.OrderByPatientId}/${patientId}`).then((data: Order[]) => {
      if (data && data.length) {
        this.invoiceHistoryPopup.showPopup(data);
      }
    });
  }

  openInvoice(data: Order) {
    this.generateInvoice.showPopup(data);
    this.invoice = true;
  }

  onCancelInvoice(event:Event,data:any){
    event.stopPropagation();
    this.reasonPopup.showPopup();
    if (this.onCloseSubscription) { this.onCloseSubscription.unsubscribe(); }
    this.onCloseSubscription = this.reasonPopup.onClose.subscribe((resp) => {
      this.dataService.postData<any>(`${Modules.CancelOrder}?Id=${data.id}&CanceledBy=${resp.CanceledBy}&CancelationReason=${resp.comment}`).then((res)=>{
          if(this.confirmationSubscription){this.confirmationSubscription.unsubscribe()}
          this.confirmationSubscription = this.notificationService.confirmationProcess.subscribe((resp) => {
             this.onload(this.selectedDate);
             this.dataService.postData<any>(`${Modules.GetPaymentReceipts}?Id=${data.id}`).then((data) => {
              if (data) {
                this.reciptpopup.showPopup(data);
              }
            });
           });
      });
    })
  }
  patientDetail(data: Order) {
    if (!this.invoice) {
      const notBilledServices=data.orderServices.filter((d)=>!d.isPaid)
      this.router.navigate([`${FixedRoutes.Order}/${FixedRoutes.OrderDetails}`], { state: {...data,orderServices:notBilledServices} });
    } else {
      this.invoice = false;
    }
  }

  patientDetails(data: Order) {
    if (!this.invoice) {
      const billedServices=data.orderServices.filter((d)=>d.isPaid)
      this.router.navigate([`${FixedRoutes.Order}/${FixedRoutes.OrderDetails}`], { state: {...data,orderServices:billedServices,isPaid:true,allservicesarePaid:true} });
    } else {
      this.invoice = false;
    }
  }
  ngOnDestroy(): void {
    if (this.searchEventSubscription) { this.searchEventSubscription.unsubscribe() };
    if (this.selectedClinicDateSubscription) { this.selectedClinicDateSubscription.unsubscribe(); }
    if (this.nextEventSUbscription) { this.nextEventSUbscription.unsubscribe(); }
    if (this.prevEventSUbscription) { this.prevEventSUbscription.unsubscribe(); }
    if(this.confirmationSubscription){this.confirmationSubscription.unsubscribe()}
    if(this.filterSubscription) { this.filterSubscription.unsubscribe(); }
    if(this.downloadPaymentSubscription) { this.downloadPaymentSubscription.unsubscribe(); }
    if(this.onCloseSubscription) { this.onCloseSubscription.unsubscribe(); }
    if (this.admitPatientEventSUbscription) { this.admitPatientEventSUbscription.unsubscribe(); }
  }
}
