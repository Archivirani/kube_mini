import { formatDate } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { ClinicService } from '@services/clinic.service';
import { DataService } from '@services/data.service';
import { Appointment, AppointmentIsClinic, AppointmentStatus } from '@services/model/appointment.model';
import { ResourceService } from '@services/resource.service';
import { BookAppointmentPopupComponent } from '@shared/component/book-appointment-popup/book-appointment-popup.component';
import { ReasonPopupComponent } from '@shared/component/reason-popup/reason-popup.component';
import { Modules } from '@urls';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'daily-popup-view',
  templateUrl: './daily-popup-view.component.html',
  styleUrls: ['../../appointment-popup/appointment-popup.component.scss']
})
export class DailyPopupViewComponent implements OnDestroy {
  public currentDate: Date = new Date();
  public onCloseSubscription: Subscription;
  public submitSubscription: Subscription;
  public cancelSubscription: Subscription;
  public AppointmentStatus = AppointmentStatus;

  constructor(private resourceService: ResourceService, private clinicService: ClinicService, private dataService: DataService) {
    if (this.cancelSubscription) { this.cancelSubscription.unsubscribe() }
    this.cancelSubscription = this.resourceService.cancelEvent.subscribe((resp) => { if (resp && this.clinicService.dayOnlyAppointment) { this.loadAppointment.emit(true); } })

    if (this.submitSubscription) { this.submitSubscription.unsubscribe() }
    this.submitSubscription = this.resourceService.submitEvent.subscribe((resp) => { if (resp && this.clinicService.dayOnlyAppointment) { this.openBookAppointment({ startTime: `${formatDate(this.currentDate, "HH:mm", "en-US")}:00`, endTime: `${formatDate(this.currentDate.setMinutes(this.currentDate.getMinutes() + 30), "HH:mm", "en-US")}:00` }) } })
  }

  @Input() days: any[] = [];

  @Input() appointmentsSlot: any[] = [];

  @Input() currentDateAppointment: Date = new Date();

  @ViewChild('bookAppointment') bookAppointment: BookAppointmentPopupComponent;
  @ViewChild('reasonPopup') reasonPopup: ReasonPopupComponent;

  @Output() loadAppointment: EventEmitter<boolean> = new EventEmitter<boolean>();

  public convertToEndTime(date: Date, data: Appointment): Date {
    return new Date(new Date(date).setMinutes(new Date(date).getMinutes() + data.appointmentMinutes));
  }

  openBookAppointment(data: any): void {
    this.bookAppointment.showPopup({ ...data, appointmentDateTime: this.currentDateAppointment });
    if (this.onCloseSubscription) { this.onCloseSubscription.unsubscribe(); }
    this.onCloseSubscription = this.bookAppointment.onclose.subscribe((resp) => {
      if (resp) { this.loadAppointment.emit(true); }
    });
  }

  onStatusChangeToInClinic(item: any) {
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
      this.loadAppointment.emit(true);
    });
    }  
  }

  onCancel(data: Appointment) {
    this.reasonPopup.showPopup(data);
    if (this.onCloseSubscription) { this.onCloseSubscription.unsubscribe(); }
    this.onCloseSubscription = this.reasonPopup.onClose.subscribe((resp) => {
      this.dataService.postData<Appointment>(Modules.AppointmentCancel,{...resp}).then(() => this.loadAppointment.emit(true));
    })
  }

  onAgeTransformation(date: Date): number {
    return new Date().getFullYear() - new Date(date).getFullYear();
  }

  ngOnDestroy(): void {
    if (this.onCloseSubscription) { this.onCloseSubscription.unsubscribe(); }
    if (this.submitSubscription) { this.submitSubscription.unsubscribe() }
    if (this.cancelSubscription) { this.cancelSubscription.unsubscribe() }
  }
}
