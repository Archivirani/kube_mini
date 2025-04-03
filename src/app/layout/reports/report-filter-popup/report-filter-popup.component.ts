import { formatDate } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { AppointmentService } from '@services/appointment.service';
import { DataService } from '@services/data.service';
import { Modules } from '@urls';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-report-filter-popup',
  templateUrl: './report-filter-popup.component.html',
  styleUrls: ['./report-filter-popup.component.scss']
})
export class ReportFilterPopupComponent implements OnInit {

  public modalRef: BsModalRef;
  public searchSubscription: Subscription;
  public startDate:any;
  public endDate:any;
  public postedBy: any;
  public registerPatientList: any[] = [];
  public setData: any;
  public userType:number;
  public selectedEvent:any;
  public currentEvent: any;
  public getPostedByList: any;
  public isFilter: boolean = false;
  @Output() filterRegisterData: EventEmitter<any> = new EventEmitter<any>();
  
  @ViewChild('filterPopup', { static: true }) filterPopup: TemplateRef<any>;
  constructor(private modalService: BsModalService, private dataService: DataService, public appointmentService: AppointmentService) { 
    this.setData = JSON.parse(sessionStorage.getItem('User'))
    this.userType=this.setData.userTypeId;
  }

  ngOnInit(): void {
    this.postedby();
  }
  OnCancel(){
    this.startDate = '';
    this.endDate = '';
    this.modalRef.hide();
  }
  onRegisterPatientFilter(event:any){
    this.currentEvent=event;
    this.modalRef = this.modalService.show(this.filterPopup, { backdrop: true, ignoreBackdropClick: false , class:'filterPopup'});
  }
  postedby(){
    this.dataService.getData(`${Modules.getPostedBy}`).then((res) => {
      this.getPostedByList = res;
    })
  }

  filterData(){
    if(this.currentEvent === 'Register Patient'){
      this.dataService.getData(`${Modules.selectAllActivePatients}?StartDate=${formatDate(this.startDate, "MM-dd-YYYY", "en-Us")}&EndDate=${formatDate(this.endDate, "MM-dd-YYYY", "en-Us")}`).then((resp: any)=>{
        const data={
          resp:resp,
          selectedEvent:'registered',
          isFilter:true,
          startDate:this.startDate,
          endDate:this.endDate
        }
        this.filterRegisterData.emit(data);
        this.modalRef.hide();
        this.startDate = '';
        this.endDate = '';
      });
    }
    else if(this.currentEvent === 'Admitted Patient'){
      this.dataService.getData(`${Modules.allPatientRoomsAssignedList}?Hopt_code=${this.setData.hosp_Code}&Startdate=${formatDate(this.startDate, "MM-dd-YYYY", "en-Us")}&Endtdate=${formatDate(this.endDate, "MM-dd-YYYY", "en-Us")}`).then((resp: any)=>{
        const data={
          resp:resp,
          selectedEvent:'admitted',
          isFilter:true,
          startDate:this.startDate,
          endDate:this.endDate
        }
        this.filterRegisterData.emit(data);
        this.modalRef.hide();
        this.startDate = '';
        this.endDate = '';
      });
    }
    else if(this.currentEvent === 'ER Patient'){
      this.dataService.getData(`${Modules.allEmergencypatientRooms}?Hopt_code=${this.setData.hosp_Code}&StartDate=${formatDate(this.startDate, "MM-dd-YYYY", "en-Us")}&EndDate=${formatDate(this.endDate, "MM-dd-YYYY", "en-Us")}`).then((resp: any)=>{
        const data={
          resp:resp,
          selectedEvent:'er',
          isFilter:true,
          startDate:this.startDate,
          endDate:this.endDate
        }
        this.filterRegisterData.emit(data);
        this.modalRef.hide();
        this.startDate = '';
        this.endDate = '';
      });
    }
    else if(this.currentEvent === 'Discharge Patient'){
      this.dataService.getData(`${Modules.allPatientDischargeList}?Hopt_code=${this.setData.hosp_Code}&StartDate=${formatDate(this.startDate, "MM-dd-YYYY", "en-Us")}&EndDate=${formatDate(this.endDate, "MM-dd-YYYY", "en-Us")}`).then((resp: any)=>{
        const data={
          resp:resp,
          selectedEvent:'discharge',
          isFilter:true,
          startDate:this.startDate,
          endDate:this.endDate
        }
        this.filterRegisterData.emit(data);
        this.modalRef.hide();
        this.startDate = '';
        this.endDate = '';
      });
    }
    else if(this.currentEvent === 'Invoice'){
      let postById = this.postedBy ? this.postedBy : 0;
      this.dataService.getData(`${Modules.getAllOrderBydate}?StartDate=${formatDate(this.startDate, "MM-dd-YYYY", "en-Us")}&EndDate=${formatDate(this.endDate, "MM-dd-YYYY", "en-Us")}&postby=${postById}`).then((resp: any)=>{
        const data={
          resp:resp,
          selectedEvent:'order',
          isFilter:true,
          startDate:this.startDate,
          endDate:this.endDate,
          postedBy: this.postedBy
        }
        this.filterRegisterData.emit(data);
        this.modalRef.hide();
        this.startDate = '';
        this.endDate = '';
        this.postedBy = '';
      });
    }
    else if(this.currentEvent === 'Laboratory List'){
      this.dataService.getData(`${Modules.getLaboratoryPatient}?Hosp_code=${this.setData.hosp_Code}&StartDate=${formatDate(this.startDate, "MM-dd-YYYY", "en-Us")}&EndDate=${formatDate(this.endDate, "MM-dd-YYYY", "en-Us")}`).then((resp: any)=>{
        const data={
          resp:resp,
          selectedEvent:'laboratory',
          isFilter:true,
          startDate:this.startDate,
          endDate:this.endDate
        }
        this.filterRegisterData.emit(data);
        this.modalRef.hide();
        this.startDate = '';
        this.endDate = '';
      });
    }
    else if(this.currentEvent === 'Radiology List'){
      this.dataService.getData(`${Modules.getRadiologyPatient}?Hosp_code=${this.setData.hosp_Code}&StartDate=${formatDate(this.startDate, "MM-dd-YYYY", "en-Us")}&EndDate=${formatDate(this.endDate, "MM-dd-YYYY", "en-Us")}`).then((resp: any)=>{
        const data={
          resp:resp,
          selectedEvent:'radiology',
          isFilter:true,
          startDate:this.startDate,
          endDate:this.endDate
        }
        this.filterRegisterData.emit(data);
        this.modalRef.hide();
        this.startDate = '';
        this.endDate = '';
      });
    }
    else if(this.currentEvent === 'Appointments List'){
      this.dataService.getData(`${Modules.selectAllAppointmentByDate}?Hosp_code=${this.setData.hosp_Code}&StartDate=${formatDate(this.startDate, "MM-dd-YYYY", "en-Us")}&EndDate=${formatDate(this.endDate, "MM-dd-YYYY", "en-Us")}`).then((resp: any)=>{
        const data={
          resp:resp,
          selectedEvent:'appointments',
          isFilter:true,
          startDate:this.startDate,
          endDate:this.endDate
        }
        this.filterRegisterData.emit(data);
        this.modalRef.hide();
        this.startDate = '';
        this.endDate = '';
      });
    } else if (this.currentEvent === 'User List'){
      this.dataService.getData(`${Modules.getAllUser}?StartDate=${formatDate(this.startDate, "MM-dd-YYYY", "en-Us")}&EndDate=${formatDate(this.endDate, "MM-dd-YYYY", "en-Us")}&Hosp_Code=${this.setData.hosp_Code}`).then((resp : any)=>{
        const data ={
          resp:resp,
          selectedEvent:'user',
          isFilter:true,
          startDate:this.startDate,
          endDate:this.endDate
        }
        this.filterRegisterData.emit(data);
        this.modalRef.hide();
        this.startDate = '';
        this.endDate = '';
      })
    }
  }
}
