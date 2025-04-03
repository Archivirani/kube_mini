import { Component, OnInit, ViewChild } from '@angular/core';
import { AppointmentService } from '@services/appointment.service';
import { ReportFilterPopupComponent } from '../report-filter-popup/report-filter-popup.component';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { DataService } from '@services/data.service';
import { Modules } from '@urls';
import { DatePipe, formatDate } from '@angular/common';
import { GlobalSearchFilter } from '@shared/pipes/global-search.pipe';
import { ResourceService } from '@services/resource.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'report-table',
  templateUrl: './report-table.component.html',
  styleUrls: ['./report-table.component.scss']
})
export class ReportTableComponent implements OnInit {

  public modalRef: BsModalRef;
  public searchSubscription: Subscription;
  public registerPatientList: any[] = [];
  public admittedPatientList: any[] = [];
  public erPatientList: any[] = [];
  public dischargePatientList: any[] = [];
  public orderList: any[] = [];
  public laboratoryList: any[] = [];
  public radiologyList: any[] = [];
  public appointmentsList: any[] = [];
  public userAuthorityList: any[] = [];
  public register:boolean = false;
  public admitted:boolean = false;
  public er:boolean = false;
  public discharge:boolean = false;
  public invoices:boolean = false;
  public laboratory:boolean = false;
  public radiology:boolean = false;
  public appointments:boolean = false;
  public userAuthorityLog:boolean = false;
  private isFilter:boolean=false;
  public setData: any;
  public userType:number;
  public selectedEvent:any;
  public searchSelectedEvent:any;
  public startDate:any;
  public endDate:any;
  public postedByOrder:any;
  public registerPatientListBackup: any[];
  public admittedPatientListBackup: any[];
  public erPatientListBackup: any[];
  public dischargePatientListBackup: any[];
  public orderListBackup: any[];
  public laboratoryListBackup: any[];
  public radiologyListBackup: any[];
  public appointmentsListBackup: any[];
  public userAuthorityBackup: any[];
  public invoiceSum:any;
  public count:any;
  @ViewChild('filterPopup') filterPopup: ReportFilterPopupComponent;

  constructor(public appointmentService: AppointmentService, private dataService: DataService, private globalSearch:GlobalSearchFilter, private resourceService: ResourceService) {

    this.setData = JSON.parse(sessionStorage.getItem('User'))
    this.userType=this.setData.userTypeId;

    if (this.searchSubscription) { this.searchSubscription.unsubscribe(); }
    this.searchSubscription=this.resourceService.searchQuerySubject.subscribe((res) => {
        const registeredSearch=["medicalRecordNumber","firstName","secondName","thirdName","familyName","gender","dateOfBirth","email","contactNo1","identificationNo"];
        this.registerPatientList = this.globalSearch.transform(this.registerPatientListBackup, res, registeredSearch);

        const amittedSearch=["patientAdmission.patient.medicalRecordNumber","patientAdmission.patient.firstName","patientAdmission.patient.secondName","patientAdmission.patient.thirdName","patientAdmission.patient.familyName","patientAdmission.patient.gender","patientAdmission.patient.dateOfBirth","visitId","floors.floornumber","rooms.roomNumber","bads.badNumber","rooms.roomsStatus.status","patientAdmission.attendDoctor.doctor_Name","specialities.speciality_desc","patientAdmission.admissionStatus.status"];
        this.admittedPatientList = this.globalSearch.transform(this.admittedPatientListBackup, res, amittedSearch);

        const erSearch=["patientAdmission.patient.medicalRecordNumber","patientAdmission.patient.firstName","patientAdmission.patient.secondName","patientAdmission.patient.thirdName","patientAdmission.patient.familyName","patientAdmission.patient.gender","patientAdmission.patient.dateOfBirth","floors.floornumber","rooms.roomNumber","bads.badNumber","patientAdmission.attendDoctor.doctor_Name","specialities.speciality_desc","patientAdmission.visitStatus.status"];
        this.erPatientList = this.globalSearch.transform(this.erPatientListBackup, res, erSearch);

        const dischargeSearch=["patientAdmission.patient.medicalRecordNumber","patientAdmission.patient.firstName","patientAdmission.patient.secondName","patientAdmission.patient.thirdName","patientAdmission.patient.familyName","visitId","losDays","floors.floornumber","patientAdmission.patientRoomsAssigned.rooms.roomNumber","patientAdmission.patientRoomsAssigned.bads.badNumber","patientAdmission.attendDoctor.doctor_Name","specialities.speciality_desc","dischargeStatuses.status"];
        this.dischargePatientList = this.globalSearch.transform(this.dischargePatientListBackup, res, dischargeSearch);

        // const orderSearch=["patient.medicalRecordNumber","patient.firstName","patient.secondName","patient.thirdName","patient.familyName","orderPayments.payment.paymentDetails.amount","orderPayments.payment.paymentDetails.paymentType","orderServices.name"];
        // this.orderList = this.globalSearch.transform(this.orderListBackup, res, orderSearch);

        const orderSearch=["patient.medicalRecordNumber","patient.firstName","patient.secondName","patient.thirdName","patient.familyName","dateTime","orderServices.desiredTime","createUser","orderPayments.user.loginname","orderPayments.payment.paymentDetails.amount","orderPayments.payment.paymentDetails.paymentType","orderServices.name"];
        this.orderList = this.globalSearch.transform(this.orderListBackup, res, orderSearch);

        // const laboratorySearch=["patient.medicalRecordNumber","patient.firstName","patient.secondName","patient.thirdName","patient.familyName","name","visitId","comment","user.username","appointmentId","patientRoomsAssigned.patientAdmission.caseTypesTbl.caseName"];
        // this.laboratoryList = this.globalSearch.transform(this.laboratoryListBackup, res, laboratorySearch);

        // const radiologySearch=["patient.medicalRecordNumber","patient.firstName","patient.secondName","patient.thirdName","patient.familyName","name","visitId","comment","user.username","appointmentId","patientRoomsAssigned.patientAdmission.caseTypesTbl.caseName"];
        // this.radiologyList = this.globalSearch.transform(this.radiologyListBackup, res, radiologySearch);
        const laboratorySearch=["patient.medicalRecordNumber","patient.firstName","patient.secondName","patient.thirdName","patient.familyName","orderServices.name","visitId","comment","user.username","appointmentId","patientRoomsAssigned.patientAdmission.caseTypesTbl.caseName","appointment.comment","orderServices.desiredTime"];
        this.laboratoryList = this.globalSearch.transform(this.laboratoryListBackup, res, laboratorySearch);

        const radiologySearch=["patient.medicalRecordNumber","patient.firstName","patient.secondName","patient.thirdName","patient.familyName","name","visitId","comment","user.username","appointmentId","patientRoomsAssigned.patientAdmission.caseTypesTbl.caseName","orderServices.name"];
        this.radiologyList = this.globalSearch.transform(this.radiologyListBackup, res, radiologySearch);

        const appointmentsSearch=["patient.medicalRecordNumber","patient.firstName","patient.secondName","patient.thirdName","patient.familyName","doctors.doctor_Name","appointmentType.name","appointmentStatus","comment","id","canceledByUser","specialities.speciality_desc"];
        this.appointmentsList = this.globalSearch.transform(this.appointmentsListBackup, res, appointmentsSearch);

        const userAuthoritySearch=["firstName","lastName",,"employee_id","username","userType.name","status","createdOnDate","createdOnTime","createdUser","updateUser","updateOnDate","inactivationDate","inactivationTime","inactivatedUser"];
        this.userAuthorityList = this.globalSearch.transform(this.userAuthorityBackup, res, userAuthoritySearch)
    });
    this.appointmentService.isEvent.subscribe((res) => {
      let data = res.target.innerText;
      this.selectedEvent=res.target.innerText;
      const selectedItem = this.appointmentService.reportsList.find(item => item.name === data);
      if (selectedItem) {
        selectedItem.isSelected = !selectedItem.isSelected;
        this.appointmentService.reportsList.filter(item => item !== selectedItem).forEach(item => item.isSelected = false);
      }
      if (data === 'Registered Patients') {
        this.register = true;
        this.admitted = false;
        this.er = false;
        this.discharge = false;
        this.invoices = false;
        this.laboratory = false;
        this.radiology = false;
        this.appointments = false;
        this.userAuthorityLog = false;
        this.admittedPatientList = [];
        this.erPatientList = [];
        this.dischargePatientList = [];
        this.orderList = [];
        this.radiologyList = [];
        this.appointmentsList = [];
        this.userAuthorityList = [];
      }
      else if (data === 'Admitted Patients'){
        this.register = false;
        this.admitted = true;
        this.er = false;
        this.discharge = false;
        this.invoices = false;
        this.laboratory = false;
        this.radiology = false;
        this.appointments = false;
        this.userAuthorityLog = false;
        this.registerPatientList= [];
        this.erPatientList = [];
        this.dischargePatientList = [];
        this.orderList = [];
        this.laboratoryList= [];
        this.radiologyList = [];
        this.appointmentsList = [];
        this.userAuthorityList = [];
      }
      else if (data === 'ER Patients'){
        this.register = false;
        this.admitted = false;
        this.er = true;
        this.discharge = false;
        this.invoices = false;
        this.laboratory = false;
        this.radiology = false;
        this.appointments = false;
        this.userAuthorityLog = false;
        this.admittedPatientList = [];
        this.registerPatientList= [];
        this.dischargePatientList = [];
        this.orderList = [];
        this.laboratoryList= [];
        this.radiologyList = [];
        this.appointmentsList = [];
        this.userAuthorityList = [];
      }
      else if (data === 'Discharged Patients'){
        this.register = false;
        this.admitted = false;
        this.er = false;
        this.discharge = true;
        this.invoices = false;
        this.laboratory = false;
        this.radiology = false;
        this.appointments = false;
        this.userAuthorityLog = false;
        this.admittedPatientList = [];
        this.registerPatientList= [];
        this.erPatientList = [];
        this.orderList = [];
        this.laboratoryList= [];
        this.radiologyList = [];
        this.appointmentsList = [];
        this.userAuthorityList = [];
      }
      else if (data === 'Invoices'){
        this.register = false;
        this.admitted = false;
        this.er = false;
        this.discharge = false;
        this.invoices = true;
        this.laboratory = false;
        this.radiology = false;
        this.appointments = false;
        this.userAuthorityLog = false;
        this.admittedPatientList = [];
        this.registerPatientList= [];
        this.erPatientList = [];
        this.dischargePatientList = [];
        this.laboratoryList= [];
        this.radiologyList = [];
        this.appointmentsList = [];
        this.userAuthorityList = [];
      }
      else if (data === 'Laboratory Orders'){
        this.register = false;
        this.admitted = false;
        this.er = false;
        this.discharge = false;
        this.invoices = false;
        this.laboratory = true;
        this.radiology = false;
        this.appointments = false;
        this.userAuthorityLog = false;
        this.admittedPatientList = [];
        this.registerPatientList= [];
        this.erPatientList = [];
        this.dischargePatientList = [];
        this.orderList = [];
        this.radiologyList = [];
        this.appointmentsList = [];
        this.userAuthorityList = [];
      }
      else if (data === 'Radiology Orders'){
        this.register = false;
        this.admitted = false;
        this.er = false;
        this.discharge = false;
        this.invoices = false;
        this.laboratory = false;
        this.radiology = true;
        this.appointments = false;
        this.userAuthorityLog = false;
        this.admittedPatientList = [];
        this.registerPatientList= [];
        this.erPatientList = [];
        this.dischargePatientList = [];
        this.orderList = [];
        this.laboratoryList= [];
        this.appointmentsList = [];
        this.userAuthorityList = [];
      }
      else if (data === 'Appointments'){
        this.register = false;
        this.admitted = false;
        this.er = false;
        this.discharge = false;
        this.invoices = false;
        this.laboratory = false;
        this.radiology = false;
        this.appointments = true;
        this.userAuthorityLog = false;
        this.admittedPatientList = [];
        this.registerPatientList= [];
        this.erPatientList = [];
        this.dischargePatientList = [];
        this.orderList = [];
        this.laboratoryList= [];
        this.radiologyList = [];
        this.userAuthorityList = [];
      }
      else if(data === 'User Authority Log'){
        this.register = false;
        this.admitted = false;
        this.er = false;
        this.discharge = false;
        this.invoices = false;
        this.laboratory = false;
        this.radiology = false;
        this.appointments = false;
        this.userAuthorityLog = true;
        this.admittedPatientList = [];
        this.registerPatientList= [];
        this.erPatientList = [];
        this.dischargePatientList = [];
        this.orderList = [];
        this.laboratoryList= [];
        this.radiologyList = [];
      }
    });
  }

  ngOnInit(): void {
  }

  getRegisterPatientList() {
    this.filterPopup.onRegisterPatientFilter('Register Patient');
  }
  onRegisterPatientDownload(){
    if(this.isFilter === true){
      this.dataService.downloadFile(
        `${Modules.allRegisterPatientsDownload}?Hosp_Code=${this.setData.hosp_Code}&Startdate=${formatDate(this.startDate, "MM-dd-YYYY", "en-Us")}&Enddate=${formatDate(this.endDate, "MM-dd-YYYY", "en-Us")}`,'',`${new DatePipe('en-US').transform(new Date(), 'ddMMyyyyHHmmss')}.xlsx`
      );
    }
  }

  getAdmittedPatientList() {
    this.filterPopup.onRegisterPatientFilter('Admitted Patient');
  }
  onAdmittedPatientDownload(){
    if(this.isFilter === true){
      this.dataService.downloadFile(
        `${Modules.allAdmittedPatientDownload}?Hosp_Code=${this.setData.hosp_Code}&Startdate=${formatDate(this.startDate, "MM-dd-YYYY", "en-Us")}&Enddate=${formatDate(this.endDate, "MM-dd-YYYY", "en-Us")}`,'',`${new DatePipe('en-US').transform(new Date(), 'ddMMyyyyHHmmss')}.xlsx`
      );
    }
  }

  getErPatientList() {
    this.filterPopup.onRegisterPatientFilter('ER Patient');
  }
  onErPatientDownload(){
    if(this.isFilter === true){
      this.dataService.downloadFile(
        `${Modules.allERAdmittedPatientDownload}?Hosp_Code=${this.setData.hosp_Code}&Startdate=${formatDate(this.startDate, "MM-dd-YYYY", "en-Us")}&Enddate=${formatDate(this.endDate, "MM-dd-YYYY", "en-Us")}`,'',`${new DatePipe('en-US').transform(new Date(), 'ddMMyyyyHHmmss')}.xlsx`
      );
    }
  }

  getDischargePatient() {
    this.filterPopup.onRegisterPatientFilter('Discharge Patient');
  }
  onDischargePatientDownload(){
    if(this.isFilter === true){
      this.dataService.downloadFile(
        `${Modules.allDischargePatientDownload}?Hosp_Code=${this.setData.hosp_Code}&Startdate=${formatDate(this.startDate, "MM-dd-YYYY", "en-Us")}&Enddate=${formatDate(this.endDate, "MM-dd-YYYY", "en-Us")}`,'',`${new DatePipe('en-US').transform(new Date(), 'ddMMyyyyHHmmss')}.xlsx`
      );
    }
  }

  getOrderList() {
    this.filterPopup.onRegisterPatientFilter('Invoice');
  }
  oninvoiceDownload(){
    if(this.isFilter === true){
      let postBy = this.postedByOrder ? this.postedByOrder : 0;
      this.dataService.downloadFile(
        `${Modules.allOrderBydateDownloads}?StartDate=${formatDate(this.startDate, "MM-dd-YYYY", "en-Us")}&EndDate=${formatDate(this.endDate, "MM-dd-YYYY", "en-Us")}&Hosp_Code=${this.setData.hosp_Code}&postby=${postBy}`,'',`${new DatePipe('en-US').transform(new Date(), 'ddMMyyyyHHmmss')}.xlsx`
      );
    }
  }

  getlaboratoryList() {
    this.filterPopup.onRegisterPatientFilter('Laboratory List');
  }
  onlaboratoryDownload(){
    if(this.isFilter === true){
      this.dataService.downloadFile(
        `${Modules.allLaboratoryPatientDownloads}?Hosp_Code=${this.setData.hosp_Code}&StartDate=${formatDate(this.startDate, "MM-dd-YYYY", "en-Us")}&EndDate=${formatDate(this.endDate, "MM-dd-YYYY", "en-Us")}`,'',`${new DatePipe('en-US').transform(new Date(), 'ddMMyyyyHHmmss')}.xlsx`
      );
    }
  }

  getRadiologyList() {
    this.filterPopup.onRegisterPatientFilter('Radiology List');
  }
  onRadiologyDownload(){
    if(this.isFilter === true){
      this.dataService.downloadFile(
        `${Modules.allRadiologyPatientDownloads}?Hosp_Code=${this.setData.hosp_Code}&StartDate=${formatDate(this.startDate, "MM-dd-YYYY", "en-Us")}&EndDate=${formatDate(this.endDate, "MM-dd-YYYY", "en-Us")}`,'',`${new DatePipe('en-US').transform(new Date(), 'ddMMyyyyHHmmss')}.xlsx`
      );
    }
  }
  isAllOrderServicesPaid(data: any): boolean {
    return data.orderServices.every(os => os.isPaid);
  }

  getAppointmentsList(){
    this.filterPopup.onRegisterPatientFilter('Appointments List');
  }
  onAppointmentsDownload(){
    if(this.isFilter === true){
      this.dataService.downloadFile(
        `${Modules.allAppointmentsDownload}?Hosp_Code=${this.setData.hosp_Code}&StartDate=${formatDate(this.startDate, "MM-dd-YYYY", "en-Us")}&EndDate=${formatDate(this.endDate, "MM-dd-YYYY", "en-Us")}`,'',`${new DatePipe('en-US').transform(new Date(), 'ddMMyyyyHHmmss')}.xlsx`
      );
    }
  }

  getUserList(){
    this.filterPopup.onRegisterPatientFilter('User List');
  }
  onUserDownload(){
    if(this.isFilter === true){
      this.dataService.downloadFile(
        `${Modules.allUSersDownload}?StartDate=${formatDate(this.startDate, "MM-dd-YYYY", "en-Us")}&EndDate=${formatDate(this.endDate, "MM-dd-YYYY", "en-Us")}&Hosp_Code=${this.setData.hosp_Code}`,'',`${new DatePipe('en-US').transform(new Date(), 'ddMMyyyyHHmmss')}.xlsx`
      );
    }
  }

  filterRegisterData(event){

    if(event.selectedEvent === 'registered'){
      this.registerPatientList = event.resp;
      this.registerPatientListBackup = event.resp;
      this.isFilter=event.isFilter;
      this.startDate=event.startDate;
      this.endDate=event.endDate;
    }
    else if(event.selectedEvent === 'admitted'){
      this.admittedPatientList = event.resp;
      this.admittedPatientListBackup = event.resp;
      this.isFilter=event.isFilter;
      this.startDate=event.startDate;
      this.endDate=event.endDate;
    }
    else if(event.selectedEvent === 'er'){
      this.erPatientList = event.resp;
      this.erPatientListBackup = event.resp;
      this.isFilter=event.isFilter;
      this.startDate=event.startDate;
      this.endDate=event.endDate;
    }
    else if(event.selectedEvent === 'discharge'){
      this.dischargePatientList = event.resp;
      this.dischargePatientListBackup = event.resp;
      this.isFilter=event.isFilter;
      this.startDate=event.startDate;
      this.endDate=event.endDate;
    }
    else if(event.selectedEvent === 'order'){
      this.orderList = event.resp.orderlist;
      this.count=event.resp.count;
      this.invoiceSum=event.resp.invoiceSum;
      this.orderListBackup = event.resp;
      this.isFilter=event.isFilter;
      this.startDate=event.startDate;
      this.endDate=event.endDate;
      this.postedByOrder=event.postedBy;
    }
    // else if(event.selectedEvent === 'laboratory'){
    //   this.laboratoryList = event.resp;
    //   this.laboratoryListBackup = event.resp;
    //   this.isFilter=event.isFilter;
    //   this.startDate=event.startDate;
    //   this.endDate=event.endDate;
    // }
    else if(event.selectedEvent === 'laboratory'){
      this.laboratoryList = this.addStatusToLaboratoryList(event.resp);
      this.laboratoryListBackup = this.addStatusToLaboratoryList(event.resp);
      this.isFilter=event.isFilter;
      this.startDate=event.startDate;
      this.endDate=event.endDate;
    }
    else if(event.selectedEvent === 'radiology'){
      this.radiologyList = this.addStatusToLaboratoryList(event.resp);
      this.radiologyListBackup = this.addStatusToLaboratoryList(event.resp);
      this.isFilter=event.isFilter;
      this.startDate=event.startDate;
      this.endDate=event.endDate;
    }
    else if(event.selectedEvent === 'appointments'){
      this.appointmentsList = event.resp;
      this.appointmentsListBackup = event.resp;
      this.isFilter=event.isFilter;
      this.startDate=event.startDate;
      this.endDate=event.endDate;
    }
    else if(event.selectedEvent === 'user'){
      this.userAuthorityList = event.resp;
      this.userAuthorityBackup = event.resp;
      this.isFilter=event.isFilter;
      this.startDate=event.startDate;
      this.endDate=event.endDate;
    }
  }

  addStatusToLaboratoryList(laboratoryList: any[]): any[] {
    return laboratoryList.map(res => {
      if (!res.patientRoomsAssigned) {
        const newObject = {
          ...res,
          patientRoomsAssigned: {
            patientAdmission: {
              caseTypesTbl: {
                caseName: 'Out Patient' 
              }
            }
          }
        };
        return newObject;
      }
      return res;
    });
  }

  ngOnDestroy(){
    if (this.searchSubscription) { this.searchSubscription.unsubscribe(); }
  }

}