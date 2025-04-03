import { formatDate } from '@angular/common';
import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AppointmentService } from '@services/appointment.service';
import { ClinicService } from '@services/clinic.service';
import { DataService } from '@services/data.service';
import { TimeRange } from '@services/enum/time.enum';
import { Appointment, AppointmentStatus } from '@services/model/appointment.model';
import { FilterModel } from '@services/model/filter.model';
import { Options } from '@services/model/option.model';
import { ResourceService } from '@services/resource.service';
import { FilterPipe } from '@shared/pipes/filter.pipe';
import { Modules } from '@urls';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'appointment',
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.scss'],
  providers: [FilterPipe, BsModalService]
})
export class AppointmentComponent implements OnInit, OnDestroy {
  public currentDate: Date = new Date()
  public selectedDate: Date = new Date();
  public days: any[] = [];
  public daysBackup: any[] = [];
  public currentMonthYear: string = "";
  public events: any[] = [];
  public isSelected: boolean = true;
  public defaultTimePeriod: Options;
  public appointmentsSlot: any[] = []
  private selectViewSubscription: Subscription;
  private nextEventSUbscription: Subscription;
  private prevEventSUbscription: Subscription;
  private searchEventSubscription: Subscription;
  public appointmentList: any[] [];
  private selectedAppoinmentDateSubscription: Subscription;
  public timeRange = TimeRange;
  private specialityDoctorDetails: any;
  constructor(private filter: FilterPipe, private dataService: DataService,
    private resourceService: ResourceService,
    public clinicService: ClinicService,
    private appointmentService: AppointmentService,
  ) { 
    this.resourceService.totalRecords.next(0);
  }

  ngOnInit(): void {
    if (this.selectViewSubscription) { this.selectViewSubscription.unsubscribe(); }
    this.selectedDate = new Date();
    this.defaultTimePeriod = this.appointmentService.appointmentView.find(o => o.value === this.appointmentService.defaultView);
    this.getDays(this.selectedDate);
    setTimeout(() => {
      this.appointmentService.dayOnlyAppointment = true;
    }, 100)
    this.selectViewSubscription = this.appointmentService.selectedView.subscribe((data: string) => {

      this.resourceService.searchText = "";
      this.selectedDate = new Date();
      this.defaultTimePeriod = this.appointmentService.appointmentView.find(o => o.value === data);
      this.getDays(this.selectedDate);
      //this.appointmentService.isShowCalender = false;
    })
   

    if (this.nextEventSUbscription) { this.nextEventSUbscription.unsubscribe(); }
    this.nextEventSUbscription = this.appointmentService.nextEvent.subscribe((data: any) => {
      if (data) {

        this.resourceService.searchText = "";
        this.nextDays();
      }
    });

    if (this.prevEventSUbscription) { this.prevEventSUbscription.unsubscribe(); }
    this.prevEventSUbscription = this.appointmentService.prevEvent.subscribe((data: any) => {
      if (data) {

        this.resourceService.searchText = "";
        this.previousDays();
      }
    })

    if (this.selectedAppoinmentDateSubscription) { this.selectedAppoinmentDateSubscription.unsubscribe(); }

    this.selectedAppoinmentDateSubscription = this.appointmentService.selectedAppoinmentDate.subscribe((data: any) => {
      if (data) {
        if (this.appointmentService.isCalShown) {
          this.resourceService.searchText = "";
          this.setAppointementDate(data);
        }
        this.appointmentService.isCalShown = false;
      }
    })

    this.searchEventSubscription = this.resourceService.searchEvent.subscribe((resp) => {
      const filterConfig: FilterModel = { fields: ['medicalRecordNumber', 'firstName', 'familyName', 'contactNo1'], searchText: resp };
      this.days = this.filter.transform(this.daysBackup, filterConfig);
    })
  }


  getDays(date: Date, item?): void {
    this.days = [];
    const startDate = new Date(date);
    if (this.defaultTimePeriod.value === TimeRange.Weekly) { startDate.setDate(startDate.getDate() - startDate.getDay()); }
    for (let i = 0; i < parseInt(this.defaultTimePeriod.key); i++) {
      this.days.push({ date: new Date(startDate), item: [] });
      startDate.setDate(startDate.getDate() + 1);
    }
    this.specialityDoctorDetails = item;
    if (item) {
      this.loadAppointmentByDate(this.days[0].date, this.days[this.days.length - 1].date, item);
    }
    if (this.defaultTimePeriod.value === TimeRange.Weekly) {
      this.appointmentService.isShowArrow = false;
      this.appointmentService.dayOnlyAppointmentLabel = `${this.convertToFormattedDate(this.days[0].date, "dd/MM/yyyy")} - ${this.convertToFormattedDate(this.days[this.days.length - 1].date, "dd/MM/yyyy")}`;
      this.appointmentService.currentDate = this.days[0].date;
      this.selectedDate = this.days[0].date;
    } else if (this.defaultTimePeriod.value === TimeRange.Daily) {
      this.appointmentService.dayOnlyAppointmentLabel = `${this.convertToFormattedDate(this.days[0].date, "dd MMM, yyyy | EEEE")}`;
      this.appointmentService.currentDate = this.days[0].date;
      this.selectedDate = this.days[0].date;
      this.appointmentService.isShowArrow = true;
    }
  }
 

  convertToFormattedDate(date: Date, format: string) {
    return formatDate(date, format, "en-US");
  }

  previousDays(): void {
    this.getDays(new Date(this.selectedDate.setDate(this.selectedDate.getDate() - parseInt(this.defaultTimePeriod.key))), this.specialityDoctorDetails);
  }

  nextDays(): void {
    this.getDays(new Date(this.selectedDate.setDate(this.selectedDate.getDate() + parseInt(this.defaultTimePeriod.key))), this.specialityDoctorDetails);
  }

  setAppointementDate(date: Date): void {
    this.getDays(date);
  }


  onSelectDate(date: Date): void {
    this.appointmentService.defaultView = TimeRange.Daily;
    this.defaultTimePeriod.value = TimeRange.Daily;
    this.getDays(date);
  }

  loadAppointmentByDate(startDate: string, endDate: string, item): void {
    var storedObject = JSON.parse(sessionStorage.User);
    // this.dataService.getData<Appointment[]>(`${Modules.ByDateRangeAndDocCode}?StartDate=${formatDate(new Date(startDate), "MM-dd-YYYY", "en-Us")}&EndDate=${formatDate(new Date(endDate), "MM-dd-YYYY", "en-Us")}&Hosp_Code=${storedObject.hosp_Code}&Speciality_Code=${item.specialityDetails.speciality_Code}&Doctor_Code=${item.doctorDetails.doctor_Code}`).then((resp) => {
      this.dataService.getData<Appointment[]>(`${Modules.ByDateRangeAndDocCode}?StartDate=${formatDate(new Date(startDate), "MM-dd-YYYY", "en-Us")}&EndDate=${formatDate(new Date(endDate), "MM-dd-YYYY", "en-Us")}&Hosp_Code=${storedObject.hosp_Code}&Doctor_Code=${item.doctorDetails?.doctor_Code}`).then((resp) => {
        if (resp) {
          this.appointmentList = resp['appointments'];
          this.resourceService.totalRecords.next(this.appointmentList.length);
          if (resp['appointments'] && resp['appointments'].length) {

          resp['appointments'].forEach((data) => {
            const currentTime = formatDate(new Date(), "HH:mm:ss", "en-US");
            const currentDate = formatDate(new Date(), "YYYY-MM-dd", "en-US");
            const appointmentDate = formatDate(data.appointmentDateTime, "YYYY-MM-dd", "en-US");
            if ((appointmentDate < currentDate && data.appointmentStatus === AppointmentStatus.Planned) || (appointmentDate === currentDate && data.startTime < currentTime && data.appointmentStatus === AppointmentStatus.Planned)) { data.appointmentStatus = AppointmentStatus.NotShow; };
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
            data.isExisting = true;
          })
          this.days.forEach((day) => {
            day.item = resp['appointments'].filter(o => formatDate(new Date(o.appointmentDateTime), "YYYY-MM-dd", "en-Us") === formatDate(day.date, "YYYY-MM-dd", "en-Us"));
          });
          this.daysBackup = this.days;
        }
      }
    })
  }

  
  // loadAppointmentByFilter(startDate: string, endDate: string): void {
  //   var storedObject = JSON.parse(sessionStorage.User);
  //   // this.dataService.getData<Appointment[]>(`${Modules.ByDateRangeAndDocCode}?StartDate=${formatDate(new Date(startDate), "MM-dd-YYYY", "en-Us")}&EndDate=${formatDate(new Date(endDate), "MM-dd-YYYY", "en-Us")}&Hosp_Code=${storedObject.hosp_Code}&Speciality_Code=${item.specialityDetails.speciality_Code}&Doctor_Code=${item.doctorDetails.doctor_Code}`).then((resp) => {
  //     this.dataService.getData<Appointment[]>(`${Modules.AppointmentByDateRange}?StartDate=${formatDate(new Date(startDate), "MM-dd-YYYY", "en-Us")}&EndDate=${formatDate(new Date(endDate), "MM-dd-YYYY", "en-Us")}&Hosp_Code=${storedObject.hosp_Code}}`).then((resp) => {
  //     if (resp) {
  //       if (resp['appointments'] && resp['appointments'].length) {

  //         resp['appointments'].forEach((data) => {
  //           const currentTime = formatDate(new Date(), "HH:mm:ss", "en-US");
  //           const currentDate = formatDate(new Date(), "YYYY-MM-dd", "en-US");
  //           const appointmentDate = formatDate(data.appointmentDateTime, "YYYY-MM-dd", "en-US");
  //           if ((appointmentDate < currentDate && data.appointmentStatus === AppointmentStatus.Planned) || (appointmentDate === currentDate && data.startTime < currentTime && data.appointmentStatus === AppointmentStatus.Planned)) { data.appointmentStatus = AppointmentStatus.NotShow; };
  //           switch (data.appointmentStatus) {
  //             case AppointmentStatus.NotShow:
  //               data.statusColor = "appointment-status-yellow";
  //               data.statusText = "Not Show";
  //               break;
  //             case AppointmentStatus.CheckedIn:
  //               data.statusColor = "appointment-status-green";
  //               data.statusText = "Checked In";
  //               break;
  //             case AppointmentStatus.Cancelled:
  //               data.statusColor = "appointment-status-red";
  //               data.statusText = "Cancelled";
  //               break;
  //             case AppointmentStatus.ClosedEncounter:
  //               data.statusColor = "appointment-status-blue";
  //               data.statusText = "Closed Encounter";
  //               break;
  //             case AppointmentStatus.Planned:
  //               data.statusColor = "appointment-status-gray";
  //               data.statusText = "Planned";
  //               break;
  //           }
  //           data.isExisting = true;
  //         })
  //         this.days.forEach((day) => {
  //           day.item = resp['appointments'].filter(o => formatDate(new Date(o.appointmentDateTime), "YYYY-MM-dd", "en-Us") === formatDate(day.date, "YYYY-MM-dd", "en-Us"));
  //         });
  //         this.daysBackup = this.days;
  //       }
  //     }
  //   })
  // }
  convertToEndTime(date: Date, data: Appointment): Date {
    return new Date(new Date(date).setMinutes(new Date(date).getMinutes() + data.appointmentMinutes));
  }

  getAppointmentByDoctor(event) {
    this.getDays(this.selectedDate, event);
  }

  ngOnDestroy(): void {
    if (this.selectViewSubscription) { this.selectViewSubscription.unsubscribe() };
    if (this.nextEventSUbscription) { this.nextEventSUbscription.unsubscribe(); }
    if (this.prevEventSUbscription) { this.prevEventSUbscription.unsubscribe(); }
    if (this.searchEventSubscription) { this.searchEventSubscription.unsubscribe(); }
    if (this.selectedAppoinmentDateSubscription) { this.selectedAppoinmentDateSubscription.unsubscribe(); }
  }
}
