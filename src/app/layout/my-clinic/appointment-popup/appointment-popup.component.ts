import { formatDate } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ClinicService } from '@services/clinic.service';
import { DataService } from '@services/data.service';
import { TimeRange } from '@services/enum/time.enum';
import { Appointment, AppointmentStatus } from '@services/model/appointment.model';
import { Options } from '@services/model/option.model';
import { Modules } from '@urls';
import { Subscription } from 'rxjs';

@Component({
  selector: 'appointment-popup',
  templateUrl: './appointment-popup.component.html',
  styleUrls: ['./appointment-popup.component.scss']
})
export class AppointmentPopupComponent implements OnInit, OnDestroy {
  public selectedDate: Date = new Date();
  public days: any[] = [];
  public currentMonthYear: string = "";
  public events: any[] = [];
  public isSelected: boolean = true;
  public defaultTimePeriod: Options;
  public appointmentsSlot: any[] = []
  private selectViewSubscription: Subscription;
  private nextEventSUbscription: Subscription;
  private prevEventSUbscription: Subscription;

  public selectedClinicDateSubscription: Subscription;
  public timeRange = TimeRange;
  
  constructor(private dataService: DataService, private clinicService: ClinicService) { }

  ngOnInit(): void {
    if (this.selectViewSubscription) { this.selectViewSubscription.unsubscribe(); }
    this.selectedDate = new Date();
    this.defaultTimePeriod = { value: "Daily", key: "1" };
    this.getDays(this.selectedDate);
    this.clinicService.currentDate = this.selectedDate;

    if (this.nextEventSUbscription) { this.nextEventSUbscription.unsubscribe(); }
    this.nextEventSUbscription = this.clinicService.nextEvent.subscribe((data: any) => { if (data) {
       this.nextDays(); 
      } });

    if (this.prevEventSUbscription) { this.prevEventSUbscription.unsubscribe(); }
    this.prevEventSUbscription = this.clinicService.prevEvent.subscribe((data: any) => { if (data) { 
      this.previousDays(); 
    } })

    if (this.selectedClinicDateSubscription) { 
      this.selectedClinicDateSubscription.unsubscribe();
    }
    this.selectedClinicDateSubscription = this.clinicService.selectedClinicDate.subscribe((data: Date) => {
      if (data) {
        this.setAppointementDate(data);
      }
    });
  }
  
  

  getDays(date: Date): void {
    this.days = [];
    const startDate = new Date(date);
    if (this.defaultTimePeriod.value === TimeRange.Weekly) { startDate.setDate(startDate.getDate() - startDate.getDay()); }
    for (let i = 0; i < parseInt(this.defaultTimePeriod.key); i++) {
      this.days.push({ date: new Date(startDate), item: [] });
      startDate.setDate(startDate.getDate() + 1);
    }
    //this.loadAppointmentByDate(this.convertToFormattedDate(this.days[0].date, "YYYY-MM-ddTHH:mm:ss"), this.convertToFormattedDate(new Date(this.days[this.days.length - 1].date.setHours(23, 59, 59, 0)), "YYYY-MM-ddTHH:mm:ss"));
    this.loadAppointmentByDate(this.days[0].date, this.days[this.days.length - 1].date);
    if (this.defaultTimePeriod.value === TimeRange.Weekly) {
      this.clinicService.isShowArrow = false;
      if (this.convertToFormattedDate(this.days[0].date, "MMM") === this.convertToFormattedDate(this.days[this.days.length - 1].date, "MMM")) {
        this.clinicService.dayOnlyAppointmentLabel = `${this.convertToFormattedDate(this.days[0].date, "MMM YYYY")}`;
      } else {
        this.clinicService.dayOnlyAppointmentLabel = `${this.convertToFormattedDate(this.days[0].date, "MMM YYYY")} - ${this.convertToFormattedDate(this.days[this.days.length - 1].date, "MMM YYYY")}`;
      }
      this.clinicService.currentDate = this.days[0].date;
      this.selectedDate = this.days[0].date;
    } else if (this.defaultTimePeriod.value === TimeRange.Daily) {
      this.clinicService.dayOnlyAppointmentLabel = `${this.convertToFormattedDate(this.days[0].date, "dd MMM, YYYY | EEEE")}`;
      this.clinicService.isShowArrow = true;
      this.clinicService.currentDate = this.days[0].date;
      this.selectedDate = this.days[0].date;
    }
  }

  convertToFormattedDate(date: Date, format: string) {
    return formatDate(date, format, "en-US");
  }

  previousDays(): void {
    this.getDays(new Date(this.selectedDate.setDate(this.selectedDate.getDate() - parseInt(this.defaultTimePeriod.key))));
  }

  nextDays(): void {
    this.getDays(new Date(this.selectedDate.setDate(this.selectedDate.getDate() + parseInt(this.defaultTimePeriod.key))));
  }

  setAppointementDate(date: Date): void {
    this.getDays(date);
  }

  
  loadAppointmentByDate(startDate: string, endDate: string): void {
    if (this.defaultTimePeriod.value === TimeRange.Daily) {
      this.appointmentsSlot = [];
      this.dataService.getData<Appointment[]>(`${Modules.AppointmentSlotByDate}/${formatDate(new Date(startDate), "YYYY-MM-dd", "en-Us")}T00:00:00`).then((response) => {
        if (response && response.length) {
          this.appointmentsSlot = response
        }
      });
    }
    //this.dataService.postData<Appointment[]>(Modules.AppointmentByDateRange, { startDate: startDate, endDate: endDate }).then((response) => {
    this.dataService.postData<Appointment[]>(Modules.AppointmentByDateRange, { startDate: `${formatDate(new Date(startDate), "YYYY-MM-dd", "en-Us")}T00:00:00`, endDate: `${formatDate(new Date(endDate), "YYYY-MM-dd", "en-Us")}T00:00:00` }).then((response) => {
     
      if (response && response.length) {
        response.forEach((data) => {
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
        })
        this.days.forEach((day) => { day.item = response.filter(o => formatDate(new Date(o.appointmentDateTime), "YYYY-MM-dd", "en-Us") === formatDate(day.date, "YYYY-MM-dd", "en-Us")); });
      }
    });
  }

  convertToEndTime(date: Date, data: Appointment): Date {
    return new Date(new Date(date).setMinutes(new Date(date).getMinutes() + data.appointmentMinutes));
  }

  ngOnDestroy(): void {
    if (this.selectViewSubscription) { this.selectViewSubscription.unsubscribe() };
    if (this.nextEventSUbscription) { this.nextEventSUbscription.unsubscribe(); }
    if (this.prevEventSUbscription) { this.prevEventSUbscription.unsubscribe(); }
    if (this.selectedClinicDateSubscription) { this.selectedClinicDateSubscription.unsubscribe(); }
  }
}
