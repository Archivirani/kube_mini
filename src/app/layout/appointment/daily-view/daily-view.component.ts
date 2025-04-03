import { DatePipe, formatDate } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnDestroy, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AppointmentService } from '@services/appointment.service';
import { ClinicService } from '@services/clinic.service';
import { DataService } from '@services/data.service';
import { Appointment, AppointmentIsClinic, AppointmentStatus } from '@services/model/appointment.model';
import { ResourceService } from '@services/resource.service';
import { BookAppointmentPopupComponent } from '@shared/component/book-appointment-popup/book-appointment-popup.component';
import { PatientAppointmentsPopupComponent } from '@shared/component/patient-appointments-popup/patient-appointments-popup.component';
import { ReasonPopupComponent } from '@shared/component/reason-popup/reason-popup.component';
import { GlobalSearchFilter } from '@shared/pipes/global-search.pipe';
import { Modules } from '@urls';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'appointment-daily-view',
  templateUrl: './daily-view.component.html',
  styleUrls: ['../../appointment/appointment.component.scss'],
  providers: [GlobalSearchFilter]
})
export class DailyViewComponent implements OnDestroy {
  public currentDate: Date = new Date();
  public slotSubscription: Subscription;
  public onCloseSubscription: Subscription;
  public submitSubscription: Subscription;
  public cancelSubscription: Subscription;
  public patientAppointmentsSubscription:Subscription
  public AppointmentStatus = AppointmentStatus;
  public selectedDateType: { startDate?: Date, endDate?: Date } = {};
  public fromDay:any;
  public today: any;
  private downloadAppointmentSubscription: Subscription;
  public isIPadAir = false;
  public days: any[] = [];
  public daysBackup: any[] = [];
  public specialitiesData: any;
  public getDoctor: any;
  public selectedDoctor: any;
  public selectedSpeciality: any;
  public appointmentsSlot: any[] = [];
  public dropdown: FormGroup;
  public filterSubscription:Subscription;
  public getAppoinementData: any;
  public endDate: any;
  public startDate: any;
  public modalRef: BsModalRef;
  public isFilter:boolean=false;
  public appointmentList: any[] = [];
  @ViewChild('PatientAppointments') PatientAppointments: PatientAppointmentsPopupComponent;
  @ViewChild('filterPopup', { static: true }) filterPopup: TemplateRef<any>;

  @HostListener('window:load', ['$event'])
  @HostListener('window:resize', ['$event'])
  onResizeEvent() {
    window.innerWidth < 1260 ? this.isIPadAir = true : this.isIPadAir = false;
  }
  constructor(private resourceService: ResourceService,
    private appointmentService: AppointmentService,
    private dataService: DataService,
    public globalSearch: GlobalSearchFilter,
    public clinicService: ClinicService,
    public modalService: BsModalService,

  ) {
    this.resourceService.totalRecords.next(0);
    window.innerWidth < 1260 ? this.isIPadAir = true : this.isIPadAir = false;
    this.GetSpecialities();
    this.getDoctorList();
    if (this.downloadAppointmentSubscription) { this.downloadAppointmentSubscription.unsubscribe(); };
    this.downloadAppointmentSubscription = this.appointmentService.downloadAppointment.subscribe((resp) => {
      if (resp) {
        if (this.days && this.days.length) {
          
          this.onDownloadFile();
        }
      }
    });
    if(this.filterSubscription) { this.filterSubscription.unsubscribe(); }
    this.filterSubscription =this.clinicService.admitPatientEvent.subscribe((data) => {
      if (data) {
        this.startDate='';
        this.endDate='';
        this.modalRef = this.modalService.show(this.filterPopup, { backdrop: true, ignoreBackdropClick: false ,class:'filterPopup'});
      }
    });
    if (this.cancelSubscription) { this.cancelSubscription.unsubscribe() }
    this.cancelSubscription = this.resourceService.cancelEvent.subscribe((resp) => { if (resp && this.appointmentService.dayOnlyAppointment) { this.loadAppointment.emit({ doctorDetails: this.selectedDoctor, specialityDetails: this.selectedSpeciality }); } })

    if (this.submitSubscription) { this.submitSubscription.unsubscribe() }
    this.submitSubscription = this.resourceService.submitEvent.subscribe((resp) => {
      if (resp && this.appointmentService.dayOnlyAppointment) {
        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + 30 * 60000);
        this.openBookAppointment({ startTime: formatDate(startTime, "HH:mm", "en-US"), endTime: formatDate(endTime, "HH:mm", "en-US") })
      }
    })
    if (this.patientAppointmentsSubscription) { this.patientAppointmentsSubscription.unsubscribe() }
      this.patientAppointmentsSubscription = this.clinicService.submitEvent.subscribe((resp) => { 
      this.PatientAppointments.showPopup()
   });
    this.resourceService.searchQuerySubject.subscribe((res) => {
      const fieldNames = ["patient.medicalRecordNumber", "patient.firstName", "patient.familyName", "patient.contactNo1"];
      this.days = this.daysBackup.map((element) => {
        const data = this.globalSearch.transform(element.item, res, fieldNames)
        return { ...element, item: data }
      });
    });
    this.dropdown = new FormGroup({
      speciality: new FormControl(),
      doctor: new FormControl()
    });
    let getData = JSON.parse(sessionStorage.getItem('User')).doctor_Code;
    if(getData){
      this.getSlotByDateAndDoctCode(getData);
    }
    if (this.slotSubscription) { this.slotSubscription.unsubscribe() }
    this.slotSubscription = this.dataService.dataService.subscribe((res) => {
      if (res) {
        this.getSlotByDateAndDoctCode(res);
      }
    });
  }

  @Input('days') set daysData(data: any) {
    this.days = data;
    this.daysBackup = data;
  }

  // @Input() appointmentsSlot: any[] = [];

  @Input() currentDateAppointment: Date = new Date();
  @ViewChild('bookAppointment') bookAppointment: BookAppointmentPopupComponent;
  @ViewChild('reasonPopup') reasonPopup: ReasonPopupComponent;

  @Output() loadAppointment: EventEmitter<any> = new EventEmitter<any>();

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
 
    
  }


  public convertToEndTime(date: Date, data: Appointment): Date {
    return new Date(new Date(date).setMinutes(new Date(date).getMinutes() + data.appointmentMinutes));
  }

  serachInput(term: string, item: any) {
    term = term.toLowerCase();
    return (item.speciality_desc.toLowerCase().includes(term) || item.speciality_Code.toLowerCase().includes(term))
  }

  openBookAppointment(data: any): void {
    this.bookAppointment.showPopup({ ...data, appointmentDateTime: this.currentDateAppointment, doctorDetails: this.selectedDoctor, specialityDetails: this.selectedSpeciality,popupname:'Book Appointment'});
    if (this.onCloseSubscription) { this.onCloseSubscription.unsubscribe(); }
    this.onCloseSubscription = this.bookAppointment.onclose.subscribe((resp) => {
      if (resp) { this.loadAppointment.emit({ doctorDetails: this.selectedDoctor, specialityDetails: this.selectedSpeciality }); }
    });
  }

  onStatusChangeToClinic(data,item:any) {
    if(item.patient.isProvisional){
      Swal.fire({
        title: 'Please Complete Patient Registration Process',
        icon: 'warning',
        showCancelButton: false,
        showConfirmButton: true,
        confirmButtonText: "Ok",
        confirmButtonColor: '#3f7473',
        customClass: {
          container: 'notification-popup'
        }
      })
    }else{
      const setData=JSON.parse(sessionStorage.getItem('User'))
      this.dataService.postData<AppointmentIsClinic>(Modules.AppointmentPatientInClinic, { id: item.id, appointmentStatus: AppointmentStatus.CheckedIn,Updateby:setData.id, DateTime: new Date().toLocaleString() }).then((response) => {
        this.loadAppointment.emit({ doctorDetails: this.selectedDoctor, specialityDetails: this.selectedSpeciality });
      });
    }  
  }

  onCancel(data: Appointment) {
    this.reasonPopup.showPopup(data);
    if (this.onCloseSubscription) { this.onCloseSubscription.unsubscribe(); }
    this.onCloseSubscription = this.reasonPopup.onClose.subscribe((resp) => {
      this.dataService.postData<Appointment>(Modules.AppointmentCancel, {...resp}).then(() => this.loadAppointment.emit({ doctorDetails: this.selectedDoctor, specialityDetails: this.selectedSpeciality }));
    })
  }


  GetSpecialities(): void {
    const getUserData = JSON.parse(sessionStorage.User);
    this.dataService.getData<[]>(`${Modules.GetSpecialities}?Hosp_Code=${getUserData.hosp_Code}&Depat_code=dept_1`).then((res) => {
      if (res) {
        this.specialitiesData = res;
      }
    });
  }

  getDoctorBySpeciality(event: any) {
    this.dropdown.get('doctor').patchValue('')
    if (event) {
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
  }

  getDoctorList() {
    const getUserData = JSON.parse(sessionStorage.User);
    this.dataService.getData(`${Modules.GetGetDoctor}?Hosp_Code=${getUserData.hosp_Code}`).then((res: any) => {
      if (res) {
        this.getDoctor = res;

      }
    });
  }

  getSlotByDateAndDoctCode(event?: any) {
    this.startDate='';
    this.endDate='';
    const selectedSpeciality=this.selectedSpeciality?.speciality_Code;
    const selectedDoctor = this.getDoctor.find(d => d.doctor_Code === event.doctor_Code);
    if (selectedDoctor) {
      this.dataService.getData(`${Modules.slotByDateAndDoctCode}?date=${formatDate(this.appointmentService.currentDate, "MM-dd-YYYY", "en-Us")}&Doctor_Code=${selectedDoctor.doctor_Code}&Speciality_Code=${selectedSpeciality}`).then((res: any) => {
        if (res) {
          this.appointmentsSlot = res;
          this.isFilter=false;
          this.loadAppointment.emit({ doctorDetails: this.selectedDoctor, specialityDetails: this.selectedSpeciality });
        }
      });
    }
  }
  ngOnDestroy(): void {
    if (this.onCloseSubscription) { this.onCloseSubscription.unsubscribe(); };
    if (this.submitSubscription) { this.submitSubscription.unsubscribe() };
    if (this.cancelSubscription) { this.cancelSubscription.unsubscribe() };
    if (this.downloadAppointmentSubscription) { this.downloadAppointmentSubscription.unsubscribe(); };
    if (this.slotSubscription) { this.slotSubscription.unsubscribe() }
    if (this.patientAppointmentsSubscription) { this.patientAppointmentsSubscription.unsubscribe() }
    if(this.filterSubscription) { this.filterSubscription.unsubscribe(); }

  }
  onHideFilterPopup() {
    this.modalRef.hide();
    this.startDate='';
    this.endDate='';
  }
  filterAppointment() {
    this.isFilter=true;
    this.days=[];
    this.dataService.getData<Appointment[]>(`${Modules.ByDateStartDateEndDate}?StartDate=${formatDate(new Date(this.startDate), "MM-dd-YYYY", "en-Us")}&EndDate=${formatDate(new Date(this.endDate), "MM-dd-YYYY", "en-Us")}&Doctor_Code=${this.selectedDoctor?.doctor_Code}&Speciality_Code=${this.selectedSpeciality?.speciality_Code}`).then((resp) => {
      this.appointmentList = resp;
      this.resourceService.totalRecords.next(this.appointmentList.length);
        if (resp && resp.length) {
          this.appointmentService.dayOnlyAppointmentLabel=`${formatDate(new Date(this.startDate), "dd/MM/YYYY", "en-Us")} - ${formatDate(new Date(this.endDate), "dd/MM/YYYY", "en-Us")}`;
          this.modalRef.hide();
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
            this.daysBackup = this.days;
        }
        else{
          this.days=[]
        }
        this.modalRef.hide()
    });
}


  // getAppointmentByDoctor(event) {
  //   const selectedDoctor = this.getDoctor.find(d => d.doctor_Name === event).doctor_Code;
  //   const data = {
  //     selectedSpeciality: this.selectedSpeciality,
  //     selectedDoctor: event,
  //     doctor_Code:selectedDoctor
  //   }
  //   this.onGetAppointment.emit(data);
  //   this.getSlotByDateAndDoctCode(event)
  // }

}
