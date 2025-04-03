import { formatDate } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { ClinicService } from '@services/clinic.service';
import { Appointment } from '@services/model/appointment.model';
import { ResourceService } from '@services/resource.service';
import { BookAppointmentPopupComponent } from '@shared/component/book-appointment-popup/book-appointment-popup.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'weekly-popup-view',
  templateUrl: './weekly-popup-view.component.html',
  styleUrls: ['../../appointment-popup/appointment-popup.component.scss']
})
export class WeeklyPopupViewComponent implements OnDestroy {
  public currentDate: Date = new Date();
  public submitSubscription: Subscription;
  public cancelSubscription: Subscription;
  private onCloseSubscription: Subscription;

  @Input() days: any[] = [];

  @Output() previousEvent: EventEmitter<any> = new EventEmitter<any>();

  @Output() nextEvent: EventEmitter<any> = new EventEmitter<any>();

  @Output() selectedDate: EventEmitter<any> = new EventEmitter<any>();

  @Output() loadAppointment: EventEmitter<boolean> = new EventEmitter<any>();

  @ViewChild('bookAppointment') bookAppointment: BookAppointmentPopupComponent;

  constructor(private resourceService: ResourceService, public clinicService: ClinicService) {
    if (this.cancelSubscription) { this.cancelSubscription.unsubscribe() }
    this.cancelSubscription = this.resourceService.cancelEvent.subscribe((resp) => { if (resp && this.clinicService.dayOnlyAppointment) { this.loadAppointment.emit(true); } })

    if (this.submitSubscription) { this.submitSubscription.unsubscribe() }
    this.submitSubscription = this.resourceService.submitEvent.subscribe((resp) => { if (resp && this.clinicService.dayOnlyAppointment) { this.openBookAppointment() } })
  }

  public previousDays() {
    this.previousEvent.emit()
  }

  public nextDays() {
    this.nextEvent.emit()
  }

  openBookAppointment(): void {
    const data: any = { startTime: `${formatDate(new Date(), "HH:mm", "en-US")}:00`, endTime: `${formatDate(new Date().setMinutes(new Date().getMinutes() + 30), "HH:mm", "en-US")}:00` }
    this.bookAppointment.showPopup({ ...data, appointmentDateTime: new Date() });
    if (this.onCloseSubscription) { this.onCloseSubscription.unsubscribe(); }
    this.onCloseSubscription = this.bookAppointment.onclose.subscribe((resp) => {
      if (resp) { this.resourceService.cancelEvent.next(false) }
      this.onCloseSubscription.unsubscribe();
    });
  }

  public convertToEndTime(date: Date, data: Appointment): Date {
    return new Date(new Date(date).setMinutes(new Date(date).getMinutes() + data.appointmentMinutes));
  }

  onSelectedDayAppointment(date: Date): void {
    this.selectedDate.emit(date);
  }

  ngOnDestroy(): void {
    if (this.submitSubscription) { this.submitSubscription.unsubscribe() }
    if (this.cancelSubscription) { this.cancelSubscription.unsubscribe() }
    if (this.onCloseSubscription) { this.onCloseSubscription.unsubscribe() }
  }
}
