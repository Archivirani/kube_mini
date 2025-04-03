import { DatePipe, formatDate } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '@services/data.service';
import { Appointment } from '@services/model/appointment.model';
import { Order, OrderService } from '@services/model/clinic.model';
import { ResourceService } from '@services/resource.service';
import { GlobalSearchFilter } from '@shared/pipes/global-search.pipe';
import { FixedRoutes, Modules } from '@urls';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { EditDischargePopupComponent } from './edit-discharge-popup/edit-discharge-popup.component';
import { AppointmentService } from '@services/appointment.service';

@Component({
  selector: 'app-discharged-patients',
  templateUrl: './discharged-patients.component.html',
  styleUrls: ['./discharged-patients.component.scss']
})
export class DischargedPatientsComponent implements OnInit {
  private nextEventSUbscription: Subscription;
  public selectedDate: Date = new Date();
  private prevEventSUbscription: Subscription;
  public selectedClinicDateSubscription: Subscription;
  public downloadPaymentSubscription: Subscription;
  public searchSubscription:Subscription;
  public filterSubscription:Subscription;
  public retrivePatientData: any[] = [];
  public visibleDataBackup: any[];
  public visibleBilledData: Order[];
  public visibleNotBilledData: Order[];
  public visibleData: any[];
  public isCounter: boolean = false;
  public isFilter: boolean = false;
  private modalRef: BsModalRef;
  public isIPadAir = false;
  public getSpecialitylist: any[];
  public getPhysicianlist: any[];
  public visibleNotBilledBackup:any[];
  public floorsList: any;
  public doctorsList: any;
  public specialtyList: any;
  public endDate: any;
  public startDate: any;
  public floorId:any;
  public attendingPhysician: any;
  public speciality: any;
  public eventsSubject: Subject<void> = new Subject<void>();
  @ViewChild('dischargededitPopup') dischargededitPopup: EditDischargePopupComponent;
  @ViewChild('filterPopup', { static: true }) filterPopup: TemplateRef<any>;
  public getCategoryList: any;
  public clinicServices: OrderService[];
  constructor(private resourceService: ResourceService, private modalService: BsModalService, private appointmentService: AppointmentService, private dataService: DataService, private router: Router, private globalSearch: GlobalSearchFilter) {
    
    this.onload(this.selectedDate); window.innerWidth < 1260 ? this.isIPadAir = true : this.isIPadAir = false;
    this.resourceService.DisschargedPatientDate = this.selectedDate;
    this.resourceService.dayOnlyAppointmentLabel = this.getSelectedDate();
    if (this.nextEventSUbscription) { this.nextEventSUbscription.unsubscribe(); }
    this.nextEventSUbscription = this.resourceService.nextEvent.subscribe((data: any) => {
      if (data) {
        this.onload(new Date(this.selectedDate.setDate(this.selectedDate.getDate() + 1)));
        this.resourceService.dayOnlyAppointmentLabel = this.getSelectedDate();
        this.resourceService.DisschargedPatientDate = this.selectedDate;
      }
    });

    if(this.downloadPaymentSubscription) { this.downloadPaymentSubscription.unsubscribe(); }
    this.downloadPaymentSubscription =this.appointmentService.downloadAppointment.subscribe((data) => {
      if (data) {
       this.onDownloadPaymentFile();
      }
    });

    if(this.filterSubscription) { this.filterSubscription.unsubscribe(); }
    this.filterSubscription =this.resourceService.submitEvent.subscribe((data) => {
      if (data) {
        this.startDate='';
        this.endDate='';
        this.modalRef = this.modalService.show(this.filterPopup, { backdrop: true, ignoreBackdropClick: false , class:'filterPopup'});
      }
    });

    if (this.searchSubscription) { this.searchSubscription.unsubscribe(); }
    this.searchSubscription=this.resourceService.searchQuerySubject.subscribe((res) => {
      const fieldNames = ["patientAdmission.patient.medicalRecordNumber","dischargeStatuses.status","specialities.speciality_desc","patientAdmission.attendDoctor.doctor_Name","patientAdmission.patientRoomsAssigned.bads.badNumber","patientAdmission.patientRoomsAssigned.rooms.roomNumber","patientAdmission.patientRoomsAssigned.floors.floornumber","losDays","dischargeTime","dischargeDate","patientAdmission.admTime","patientAdmission.admDate","patientAdmission.patient.familyName","patientAdmission.patient.thirdName","patientAdmission.patient.secondName","patientAdmission.patient.firstName"];
      this.visibleData = this.globalSearch.transform(this.visibleDataBackup, res, fieldNames);
    });

    if (this.prevEventSUbscription) { this.prevEventSUbscription.unsubscribe(); }
    this.prevEventSUbscription = this.resourceService.prevEvent.subscribe((data: any) => {
      if (data) {
        this.onload(new Date(this.selectedDate.setDate(this.selectedDate.getDate() - 1)));
        this.resourceService.dayOnlyAppointmentLabel = this.getSelectedDate();
        this.resourceService.DisschargedPatientDate = this.selectedDate;
      }
    });

    if (this.selectedClinicDateSubscription) {
      this.selectedClinicDateSubscription.unsubscribe();
    }
    this.selectedClinicDateSubscription = this.resourceService.selectedClinicDate.subscribe((data: Date) => {
      if (data) {
        this.onload(data);
        this.selectedDate = data;
        this.resourceService.dayOnlyAppointmentLabel = this.getSelectedDate();
        this.resourceService.DisschargedPatientDate = data;
      }
    });

    // this.resourceService.searchQuerySubject.subscribe((res) => {
    //   const fieldNames = []
    //   this.visibleData = this.globalSearch.transform(this.visibleDataBackup, res, fieldNames);
    // });

  }

  ngOnInit(): void {
    this.getServices();
  }

  onload(date: Date): void {
    let setData = JSON.parse(sessionStorage.getItem('User'));
    let Hosp_Code = setData.hosp_Code;
    this.dataService.getData<Order[]>(`${Modules.PatientDischargeList}?Hopt_code=${Hosp_Code}&Startdate=${formatDate(date, "MM-dd-YYYY", "en-Us")}&Enddate=${formatDate(date, "MM-dd-YYYY", "en-Us")}`).then((data: Order[]) => {
      this.retrivePatientData = data;
      this.resourceService.totalRecords.next(this.retrivePatientData.length);
      // this.visibleBilledData = [];
      // this.visibleNotBilledData = [];
      if (data && data.length) {
        this.visibleDataBackup=data;
        this.visibleData = data;
        // this.visibleBilledData = data.filter(d => d.isPaid);
        // this.visibleNotBilledData = data.filter(d => !d.isPaid);
      } else {
        this.visibleData = data.slice();
      }
    });
  }

  onDownloadPaymentFile() {
    let getdata = JSON.parse(sessionStorage.getItem('User'));
    const formattedStartDate = this.startDate ? formatDate(this.startDate, "MM-dd-YYYY", "en-Us") : '';
    const formattedEndDate = this.endDate ? formatDate(this.endDate, "MM-dd-YYYY", "en-Us") : '';
    if (this.isFilter == true) {
      this.dataService.downloadFile(
        `${Modules.dischargePatientDownload}?Hosp_Code=${getdata.hosp_Code}&Startdate=${formattedStartDate}&Enddate=${formattedEndDate}`,
        { startDate: formattedStartDate, endDate: formattedEndDate },
        `${new DatePipe('en-US').transform(new Date(), 'ddMMyyyyHHmmss')}.xlsx`
      );
    } else {
      const formattedStartDate = `${formatDate(this.selectedDate, "MM-dd-YYYY", "en-Us")}`;
      this.dataService.downloadFile(
        `${Modules.dischargePatientDownload}?Hosp_Code=${getdata.hosp_Code}&Startdate=${formattedStartDate}&Enddate=${formattedStartDate}`,
        { startDate: formattedStartDate, endDate: formattedStartDate },
        `${new DatePipe('en-US').transform(new Date(), 'ddMMyyyyHHmmss')}.xlsx`
      );
    }
  }

  filterData(){
    this.isFilter = true;
    let startDateParam = this.startDate ? formatDate(this.startDate, "MM-dd-YYYY", "en-Us") : '';
    let endDateParam = this.endDate ? formatDate(this.endDate, "MM-dd-YYYY", "en-Us") : '';
    let setData = JSON.parse(sessionStorage.getItem('User'));
    let Hosp_Code = setData.hosp_Code;
    this.dataService.getData<Order[]>(`${Modules.PatientDischargeList}?Hopt_code=${Hosp_Code}&Startdate=${startDateParam}&Enddate=${endDateParam}`).then((data: Order[]) => {
      this.retrivePatientData = data;
      this.resourceService.totalRecords.next(this.retrivePatientData.length);
      // this.visibleBilledData = [];
      // this.visibleNotBilledData = [];
      this.resourceService.dayOnlyAppointmentLabel=`${formatDate(this.startDate, "dd-MM-YYYY", "en-Us")} To ${formatDate(this.endDate, "dd-MM-YYYY", "en-Us")} `
      if (data && data.length) {
        this.visibleDataBackup=data;
        this.visibleData = data;
        // this.visibleBilledData = data.filter(d => d.isPaid);
        // this.visibleNotBilledData = data.filter(d => !d.isPaid);
        this.modalRef.hide();
      } else {
        this.visibleData = data.slice();
      }
    });
  }

  onCancel() {
    this.modalRef.hide();
  }

  getSelectedDate() {
    return `${this.convertToFormattedDate(this.selectedDate, "dd MMM, yyyy | EEEE")}` === `${this.convertToFormattedDate(new Date(), "dd MMM, yyyy | EEEE")}` ? 'Today' : `${this.convertToFormattedDate(this.selectedDate, "dd MMM, yyyy | EEEE")}`;
  }

  convertToFormattedDate(date: Date, format: string) {
    return formatDate(date, format, "en-US");
  }

  onDeleteRecord(data) {
    if (data.dischargeStatuses.status === "Actual") {
      if (!data.order?.isPaid && data.visitId != null) {
        Swal.fire({
          title: "Are you sure you want to Cancel the Discharge?",
          icon: 'warning',
          showCancelButton: true,
          showConfirmButton: true,
          confirmButtonText: "Yes",
          cancelButtonText: "No",
          confirmButtonColor: '#3f7473',
          cancelButtonColor: '#e71d36',
          customClass: {
            container: 'notification-popup'
          }
        }).then((result) => {
          if (result.value) {
            const setData = JSON.parse(sessionStorage.getItem('User'));
            this.dataService.getData<[]>(`${Modules.cancelDischargedPatient}?PatientDischargeId=${data.id}&CancelledBy=${setData.id}`).then((res) => {
              this.onload(this.selectedDate);
            })
          } else {
            this.router.navigate([`${FixedRoutes.DischargedPatients}`])
          }
        })
      } else {
        Swal.fire({
          title: "Patient has an issued Invoice, Cancelling discharge isn't possible!",
          icon: 'warning',
          showConfirmButton: true,
          confirmButtonText: "Okay",
          confirmButtonColor: '#3f7473',
          cancelButtonColor: '#e71d36',
          customClass: {
            container: 'notification-popup'
          }
        })
      }
    }
    else {
      Swal.fire({
        title: "Are you sure you want to Cancel the Discharge?",
        icon: 'warning',
        showCancelButton: true,
        showConfirmButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        confirmButtonColor: '#3f7473',
        cancelButtonColor: '#e71d36',
        customClass: {
          container: 'notification-popup'
        }
      }).then((result) => {
        if (result.value) {
          const setData = JSON.parse(sessionStorage.getItem('User'));
          this.dataService.getData<[]>(`${Modules.cancelDischargedPatient}?PatientDischargeId=${data.id}&CancelledBy=${setData.id}`).then((res) => {
            this.onload(this.selectedDate);
          })
        } else {
          this.router.navigate([`${FixedRoutes.DischargedPatients}`])
        }
      })
    }
  }

  getServices(){
    this.dataService.getData<OrderService[]>(`${Modules.ActiveServices}`).then((response) => {
      if (response && response.length) {
        response.forEach((data: OrderService) => {
          data.isSelected = false;
          data.type = "Services";
          data.serviceId = data.id;
        });
        this.clinicServices = response;
      }
    });
  }
  onPayment(data){
    // find category 
    data?.order?.orderServices.forEach((data)=>{
      const demo = this.clinicServices?.find((d)=>d.name === data.name)
      data.categorization=demo?.categorization;
    })
    const billedServices=data?.order?.orderServices.every((d)=>d.isPaid)
    if(billedServices){
    this.router.navigate([`${FixedRoutes.Order}/${FixedRoutes.OrderDetails}`], { state: {...data.order,patientRoomsAssigned:data.patientAdmission,isPaid:true,allservicesarePaid:true} });
    }else{
      this.router.navigate([`${FixedRoutes.Order}/${FixedRoutes.OrderDetails}`], { state: {...data.order,patientRoomsAssigned:data.patientAdmission} });
    }
  }
  onEdit(data){
    this.dischargededitPopup.showPopup(data);
  }
  onRedirect(data) {
    if (!this.isCounter) {
      if (data.dischargeStatuses.status === "Actual") {
        Swal.fire({
          title: "Patient has a Actual Discharge, no services can be added!",
          icon: 'warning',
          showCancelButton: false,
          showConfirmButton: true,
          confirmButtonText: "Ok",
          confirmButtonColor: '#3f7473',
          customClass: {
            container: 'notification-popup'
          }
        }).then((result) => {
          if (result.value) {

            this.router.navigate([`${FixedRoutes.DischargedPatients}`]);
          }
        });
      }
      else {
        let UserTypeId=JSON.parse(sessionStorage.getItem('User'))
        if(UserTypeId.userTypeId !== 13){
        this.router.navigate([`${FixedRoutes.Admittedpatient}/${FixedRoutes.AdmittedpatientDetails}`], { state: data });
        }
      }
    } else {
      this.isCounter = false
    }
  }

  ngOnDestroy(){
    if (this.searchSubscription) { this.searchSubscription.unsubscribe(); }
    if (this.selectedClinicDateSubscription) { this.selectedClinicDateSubscription.unsubscribe(); }
    if (this.prevEventSUbscription) { this.prevEventSUbscription.unsubscribe(); }
    if (this.downloadPaymentSubscription) { this.downloadPaymentSubscription.unsubscribe(); }
    if (this.filterSubscription) { this.filterSubscription.unsubscribe(); }
    if (this.nextEventSUbscription) { this.nextEventSUbscription.unsubscribe(); }
  }
}