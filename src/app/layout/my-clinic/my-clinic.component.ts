import { formatDate } from '@angular/common';
import { Component, HostListener, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ClinicService } from '@services/clinic.service';
import { DataService } from '@services/data.service';
import { Appointment, AppointmentIsClinic, AppointmentStatus } from '@services/model/appointment.model';
import { StatusFlags } from '@services/model/data.service.model';
import { FilterModel } from '@services/model/filter.model';
import { ResourceService } from '@services/resource.service';
import { FilterPipe } from '@shared/pipes/filter.pipe';
import { GlobalSearchFilter } from '@shared/pipes/global-search.pipe';
import { FixedRoutes, Modules } from '@urls';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'my-clinic',
  templateUrl: './my-clinic.component.html',
  styleUrls: ['./my-clinic.component.scss'],
  providers: [BsModalService, FilterPipe,GlobalSearchFilter]
})
export class MyClinicComponent implements OnDestroy {
  public visibleOrderedNonCounterData: Appointment[];
  public visibleData: Appointment[];
  public visibleOrderedData: Appointment[];
  public visibleNotOrderedData: Appointment[];
  public isCounter: boolean = false;
  public appointmentStatus = AppointmentStatus;
  public submitSubscription: Subscription;
  private modalRef: BsModalRef;
  public isIPadAir = false;
  public selectedDate: Date = new Date();
  private nextEventSUbscription: Subscription;
  private prevEventSUbscription: Subscription;
  private searchEventSubscription: Subscription;
  public searchSubscription:Subscription;
  public selectedClinicDateSubscription: Subscription;

  @ViewChild('AppointmentPopup', { static: true }) AppointmentPopup: TemplateRef<any>;
  @HostListener('window:load', ['$event'])
  @HostListener('window:resize', ['$event'])
  onResizeEvent() {
    window.innerWidth < 1260 ? this.isIPadAir = true : this.isIPadAir = false;
  }

  constructor(private filter: FilterPipe, private dataService: DataService, private router: Router,
    private modalService: BsModalService, public clinicService: ClinicService,public globalSearch:GlobalSearchFilter,
    public resourceService: ResourceService) {
    this.resourceService.totalRecords.next(0);
    window.innerWidth < 1260 ? this.isIPadAir = true : this.isIPadAir = false;
    if (this.submitSubscription) { this.submitSubscription.unsubscribe(); }
    this.submitSubscription = this.clinicService.submitEvent.subscribe((resp) => {
      if (resp) {
        this.modalRef = this.modalService.show(this.AppointmentPopup, { backdrop: true, ignoreBackdropClick: false, class: 'appointment-popup' });
      }
    })
    this.resourceService.dayOnlyAppointmentLabel = `Today`;
    this.onload(this.selectedDate);
    this.resourceService.clinicDate = this.selectedDate;

    if (this.nextEventSUbscription) { this.nextEventSUbscription.unsubscribe(); }
    this.nextEventSUbscription = this.resourceService.nextEvent.subscribe((data: any) => {
      if (data) {
        this.onload(new Date(this.selectedDate.setDate(this.selectedDate.getDate() + 1)));
        this.resourceService.dayOnlyAppointmentLabel = this.getSelectedDate();
        this.resourceService.clinicDate = this.selectedDate;
      }
    });
    if (this.searchSubscription) { this.searchSubscription.unsubscribe(); }
    this.searchSubscription=this.resourceService.searchQuerySubject.subscribe((res) => {
      const fieldNames = ["patient.medicalRecordNumber","patient.dateOfBirth","patient.gender","appointmentType.name","patient.familyName","patient.firstName","appointmentStatus","appointmentType.name","physician.name","doctors.doctor_Name","specialities.speciality_desc"]
      this.visibleOrderedData = this.globalSearch.transform(this.visibleData, res, fieldNames);
    });

    if (this.prevEventSUbscription) { this.prevEventSUbscription.unsubscribe(); }
    this.prevEventSUbscription = this.resourceService.prevEvent.subscribe((data: any) => {
      if (data) {
        this.onload(new Date(this.selectedDate.setDate(this.selectedDate.getDate() - 1)));
        this.resourceService.dayOnlyAppointmentLabel = this.getSelectedDate();
        this.resourceService.clinicDate = this.selectedDate;
      }
    });
    this.searchEventSubscription = this.resourceService.searchEvent.subscribe((resp) => {
      const filterConfig: FilterModel = { fields: ['medicalRecordNumber', 'firstName', 'familyName', 'contactNo1'], searchText: resp };
      const data = this.filter.transform(this.visibleData, filterConfig);
      this.visibleOrderedData = data.filter(d => (d.appointmentStatus !== AppointmentStatus.ClosedEncounter || d.appointmentStatus === AppointmentStatus.ClosedEncounter)).sort((a, b) => a.appointmentDateTime < b.appointmentDateTime ? -1 : 1);
    })

    if (this.selectedClinicDateSubscription) {
      this.selectedClinicDateSubscription.unsubscribe();
    }
    this.selectedClinicDateSubscription = this.resourceService.selectedClinicDate.subscribe((data: Date) => {
      if (data) {
        this.onload(data);
        this.selectedDate = data;
        this.resourceService.dayOnlyAppointmentLabel = this.getSelectedDate();
        this.resourceService.clinicDate = data;
      }
    });
  }

  getSelectedDate() {
    return `${this.convertToFormattedDate(this.selectedDate, "dd MMM, yyyy | EEEE")}` === `${this.convertToFormattedDate(new Date(), "dd MMM, yyyy | EEEE")}` ? 'Today' : `${this.convertToFormattedDate(this.selectedDate, "dd MMM, yyyy | EEEE")}`;
  }

  closePopup() {
    this.modalRef.hide();
  }

  convertToFormattedDate(date: Date, format: string) {
    return formatDate(date, format, "en-US");
  }

  onload(date: Date): void {
    this.resourceService.totalRecords.next(0);
    const setData=JSON.parse(sessionStorage.getItem('User'))
    if(setData.userTypeId == 5){
      this.dataService.getData<Appointment[]>(`${Modules.getDoctorsOpAppointment}?date=${formatDate(date, "yyyy-MM-dd", "en-Us")}T00:00:00&Hosp_Code=${setData.hosp_Code}&Doctor_Code=${setData.doctor_Code}`).then((data) => {
        this.visibleOrderedData = [];
        this.visibleNotOrderedData = [];
        if (data && data.length) {
          data.forEach((element) => {
            element.patient.profileUrl = !!element.patient.profileUrl ? `${Modules.Images}${sessionStorage.TenantCode}/Images/${element.patient.profileUrl}` : ""
          });
          this.resourceService.totalRecords.next(data.length);
          this.visibleData = data.slice();
          this.visibleOrderedData = data.filter(d => (d.appointmentStatus !== AppointmentStatus.ClosedEncounter || d.appointmentStatus === AppointmentStatus.ClosedEncounter)).sort((a, b) => a.appointmentDateTime < b.appointmentDateTime ? -1 : 1);
        }
      });
    }else{
      this.dataService.getData<Appointment[]>(`${Modules.AppointmentInClinic}/${formatDate(date, "yyyy-MM-dd", "en-Us")}T00:00:00`).then((data) => {
        this.visibleOrderedData = [];
        this.visibleNotOrderedData = [];
        if (data && data.length) {
          data.forEach((element) => {
            element.patient.profileUrl = !!element.patient.profileUrl ? `${Modules.Images}${sessionStorage.TenantCode}/Images/${element.patient.profileUrl}` : ""
          });
          this.resourceService.totalRecords.next(data.length);
          this.visibleData = data.slice();
          // this.visibleOrderedNonCounterData = data.filter(d => !d.patient.isOrdered && d.appointmentStatus !== AppointmentStatus.ClosedEncounter)
          this.visibleOrderedData = data.filter(d => (d.appointmentStatus !== AppointmentStatus.ClosedEncounter || d.appointmentStatus === AppointmentStatus.ClosedEncounter)).sort((a, b) => a.appointmentDateTime < b.appointmentDateTime ? -1 : 1);
        }
      });
    }
    
  }

  onStatusChangeToCloseEncounter(data: Appointment) {
    this.isCounter = true;
    if (data.appointmentStatus !== AppointmentStatus.ClosedEncounter) {
      this.dataService.post<AppointmentIsClinic>(Modules.AppointmentPatientCloseEncounter, { id: data.id, appointmentStatus: AppointmentStatus.ClosedEncounter, updatedBy: data.updatedBy }).then((response) => {
        if (response.status === StatusFlags.Success) {
          this.onload(this.selectedDate);
        }
      });
    }
  }

  patientDetails(data: Appointment) {
    this.clinicService.getAppoinmentId = data.appointmentTypeId
    if (!this.isCounter) {
      this.router.navigate([`${FixedRoutes.MyClinic}/${FixedRoutes.MyClinicDetails}`], { state: data });
    } else {
      this.isCounter = false
    }
  }

  public convertToEndTime(date: string, data: Appointment): Date {
    return new Date(new Date(date).setMinutes(new Date(date).getMinutes() + data.appointmentMinutes));
  }

  onDestroy(): void {
    if (this.submitSubscription) { this.submitSubscription.unsubscribe(); }
  }

  ngOnDestroy(): void {
    if (this.nextEventSUbscription) { this.nextEventSUbscription.unsubscribe(); }
    if (this.prevEventSUbscription) { this.prevEventSUbscription.unsubscribe(); }
    if (this.searchEventSubscription) { this.searchEventSubscription.unsubscribe(); }
    if (this.selectedClinicDateSubscription) { this.selectedClinicDateSubscription.unsubscribe(); }
    if (this.submitSubscription) { this.submitSubscription.unsubscribe(); }
  }
}
