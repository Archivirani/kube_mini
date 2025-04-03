import { DatePipe, formatDate } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, OnDestroy, Output, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AppointmentService } from '@services/appointment.service';
import { DataService } from '@services/data.service';
import { StatusFlags, eMessageIcon, eMessageType } from '@services/model/data.service.model';
import { Patient } from '@services/model/patient.model';
import { NotificationService } from '@services/notification.service';
import { PrintService } from '@services/print.service';
import { ResourceService } from '@services/resource.service';
import { BookAppointmentPopupComponent } from '@shared/component/book-appointment-popup/book-appointment-popup.component';
import { PatientDataFilterPopupComponent } from '@shared/component/patient-data-filter-popup/patient-data-filter-popup.component';
import { FilterPipe } from '@shared/pipes/filter.pipe';
import { SearchFilterPipe } from '@shared/pipes/search-filter.pipe';
import { FixedRoutes, Modules } from '@urls';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, Subscription } from 'rxjs';
import { PatientProfilePopupComponent } from './patient-profile/patient-profile-popup.component';
import { GlobalSearchFilter } from '@shared/pipes/global-search.pipe';
import { PatientListPopupComponent } from '@shared/component/patient-list-popup/patient-list-popup.component';
import Swal from 'sweetalert2';
import { User } from '@services/model/user.model';
@Component({
  selector: 'patient',
  templateUrl: './patient.component.html',
  styleUrls: ['./patient.component.scss'],
  providers: [BsModalService, SearchFilterPipe, FilterPipe, DatePipe, GlobalSearchFilter]
})
export class PatientComponent implements OnDestroy {
  public visibleDataBackup: Patient[];
  public visibleData: Patient[];
  public backupvisibleData: Patient[]; //
  public confirmSubscription: Subscription;
  public imageUrl: string = '';
  public qrImageUrl: string = '';
  private modalRef: BsModalRef;
  private onCloseSubscription: Subscription;
  public isIPadAir = false;
  private searchEventSubscription: Subscription;
  public submitSubscription: Subscription;
  public routerLink = FixedRoutes;
  public currentDate: Date = new Date();
  public searchTexts: string = '';
  public patientData: Patient;
  public PrintPatient: boolean = false;
  public printType: string;
  searchTextSubject = new Subject<string>();
  public userTypeId: number;
  public fieldToFilter: { fields: any[] } = {
    fields: ['medicalRecordNumber', 'contactNo1']
  };


  @ViewChild('generateQRCode', { static: true }) generateQRCode: TemplateRef<any>;
  @ViewChild('patientPopup', { static: true }) patientPopup: PatientProfilePopupComponent;
  @ViewChild('bookAppointment') bookAppointment: BookAppointmentPopupComponent;
  @ViewChild('patientList') patientList: PatientListPopupComponent;
  @ViewChild('filterPopup') filterPopup: PatientDataFilterPopupComponent;
  @ViewChild('printPatientDetails', { static: true }) PrintPatientDetails: TemplateRef<any>;
  @Output() loadAppointment: EventEmitter<boolean> = new EventEmitter<boolean>();

  @HostListener('window:load', ['$event'])
  @HostListener('window:resize', ['$event'])
  onResizeEvent() {
    window.innerWidth < 1260 ? this.isIPadAir = true : this.isIPadAir = false;
  }

  constructor(
    private dataService: DataService,
    private modalService: BsModalService,
    private notificationService: NotificationService,
    private router: Router,
    private printService: PrintService,
    private resourceService: ResourceService,
    public appointmentService: AppointmentService,
    private filter: SearchFilterPipe,
    private globalSearch: GlobalSearchFilter,
  ) {
    window.innerWidth < 1260 ? this.isIPadAir = true : this.isIPadAir = false;
    this.onload(); this.imageUrl = `${Modules.Images}${sessionStorage.TenantCode}/Images/`;

    if (this.submitSubscription) { this.submitSubscription.unsubscribe() }
    this.submitSubscription = this.resourceService.filterEvent.subscribe((resp) => { this.searchFilter() })

    this.resourceService.searchQuerySubject.subscribe((res) => {
      const fieldNames = ["medicalRecordNumber", "firstName", "familyName", "dateOfBirth", "contactNo1", "identificationNo", "gender"]
      this.visibleData = this.globalSearch.transform(this.visibleDataBackup, res, fieldNames);
      if (res) { this.loadAppointment.emit(true); }
    });
    this.userTypeId = JSON.parse(sessionStorage.getItem('UserTypeId'));

  }

  onload(): void {
    this.dataService.getData<Patient[]>(Modules.Patient).then((data) => {
      this.visibleData = [];
      if (data && data.length) {
        this.visibleData = data;
        this.visibleDataBackup = data;
        this.resourceService.totalRecords.next(this.visibleData.length);
      }
    });
  }

  onEdit(data: Patient) {
    let setData = JSON.parse(sessionStorage.getItem('User'))
    let updatedBy = setData.updatedBy;
    this.router.navigate([`${FixedRoutes.Patient}/${FixedRoutes.PatientEdit}`],
      { state: { ...data, updatedBy: updatedBy } });
  }
  onDelete(data: Patient, isDeleted: boolean, isActive: boolean, status: string) {
    this.dataService.notify.next({ key: eMessageType.Warning, value: `Do You really want to ${status}  this patient?`, icon: eMessageIcon.Warning })

    if (this.confirmSubscription) { this.confirmSubscription.unsubscribe(); }
    let getdata = JSON.parse(sessionStorage.getItem('User'));
    this.confirmSubscription = this.notificationService.confirmationProcess.subscribe((resp) => {
      if (resp) { this.dataService.post(`${Modules.ActiveInactivePatient}?id=${data.id}&IsDeleted=${isDeleted}&IsActive=${isActive}&Deleteby=${getdata.id}&ActionDatetime=${new Date().toISOString()}`, data.id).then(() => this.onload()); }
    })
  }

  onSendMail(data: Patient) {
    this.dataService.get(`${Modules.PatientCard}/${data.id}`).then((response) => {
      if (response.status === StatusFlags.Success) {
        this.dataService.notify.next({ key: eMessageType.Success, value: "Sent Mail Successfully!", icon: eMessageIcon.Success })
      }
    });
  }

  onLoadQrCode(data: Patient) {
    this.patientData = data;
    this.dataService.getData(`${Modules.GenerateQRCode}/${data.medicalRecordNumber}`).then((resp) => {
      if (!!resp) {
        this.qrImageUrl = `data:image/jpeg;base64,${resp}`;
        this.PrintPatient = true;
        this.modalRef = this.modalService.show(this.PrintPatientDetails, { backdrop: true, ignoreBackdropClick: false, class: 'qr-popup' });
      }
    });
  }

  printErPatientData() {
    if (this.printType === "patientCard") {
      this.printService?.pdfPatientData("patientCard");
      this.modalRef.hide()
      this.PrintPatient = false;
    }
    else if (this.printType === "patient") {
      this.printService?.print(document.getElementById("printPatients")?.innerHTML);
      this.modalRef.hide()
      this.PrintPatient = false;
    }
    this.printType = '';
  }

  closePopup() {
    this.modalRef.hide();
    this.PrintPatient = false;
    this.printType = '';
  }

  printDocument() {
    if (this.qrImageUrl) {
      this.printService.print(document.getElementById("qrImage").innerHTML);
    }
  }

  openPatientPopup(data: Patient): void {
    this.patientPopup.showPatientProfile(data);
  }

  ngOnDestroy(): void {
    if (this.confirmSubscription) { this.confirmSubscription.unsubscribe() };
    if (this.searchEventSubscription) { this.searchEventSubscription.unsubscribe() };
    if (this.onCloseSubscription) { this.onCloseSubscription.unsubscribe(); }
    if (this.submitSubscription) { this.submitSubscription.unsubscribe() }
  }


  openBookAppointment(data: any): void {
    if (data.isDeleted) {
      Swal.fire({
        title: 'Patient is Inactive!',
        icon: 'warning',
        showCancelButton: false,
        showConfirmButton: true,
        confirmButtonText: "Ok",
        confirmButtonColor: '#3f7473',
        customClass: {
          container: 'notification-popup'
        }
      })
    } else {
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + 30 * 60000);
      this.bookAppointment.showPopup({ ...data, appointmentDateTime: startTime, startTime: formatDate(startTime, "HH:mm", "en-US"), endTime: formatDate(endTime, "HH:mm", "en-US") });
      if (this.onCloseSubscription) {
        this.onCloseSubscription.unsubscribe();
      }
      this.onCloseSubscription = this.bookAppointment.onclose.subscribe((resp) => {
        if (resp) {
          this.loadAppointment.emit(true);
        }
      });
    }
  }

  openAppointmentModel(data: any): void {
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 30 * 60000);
    this.patientList.showPopup({ ...data, appointmentDateTime: new Date(), startTime: formatDate(startTime, "HH:mm", "en-US"), endTime: formatDate(endTime, "HH:mm", "en-US") });
    if (this.onCloseSubscription) { this.onCloseSubscription.unsubscribe(); }
    this.onCloseSubscription = this.patientList.onclose.subscribe((resp) => {
      if (resp) { this.loadAppointment.emit(true); }
    });
  }

  openAdmitPatient(data: any) {
    if (data.isDeleted) {
      Swal.fire({
        title: 'Patient is Inactive!',
        icon: 'warning',
        showCancelButton: false,
        showConfirmButton: true,
        confirmButtonText: "Ok",
        confirmButtonColor: '#3f7473',
        customClass: {
          container: 'notification-popup'
        }
      })
    }
    else {
      this.resourceService.getSelectedPatient = data;
      this.router.navigate(['/inpatient-registration'])
    }

  }
  searchFilter(): void {
    this.filterPopup.showPopup();
    if (this.onCloseSubscription) { this.onCloseSubscription.unsubscribe(); }
    this.onCloseSubscription = this.filterPopup.onClose.subscribe((resp) => {
      this.visibleData = this.filter.transform(this.visibleDataBackup, resp);
      if (this.visibleData && this.visibleData.length != 0) {
        if (resp) { this.loadAppointment.emit(true); }

      }
      else {
        Swal.fire({
          title: "No Patients found for the specified data!",
          showCloseButton: true,
          showConfirmButton: true,
          confirmButtonText: "Register a New Patient",
          confirmButtonColor: '#3f7473',
          customClass: {
            container: 'patient-popup',
          }
        }).then((result) => {
          if (result.value) {
            this.filterPopup.closePopup();
            this.router.navigate([`${FixedRoutes.Patient}/${FixedRoutes.PatientRegister}`]);
          }
        });
      }
    });
  }

  handleSearchDataFormValue(formValue: any) {
    this.backupvisibleData = formValue;
  }
}
