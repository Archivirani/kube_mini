import { DatePipe, formatDate } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, Output, TemplateRef, ViewChild } from '@angular/core';
import { AppointmentService } from '@services/appointment.service';
import { DataService } from '@services/data.service';
import { Appointment, AppointmentStatus } from '@services/model/appointment.model';
import { ResourceService } from '@services/resource.service';
import { BookAppointmentPopupComponent } from '@shared/component/book-appointment-popup/book-appointment-popup.component';
import { Modules } from '@urls';
import { Subscription } from 'rxjs';
import { DailyPopupViewComponent } from '../../my-clinic/appointment-popup/daily-popup-view/daily-popup-view.component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ClinicService } from '@services/clinic.service';

@Component({
  selector: 'appointment-weekly-view',
  templateUrl: './weekly-view.component.html',
  styleUrls: ['../../appointment/appointment.component.scss']
})
export class WeeklyViewComponent implements OnDestroy {
  public currentDate: Date = new Date();
  public submitSubscription: Subscription;
  public cancelSubscription: Subscription;
  private onCloseSubscription: Subscription;
  private fromDay: string = "";
  private today: string = "";
  public selectedDoctor: any;
  public specialitiesData: any;
  public getDoctor:any;
  public selectedSpeciality: any;
  private downloadAppointmentSubscription: Subscription;
  public appointmentsSlot: any[] = [];
  public filterSubscription:Subscription;
  public getAppoinementData: any;
  public endDate: any;
  public startDate: any;
  public modalRef: BsModalRef;
  public isFilter:boolean=false;
  public appointmentList: any[] = [];
  @Input() days: any[] = [];

  @Output() previousEvent: EventEmitter<any> = new EventEmitter<any>();

  @Output() nextEvent: EventEmitter<any> = new EventEmitter<any>();

  @Output() selectedDate: EventEmitter<any> = new EventEmitter<any>();

  @Output() loadAppointment: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('bookAppointment') bookAppointment: BookAppointmentPopupComponent;
  @ViewChild('filterPopup', { static: true }) filterPopup: TemplateRef<any>;
  constructor(private resourceService: ResourceService, public appointmentService: AppointmentService, private dataService: DataService ,public clinicService: ClinicService, public modalService: BsModalService,) {
    this.resourceService.totalRecords.next(0);
    if (this.downloadAppointmentSubscription) { this.downloadAppointmentSubscription.unsubscribe(); };
    this.downloadAppointmentSubscription = this.appointmentService.downloadAppointment.subscribe((resp) => {
      if (resp) {
        if (this.days && this.days.length) {
          this.onDownloadFile();
        }
      }
    })
    if (this.cancelSubscription) { this.cancelSubscription.unsubscribe() }
    this.cancelSubscription = this.resourceService.cancelEvent.subscribe((resp) => { if (resp && this.appointmentService.dayOnlyAppointment) { this.loadAppointment.emit({doctorDetails: this.selectedDoctor, specialityDetails: this.selectedSpeciality }); } })

    if (this.submitSubscription) { this.submitSubscription.unsubscribe() }
    this.submitSubscription = this.resourceService.submitEvent.subscribe((resp) => { if (resp && this.appointmentService.dayOnlyAppointment) { this.openBookAppointment() } })
      this.getDoctorList();
      this.GetSpecialities();
      if(this.filterSubscription) { this.filterSubscription.unsubscribe(); }
    this.filterSubscription =this.clinicService.admitPatientEvent.subscribe((data) => {
      if (data) {
        this.modalRef = this.modalService.show(this.filterPopup, { backdrop: true, ignoreBackdropClick: false ,class:'filterPopup'});
      }
    });
  }

  public previousDays() {
    this.previousEvent.emit()
  
  }

  public nextDays() {
    this.nextEvent.emit()
  }

  onDownloadFile() {
    let setData=JSON.parse(sessionStorage.getItem('User'))
    if(this.isFilter){
         let startDate=`${formatDate(this.startDate, "MM-dd-YYYY", "en-Us")}`;
      let endDate=`${formatDate(this.endDate, "MM-dd-YYYY", "en-Us")}`
     
    this.dataService.downloadFile(`${Modules.DownloadAppoinmentList}?StartDate=${startDate}&EndDate=${endDate}&Hosp_Code=${setData.hosp_Code}&Speciality_Code=${this.selectedSpeciality?.speciality_Code}&Doctor_Code=${this.selectedDoctor?.doctor_Code}`, { startDate: this.fromDay, endDate: this.today }, `${new DatePipe('en-US').transform(new Date(), 'ddMMyyyyHHmmss')}.xlsx`)
    }else{
      this.fromDay = `${formatDate(new Date(this.days[0]?.date?.setHours(0, 0, 0, 0)), "YYYY-MM-dd", "en-Us")}T23:59:59`;
          this.today = `${formatDate(new Date(this.days[this.days.length - 1]?.date?.setHours(23, 59, 59, 59)), "YYYY-MM-dd", "en-Us")}T00:00:00`;
         let startDate=`${formatDate(this.fromDay, "MM-dd-YYYY", "en-Us")}`;
        let endDate=`${formatDate(this.today, "MM-dd-YYYY", "en-Us")}`
    this.dataService.downloadFile(`${Modules.DownloadAppoinmentList}?StartDate=${startDate}&EndDate=${endDate}&Hosp_Code=${setData.hosp_Code}&Speciality_Code=${this.selectedSpeciality?.speciality_Code}&Doctor_Code=${this.selectedDoctor?.doctor_Code}`, { startDate: this.fromDay, endDate: this.today }, `${new DatePipe('en-US').transform(new Date(), 'ddMMyyyyHHmmss')}.xlsx`)
    }  
  };

  GetSpecialities(): void {
    const getUserData = JSON.parse(sessionStorage.User);
    this.dataService.getData<[]>(`${Modules.GetSpecialities}?Hosp_Code=${getUserData.hosp_Code}&Depat_code=dept_1`).then((res) => {
      if (res) {
        this.specialitiesData = res;
      }
    });
  }

  getDoctorBySpeciality(event: any) {
  
    const getUserData = JSON.parse(sessionStorage.User);
    const selectedSpeciality = this.specialitiesData.find(d => d.speciality_Code === event.speciality_Code);
    if (selectedSpeciality) {
      this.dataService.getData(`${Modules.GetGetDoctor}?Hosp_Code=${getUserData.hosp_Code}&Depat_code=${selectedSpeciality.dept_Code}&Speciality_Code=${selectedSpeciality.speciality_Code}`).then((res: any) => {
        if (res) {
          this.getDoctor = res;
          
        }
      });
    }
  }
  getAppoinmentData(event:any){
    if(this.selectedDoctor){
      this.loadAppointment.emit({ doctorDetails: this.selectedDoctor, specialityDetails: this.selectedSpeciality });
      }
  }
  getSlotByDateAndDoctCode(event: any) {
    const selectedSpeciality=this.selectedSpeciality.speciality_Code;
    const selectedDoctor = this.getDoctor.find(d => d.doctor_Code === event.doctor_Code);
    if (selectedDoctor) {
      this.dataService.getData(`${Modules.slotByDateAndDoctCode}?date=${this.appointmentService.currentDate.toLocaleString()}&Doctor_Code=${selectedDoctor.doctor_Code}&Speciality_Code=${selectedSpeciality}`).then((res: any) => {
        if (res) {
          this.appointmentsSlot = res;
          this.isFilter=false;
        }
      });
    }
  }
  getDoctorList(){
    const getUserData = JSON.parse(sessionStorage.User);
    this.dataService.getData(`${Modules.GetGetDoctor}?Hosp_Code=${getUserData.hosp_Code}`).then((res: any) => {
      if (res) {
        this.getDoctor = res;
        
      }
    });
  }
  openBookAppointment(): void {
    const data: any = { startTime: `${formatDate(new Date(), "HH:mm", "en-US")}:00`, endTime: `${formatDate(new Date().setMinutes(new Date().getMinutes() + 30), "HH:mm", "en-US")}:00` }
    this.bookAppointment.showPopup({ ...data, appointmentDateTime: new Date() ,doctorDetails: this.selectedDoctor, specialityDetails: this.selectedSpeciality,popupname:'Book Appointment'});
    if (this.onCloseSubscription) { this.onCloseSubscription.unsubscribe(); }
    this.onCloseSubscription = this.bookAppointment.onclose.subscribe((resp) => {
      if (resp) {  this.loadAppointment.emit({ doctorDetails: this.selectedDoctor, specialityDetails: this.selectedSpeciality }); 
        this.resourceService.cancelEvent.next(false) }
      this.onCloseSubscription.unsubscribe();
    });
  }

  public convertToEndTime(date: Date, data: Appointment): Date {
    return new Date(new Date(date).setMinutes(new Date(date).getMinutes() + data.appointmentMinutes));
  }

  onSelectedDayAppointment(date: Date): void {
    this.selectedDate.emit(date);
  }
  onHideFilterPopup() {
    this.modalRef.hide();
    this.startDate='';
    this.endDate='';
  }
  filterAppointment() {
    this.isFilter=true;
    this.days = []; 
    this.dataService.getData<Appointment[]>(`${Modules.ByDateStartDateEndDate}?StartDate=${formatDate(new Date(this.startDate), "MM-dd-YYYY", "en-Us")}&EndDate=${formatDate(new Date(this.endDate), "MM-dd-YYYY", "en-Us")}&Doctor_Code=${this.selectedDoctor?.doctor_Code}&Speciality_Code=${this.selectedSpeciality?.speciality_Code}`).then((resp) => {
      this.appointmentList = resp;
      this.resourceService.totalRecords.next(this.appointmentList.length);
        if (resp && resp.length) {
            resp.forEach((data) => {
                const currentTime = formatDate(new Date(), "HH:mm:ss", "en-US");
                const currentDate = formatDate(new Date(), "YYYY-MM-dd", "en-US");
                const appointmentDate = formatDate(data.appointmentDateTime, "YYYY-MM-dd", "en-US");
                if ((appointmentDate < currentDate && data.appointmentStatus === AppointmentStatus.Planned) || (appointmentDate === currentDate && data.startTime < currentTime && data.appointmentStatus === AppointmentStatus.Planned)) {
                    data.appointmentStatus = AppointmentStatus.NotShow;
                }
                switch (data.appointmentStatus) {
                    case AppointmentStatus.NotShow:
                        data.statusColor = "appointment-status-yellow";
                        data.statusText = "Not Show";
                        break;
                    case AppointmentStatus.CheckedIn:
                        data.statusColor = "appointment-status-green";
                        data.statusText = "Checked In";
                        break;
                    case AppointmentStatus.Cancelled:
                        data.statusColor = "appointment-status-red";
                        data.statusText = "Cancelled";
                        break;
                    case AppointmentStatus.ClosedEncounter:
                        data.statusColor = "appointment-status-blue";
                        data.statusText = "Closed Encounter";
                        break;
                    case AppointmentStatus.Planned:
                        data.statusColor = "appointment-status-gray";
                        data.statusText = "Planned";
                        break;
                }
                data.isExisting = true; // Set isExisting to true
                let day = this.days.find(d => formatDate(d.date, "YYYY-MM-dd", "en-US") === appointmentDate);
                if (!day) {
                    day = {
                        date: appointmentDate,
                        item: []
                    };
                    this.days.push(day);
                }
                day.item.push(data);
            });
            this.modalRef.hide()
        }
    });
}


  ngOnDestroy(): void {
    if (this.submitSubscription) { this.submitSubscription.unsubscribe() };
    if (this.cancelSubscription) { this.cancelSubscription.unsubscribe() };
    if (this.onCloseSubscription) { this.onCloseSubscription.unsubscribe() };
    if (this.downloadAppointmentSubscription) { this.downloadAppointmentSubscription.unsubscribe(); };
    if(this.filterSubscription) { this.filterSubscription.unsubscribe(); }
  }
}
