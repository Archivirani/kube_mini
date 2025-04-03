import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ResourceService } from '@services/resource.service';
import { Subject, Subscription } from 'rxjs';
import { Options } from '@services/model/option.model';
import { TimeRange } from '@services/enum/time.enum';
import { DatePipe, formatDate } from '@angular/common';
import { FixedRoutes, Modules } from '@urls';
import { Order } from '@services/model/clinic.model';
import { DataService } from '@services/data.service';
import { Router } from '@angular/router';
import { ClinicService } from '@services/clinic.service';
import { Appointment } from '@services/model/appointment.model';
import { AdmittedpatientEditpopupComponent } from './patient-services/admittedpatient-editpopup/admittedpatient-editpopup.component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Patient } from '@services/model/patient.model';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { DischargePopupComponent } from './patient-services/discharge-popup/discharge-popup.component';
import { TransferpatientPopupComponent } from './patient-services/transferpatient-popup/transferpatient-popup.component';
import { GlobalSearchFilter } from '@shared/pipes/global-search.pipe';
import { PrintService } from '@services/print.service';
import { PrintWristbandService } from '@services/print-wristband.service';
import { AppointmentService } from '@services/appointment.service';
import { ReasonPopupComponent } from '@shared/component/reason-popup/reason-popup.component';
@Component({
  selector: 'app-admitted-patient',
  templateUrl: './admitted-patient.component.html',
  styleUrls: ['./admitted-patient.component.scss'],
  providers: [GlobalSearchFilter]
})
export class AdmittedPatientComponent implements OnInit, OnDestroy {
  public visibleDataBackup: any[];
  public routerLink = FixedRoutes;
  private modalRef: BsModalRef;
  public selectedDate: Date = new Date();
  private prevEventSUbscription: Subscription;
  private nextEventSUbscription: Subscription;
  private admitPatientEventSUbscription: Subscription;
  public selectedClinicDateSubscription: Subscription;
  private downloadPaymentSubscription: Subscription;
  public searchSubscription: Subscription;
  public defaultTimePeriod: Options;
  private parameterData: any;
  public UserTypeId: any;
  public days: any[] = [];
  public visibleData: any[];
  public isIPadAir = false;
  public timeRange = TimeRange;
  public isCounter: boolean = false;
  public isEdit: boolean = false;
  public admitpatient: FormGroup;
  public admissionTypeslist: any[] = [];
  public caseTypelist: any[] = [];
  public getSpecialitylist: any[] = [];
  public getPhysicianlist: any[] = [];
  public admissionStatus: any[] = [];
  public getFloorslist: any[] = [];
  public getRoomslist: any[] = [];
  public getBadlist: any[] = [];
  public getPatientid: any[] = [];
  public retrivePatientData: any[] = [];
  public isFilter: boolean = false;
  public patientPrintDetails: any;
  public specialtyList: any;
  public floorsList: any;
  public doctorsList: any;
  public barcodeMRN: string;
  public eventsSubject: Subject<void> = new Subject<void>();
  public printType: string;
  public PrintPatient: boolean = false;
  public floorId: any;
  public attendingPhysician: any;
  public speciality: any;
  public endDate: any;
  public startDate: any;
  public filterSubscription:Subscription;
  public onCloseSubscription: Subscription;
  @ViewChild('admitPatientEventlist', { static: true }) admitPatientEventlist: TemplateRef<any>;
  @ViewChild('AdmittedpatientEditpopup') AdmittedpatientEditpopup: AdmittedpatientEditpopupComponent;
  @ViewChild('dischargepopup') dischargepopup: DischargePopupComponent;
  @ViewChild('transferpatientPopup') transferpatientPopup: TransferpatientPopupComponent;
  @ViewChild('reasonPopup') reasonPopup: ReasonPopupComponent;
  @ViewChild('printPatientDetails', { static: true }) PrintPatientDetails: TemplateRef<any>;
  @ViewChild('filterPopup', { static: true }) filterPopup: TemplateRef<any>;
  patientdata: any;
  constructor(private dataService: DataService, private appointmentService: AppointmentService, private globalSearch: GlobalSearchFilter, public clinicService: ClinicService, private resourceService: ResourceService, private router: Router, private modalService: BsModalService, private printService: PrintService, private wristbandService: PrintWristbandService) {
    window.innerWidth < 1260 ? this.isIPadAir = true : this.isIPadAir = false;
    if (this.searchSubscription) { this.searchSubscription.unsubscribe(); }
    this.searchSubscription = this.resourceService.searchQuerySubject.subscribe((res) => {
      const fieldNames = ["patientAdmission.patient.medicalRecordNumber", "patientAdmission.patient.firstName", "patientAdmission.patient.familyName", "patientAdmission.patient.gender", "patientAdmission.patient.dateOfBirth", "patientAdmission.admDate", "patientAdmission.admTime", "floors.floornumber", "rooms.roomNumber", "bads.badNumber", "patientAdmission.attendDoctor.doctor_Name", "specialities.speciality_desc", "patientAdmission.admissionStatus.status", "rooms.roomNumber/bads.badNumber", "rooms.roomsStatus.status"]
      this.visibleData = this.globalSearch.transform(this.visibleDataBackup, res, fieldNames);
    });

    this.resourceService.dayOnlyAppointmentLabel = `Today`;
    this.onload(this.selectedDate);
    this.resourceService.admittedPatientDate = this.selectedDate;
    this.resourceService.dayOnlyAppointmentLabel = this.getSelectedDate();

    if (this.nextEventSUbscription) { this.nextEventSUbscription.unsubscribe(); }
    this.nextEventSUbscription = this.resourceService.nextEvent.subscribe((data: any) => {
      if (data) {
        this.onload(new Date(this.selectedDate.setDate(this.selectedDate.getDate() + 1)));
        this.resourceService.dayOnlyAppointmentLabel = this.getSelectedDate();
        this.resourceService.admittedPatientDate = this.selectedDate;
      }
    });

    if (this.prevEventSUbscription) { this.prevEventSUbscription.unsubscribe(); }
    this.prevEventSUbscription = this.resourceService.prevEvent.subscribe((data: any) => {
      if (data) {
        this.onload(new Date(this.selectedDate.setDate(this.selectedDate.getDate() - 1)));
        this.resourceService.dayOnlyAppointmentLabel = this.getSelectedDate();
        this.resourceService.admittedPatientDate = this.selectedDate;
      }
    });

    if (this.selectedClinicDateSubscription) {
      this.selectedClinicDateSubscription.unsubscribe();
    }
    this.selectedClinicDateSubscription = this.resourceService.selectedClinicDate.subscribe((data: Date) => {
      if (data) {
        this.onload(data);
        this.selectedDate = data;
        this.resourceService.dayOnlyAppointmentLabel = this.getSelectedDate();
        this.resourceService.admittedPatientDate = data;
      }
    });

    if (this.admitPatientEventSUbscription) { this.admitPatientEventSUbscription.unsubscribe(); }
    this.admitPatientEventSUbscription = this.clinicService.admitPatientEvent.subscribe((res) => {
      this.modalRef = this.modalService.show(this.admitPatientEventlist, { backdrop: true, ignoreBackdropClick: false });
    });

    if (this.downloadPaymentSubscription) { this.downloadPaymentSubscription.unsubscribe(); }
    this.downloadPaymentSubscription = this.appointmentService.downloadAppointment.subscribe((data) => {
      if (data) {
        this.onDownloadPaymentFile();
      }
    });

    if (this.filterSubscription) { this.filterSubscription.unsubscribe(); }
    this.filterSubscription = this.resourceService.submitEvent.subscribe((data) => {
      if (data) {
        this.startDate = '';
        this.endDate = '';
        this.attendingPhysician = '';
        this.floorId = '';
        this.speciality = '';
        this.modalRef = this.modalService.show(this.filterPopup, { backdrop: true, ignoreBackdropClick: false, class: 'filterPopup' });
      }
    });

    this.admitpatient = new FormGroup({
      patientId: new FormControl(),
      patientName: new FormControl(),
      caseType: new FormControl('', [Validators.required, this.caseTypeValidator()]),
      admissionType: new FormControl('', Validators.required),
      admReason: new FormControl(),
      comment: new FormControl(),
      admTime: new FormControl(new Date()),
      admDate: new FormControl(new Date(), [Validators.required, this.dateValidator()]),
      admissionStatusId: new FormControl(),
      status: new FormControl('', Validators.required),
      estLeght: new FormControl(),
      specialities: new FormControl(),
      floorId: new FormControl('', Validators.required),
      roomId: new FormControl('', Validators.required),
      badId: new FormControl('', Validators.required),
      attendingPhysician: new FormControl('', Validators.required),
      admittedPhysician: new FormControl(),
      doctor_code: new FormControl(),
      attendDoctor_code: new FormControl(),
      admittedDoctor_code: new FormControl(),
      speciality_Code: new FormControl('', Validators.required),
    });
  }
  ngOnInit(): void {
    this.getSelectCaseTypesTbl();
    this.getSelectAdmissionTypesTbl();
    this.getSelectgetFloors();
    this.getAdmissionStatus();
    this.getSpeciality();
    this.getSpecialityList();
    this.getFloorsList();
    this.getDoctorslist();
    this.UserTypeId = JSON.parse(sessionStorage.getItem('UserTypeId'));
  }
  setErPatientValue(event: any) {
    if (event == 3) {
      this.admitpatient.controls['speciality_Code'].setValue("spe_13");
      this.admitpatient.controls['admissionType'].setValue(2);
      this.admitpatient.controls['status'].setValue(3);
      this.admitpatient.controls['floorId'].setValue(33);
      if (this.admitpatient.controls['floorId'].value == 33) {
        this.getSelectgetRooms(this.admitpatient.controls['floorId'].value);
      }

    } else {
      this.admitpatient.patchValue({
        speciality_Code: '',
        floorId: '',
        admissionStatus: '',
        admissionType: ''
      });
    }
  }
  onDownloadPaymentFile() {
    let getdata = JSON.parse(sessionStorage.getItem('User'));
    const formattedStartDate = this.startDate ? formatDate(this.startDate, "MM-dd-YYYY", "en-Us") : '';
    const formattedEndDate = this.endDate ? formatDate(this.endDate, "MM-dd-YYYY", "en-Us") : '';
    if (this.isFilter == true) {
      this.dataService.downloadFile(
        `${Modules.admittedPatientDownload}?Hosp_Code=${getdata.hosp_Code}&Startdate=${formattedStartDate}&Enddate=${formattedEndDate}`,
        { startDate: formattedStartDate, endDate: formattedEndDate },
        `${new DatePipe('en-US').transform(new Date(), 'ddMMyyyyHHmmss')}.xlsx`
      );
    } else {
      const formattedStartDate = `${formatDate(this.selectedDate, "MM-dd-YYYY", "en-Us")}`;
      this.dataService.downloadFile(
        `${Modules.admittedPatientDownload}?Hosp_Code=${getdata.hosp_Code}&Startdate=${formattedStartDate}&Enddate=${formattedStartDate}`,
        { startDate: formattedStartDate, endDate: formattedStartDate },
        `${new DatePipe('en-US').transform(new Date(), 'ddMMyyyyHHmmss')}.xlsx`
      );
    }
  }
  getSelectCaseTypesTbl() {
    this.dataService.getData<[]>(Modules.getSelectCaseTypesTbl).then((res: any) => {
      if (res && res.length) {
        this.caseTypelist = res;
        if (this.admitpatient && this.admitpatient.controls['caseType']) {
          this.admitpatient.controls['caseType'].setValue(res[0]?.caseName);
        }
      }
    });
  }
  getSpeciality() {
    let getData = JSON.parse(sessionStorage.getItem('User'));
    this.dataService.getData<[]>(`${Modules.getSpeciality}?Hosp_code=${getData.hosp_Code}`).then((res: any) => {
      if (res && res.length) {
        this.getSpecialitylist = res;
        this.getAttendingPhysician(res[4]?.speciality_Code);
      }
    });
  }
  getSelectgetFloors() {
    let getData = JSON.parse(sessionStorage.getItem('User'));
    this.dataService.getData<[]>(`${Modules.getFloors}?Hosp_code=${getData.hosp_Code}`).then((res) => {
      if (res && res.length) {
        this.getFloorslist = res;
      }
    });
  }
  getSelectgetRooms(event) {
    const floornumber = this.getFloorslist.find(d => d.id === event).id
    this.dataService.getData<[]>(`${Modules.getRooms}?FloorsId=${floornumber}`).then((res: any) => {
      if (res && res.length) {
        this.getRoomslist = res.filter(d => !d.isBooked);
        this.admitpatient?.get('roomId').patchValue(' ');
        this.admitpatient?.get('badId').patchValue(' ');

      }
    });
  }
  getSelectgetBads(event) {
    const badNumber = this.getRoomslist.find(d => d.id === event).id
    this.dataService.getData<[]>(`${Modules.getBads}?RoomId=${badNumber}`).then((res: any) => {
      if (res && res.length) {
        this.getBadlist = res.filter(d => !d.isBooked);
      }
    });
  }


  getSelectAdmissionTypesTbl() {
    this.dataService.getData<[]>(Modules.getSelectAdmissionTypesTbl).then((res) => {
      if (res && res.length) {
        this.admissionTypeslist = res;
      }
    });
  }
  getAdmissionStatus() {
    this.dataService.getData<[]>(Modules.getAdmissionStatus).then((res) => {
      if (res && res.length) {
        this.admissionStatus = res;
      }
    });
  }
  getAttendingPhysician(event) {
    let getData = JSON.parse(sessionStorage.getItem('User'));
    this.getPhysicianlist = [];
    let speciality_Code = this.getSpecialitylist.find(d => d.speciality_Code === event).speciality_Code;
    this.dataService.getData<[]>(`${Modules.GetGetDoctor}?Hosp_Code=${getData.hosp_Code}&Speciality_Code=${speciality_Code}`).then((res) => {
      if (res) {
        this.getPhysicianlist = res;
        this.admitpatient.get('admittedPhysician').patchValue('');
        this.admitpatient.get('attendingPhysician').patchValue('');
      }
    });
  }


  getPatient(data: any) {
    if (data.length >= 6) {
      this.dataService.getData<Patient[]>(Modules.PatientSearch, data).then((resp) => {
        if (resp && resp.length) {
          this.getPatientid = resp;
          let data = resp[0];
          let getPatientName = data.firstName + '' + data.secondName + '' + data.thirdName + '' + data.familyName;
          this.admitpatient.get('patientName').patchValue(getPatientName);
        }
        else {
          Swal.fire({
            title: "No Patient Found!",
            icon: 'warning',
            showConfirmButton: true,
            confirmButtonText: "Ok",
            confirmButtonColor: '#3f7473',
            cancelButtonColor: '#e71d36',
            customClass: {
              container: 'notification-popup'
            }
          }).then((result) => {
            if (result.value) {
              this.modalRef.hide();
              this.router.navigate([`${FixedRoutes.Admittedpatient}`]);
            }
          });
          this.admitpatient.get('patientName').patchValue('');
          this.admitpatient.get('patientId').patchValue('');
        }
      });
    } else {
      this.admitpatient.updateValueAndValidity();
    }
  }

  previousDays(): void {
    this.getDays(new Date(this.selectedDate.setDate(this.selectedDate.getDate() - parseInt(this.defaultTimePeriod.key))), this.parameterData);
  }
  getSpecialityList() {
    const setData = JSON.parse(sessionStorage.getItem('User'));
    this.dataService.getData(`${Modules.getSpeciality}?Hosp_code=${setData.hosp_Code}`).then((resp: any) => {
      this.specialtyList = resp;
    });
  }
  getFloorsList() {
    const setData = JSON.parse(sessionStorage.getItem('User'));
    this.dataService.getData(`${Modules.getAllFloorsList}?Hosp_code=${setData.hosp_Code}`).then((resp: any) => {
      this.floorsList = resp;
    });
  }
  getDoctorslist() {
    const setData = JSON.parse(sessionStorage.getItem('User'));
    this.dataService.getData(`${Modules.getAttendingPhysician}?Hosp_code=${setData.hosp_Code}`).then((resp: any) => {
      this.doctorsList = resp;
    });
  }
  filterData() {
    this.isFilter = true;
    let setData = JSON.parse(sessionStorage.getItem('User'));
    let startDateParam = this.startDate ? formatDate(this.startDate, "MM-dd-YYYY", "en-Us") : '';
    let endDateParam = this.endDate ? formatDate(this.endDate, "MM-dd-YYYY", "en-Us") : '';
    let floorid = this.floorId ? this.floorId : 0;
    let Hosp_Code = setData.hosp_Code;
    let attendingPhysicians = this.attendingPhysician ? this.attendingPhysician : '';
    let specialities = this.speciality ? this.speciality : '';
    this.visibleData = [];
    this.dataService.getData<any[]>(`${Modules.getPatientRoomList}?Hopt_code=${Hosp_Code}&Startdate=${startDateParam}&Endtdate=${endDateParam}&FloorId=${floorid}&AttendDoctor=${attendingPhysicians}&Speciality_Code=${specialities}`).then((data: any) => {
      this.retrivePatientData = data;
      this.resourceService.totalRecords.next(this.retrivePatientData.length);
      if (data && data.length) {
        this.resourceService.dayOnlyAppointmentLabel = `${formatDate(this.startDate, "dd-MM-YYYY", "en-Us")} To ${formatDate(this.endDate, "dd-MM-YYYY", "en-Us")}`
        this.visibleData = data;
        this.visibleDataBackup = data;
        this.modalRef.hide();
      } else {
        this.visibleData = data.slice();
      }
    });
    this.eventsSubject.next();
  }

  onload(date: Date): void {
    let setData = JSON.parse(sessionStorage.getItem('User'));
    let Hosp_Code = setData.hosp_Code;
    this.dataService.getData<any[]>(`${Modules.getPatientRoomList}?Hopt_code=${Hosp_Code}&Startdate=${formatDate(date, "MM-dd-YYYY", "en-Us")}&Endtdate=${formatDate(date, "MM-dd-YYYY", "en-Us")}`).then((data) => {
      this.retrivePatientData = data;
      this.resourceService.totalRecords.next(this.retrivePatientData.length);
      this.visibleData = [];
      if (data && data.length) {
        this.visibleData = data;
        this.visibleDataBackup = data;
      } else {
        this.visibleData = data.slice();
      }
    });
    this.eventsSubject.next();
  }

  patientDetails(data: Appointment) {
    if (!this.isCounter) {
      if (data.patientAdmission.admissionStatus.status === "Planned") {
        Swal.fire({
          title: "Patient has a Planned Admission, no services can be added!",
          icon: 'warning',
          showCancelButton: false,
          showConfirmButton: true,
          confirmButtonText: "Ok",
          confirmButtonColor: '#3f7473',
          customClass: {
            container: 'notification-popup'
          }
        }).then((result) => {
          if (result.value) {
            this.modalRef.hide();
            this.router.navigate([`${FixedRoutes.Admittedpatient}`]);
          }
        });
      }
      else {
        let UserTypeId = JSON.parse(sessionStorage.getItem('User'))
        if (UserTypeId.userTypeId !== 13) {
          this.router.navigate([`${FixedRoutes.Admittedpatient}/${FixedRoutes.AdmittedpatientDetails}`], { state: data });
        }
      }
    } else {
      this.isCounter = false
    }
  }
  nextDays(): void {
    this.getDays(new Date(this.selectedDate.setDate(this.selectedDate.getDate() + parseInt(this.defaultTimePeriod.key))), this.parameterData);
  }
  getSelectedDate() {
    return `${this.convertToFormattedDate(this.selectedDate, "dd MMM, yyyy | EEEE")}` === `${this.convertToFormattedDate(new Date(), "dd MMM, yyyy | EEEE")}` ? 'Today' : `${this.convertToFormattedDate(this.selectedDate, "dd MMM, yyyy | EEEE")}`;
  }

  convertToFormattedDate(date: Date, format: string) {
    return formatDate(date, format, "en-US");
  }

  getDays(date: Date, item?): void {
    this.days = [];
    const startDate = new Date(date);
    for (let i = 0; i < parseInt(this.defaultTimePeriod.key); i++) {
      this.days.push({ date: new Date(startDate), item: [] });
      startDate.setDate(startDate.getDate() + 1);
    }
  }


  onTransferPopup(data) {
    if (data.patientAdmission.admissionStatus.status === "Planned") {
      Swal.fire({
        title: "Patient has a Planned Admission, Patient can’t be transferred!",
        icon: 'warning',
        showCancelButton: false,
        showConfirmButton: true,
        confirmButtonText: "Ok",
        confirmButtonColor: '#3f7473',
        customClass: {
          container: 'notification-popup'
        }
      }).then((result) => {
        if (result.value) {
          this.modalRef?.hide();
          this.router.navigate([`${FixedRoutes.Admittedpatient}`]);
        }
      });
    } else {
      this.transferpatientPopup.showPopup(data)
    }
  }
  onEdit(data): void {
    this.AdmittedpatientEditpopup.showPopup(data)
  }
  onCancel() {
    this.modalRef.hide();
    this.clearFields();
  }
  clearFields() {
    this.admitpatient.get('roomId').patchValue(' ');
    this.admitpatient.get('badId').patchValue(' ');
    this.admitpatient.get('patientId').patchValue(' ');
    this.admitpatient.get('patientName').patchValue('');
    this.admitpatient.get('admissionType').patchValue(' ');
    this.admitpatient.get('specialities').patchValue(' ');
    this.admitpatient.get('comment').patchValue(' ');
    this.admitpatient.get('admReason').patchValue(' ');
    this.admitpatient.get('status').patchValue(' ');
    this.admitpatient.get('speciality_Code').patchValue(' ');
    this.admitpatient.get('admittedPhysician').patchValue(' ');
    this.admitpatient.get('attendingPhysician').patchValue(' ');
    this.admitpatient.get('floorId').patchValue(' ');
    this.admitpatient.get('estLeght').patchValue(' ');
    this.admitpatient.get('admDate').patchValue(new Date().toLocaleString());
    this.admitpatient.get('admTime').patchValue(new Date());
  }

  onDeleteRecord(data) {
    if(!data.order?.isPaid){
      this.reasonPopup.showPopup(data);
      const setData = JSON.parse(sessionStorage.getItem('User'));
        if (this.onCloseSubscription) { this.onCloseSubscription.unsubscribe(); }
          this.onCloseSubscription = this.reasonPopup.onClose.subscribe((resp) => {
            this.dataService.postData<[]>(`${Modules.cancelAdmission}?PatientAdmissionId=${data.patientAdmissionId}&CancelledBy=${setData.id}`,true).then((res) => {
              this.onload(this.selectedDate);
            })
        })
    }else{
    if (!data.order?.isPaid) {
      Swal.fire({
        title: "Are you sure you want to cancel the admission?",
        icon: 'warning',
        showCancelButton: true,
        showConfirmButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        confirmButtonColor: '#3f7473',
        cancelButtonColor: '#e71d36',
        customClass: {
          container: 'notification-popup'
        }
      }).then((result) => {
        const setData = JSON.parse(sessionStorage.getItem('User'));
        if (result.value) {
          this.dataService.postData<[]>(`${Modules.cancelAdmission}?PatientAdmissionId=${data.patientAdmissionId}&CancelledBy=${setData.id}`).then((res) => {
            this.onload(this.selectedDate);
          })
        } else {
          this.router.navigate([`${FixedRoutes.Admittedpatient}`])
        }
      })
    }
    else {
      Swal.fire({
        title: "Patient has an issued Invoice, Cancelling discharge isn't possible!",
        icon: 'warning',
        showConfirmButton: true,
        confirmButtonText: "Okay",
        confirmButtonColor: '#3f7473',
        cancelButtonColor: '#e71d36',
        customClass: {
          container: 'notification-popup'
        }
      })
    }
  }
  }
  onDischargePopup(data): void {
    if (data.patientAdmission.admissionStatus.status === "Planned") {
      Swal.fire({
        title: "Patient has a Planned Admission,So Patient can not be Discharge!",
        icon: 'warning',
        showCancelButton: false,
        showConfirmButton: true,
        confirmButtonText: "Ok",
        confirmButtonColor: '#3f7473',
        customClass: {
          container: 'notification-popup'
        }
      }).then((result) => {
        if (result.value) {
          // this.modalRef.hide();
          this.router.navigate([`${FixedRoutes.Admittedpatient}`]);
        }
      });
    } else {
      this.dischargepopup.showpopup(data);
    }
  }

  onSave() {
    if (this.admitpatient.valid) {
      let getData = JSON.parse(sessionStorage.getItem('User'));
      const data = this.admitpatient.value;
      const patientid = this.getPatientid.find(p => p.id).id
      let payload = {
        id: 0,
        createdBy: getData.id,
        createdDate: new Date().toLocaleString(),
        updatedBy: getData.updatedBy,
        updatedDate: null,
        caseType: data.caseType === "InPatient" ? 1 : data.caseType,
        caseTypesTbl: null,
        admFacility: "string",
        emergencyCase: data.caseType == "3" ? true : false,
        admissionType: data.admissionType,
        admissionTypesTbl: null,
        admReason: data.admReason,
        admDate: new Date().toLocaleString(),
        admTime: new Date().toLocaleTimeString(),
        status: true,
        admissionStatusId: data.status,
        admissionStatus: null,
        treatCategory: "string",
        estLeght: data.estLeght,
        refHospital: "string",
        comment: data.comment,
        doctor_code: data.attendingPhysician,
        doctors: null,
        doctor_Name: "string",
        patientId: patientid,
        attendDoctor_code: data.attendingPhysician,
        attendDoctor: null,
        dischargeDoctor_code: "Doc_1",
        dischargeDoctor: null,
        admittedDoctor_code: data.admittedPhysician,
        admittedDoctor: null,
        patient: null,
        patientRoomsAssigned: null,
        floorId: data.floorId,
        roomId: data.roomId,
        badId: data.badId,
        isAllowTVllowPhone: true,
        phoneNumber: "string",
        isAllowTV: true,
        isActive: true,
        hosp_Code: getData.hosp_Code,
        speciality_Code: data.speciality_Code
      }
      this.dataService.post(Modules.saveAdmittedPatient, payload).then((response) => {
        if (response.message === "Data saved successfully") {
          this.onload(this.selectedDate);
          this.modalRef.hide()
          this.clearFields();
          this.router.navigate([`${FixedRoutes.Admittedpatient}`]);
        }
      });
    } else {
      this.admitpatient.markAllAsTouched();
      this.admitpatient.updateValueAndValidity();
    }
  }

  dateValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const selectedDate = new Date(control.value);
      const currentDate = new Date();
      const selectedDateWithoutTime = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      const currentDateWithoutTime = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

      if (selectedDateWithoutTime < currentDateWithoutTime) {
        return { 'pastDate': true };
      }
      return null;
    };
  }
  printPatient(data: any) {
    this.PrintPatient = true
    this.patientPrintDetails = data;
    this.barcodeMRN = this.patientPrintDetails.patientAdmission.patient.medicalRecordNumber;
    this.modalRef = this.modalService.show(this.PrintPatientDetails, { backdrop: true, ignoreBackdropClick: false, class: "history-popup print-patients-popup" });
  }
  printErPatientData() {
    if (this.printType === "patient") {
      this.wristbandService?.pdfPateintLabelService("printPatient");
      this.modalRef.hide()
      this.PrintPatient = false;
    }
    else if (this.printType === "wristband") {
      this.wristbandService?.pdfWristbandService('wristband');
      this.modalRef.hide()
      this.PrintPatient = false;
    } else if (this.printType === "admissionPatient") {
      this.printService?.print(document.getElementById("printoutPatient")?.innerHTML);
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
  caseTypeValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const caseType = control.value;
      if (caseType && caseType === 2) {
        return { 'invalidCaseType': true };
      }
      return null;
    };
  }

  onAgeTransformation(date: Date): string {
    const currentDate = new Date();
    const birthDate = new Date(date);

    let ageDiff = currentDate.getTime() - birthDate.getTime();
    let ageDate = new Date(ageDiff);
    let years = ageDate.getUTCFullYear() - 1970;

    if (years > 1) {
      return `${years} year(s)`;
    }
    let months = ageDate.getUTCMonth();
    if (years < 1) {
      if (months < 1) {
        let days = ageDate.getUTCDate() - 1;
        return `${days} Day(s)`;
      }
      return `${months} month(s)`;
    }
    return `${years} year(s)`;
  }

  ngOnDestroy(): void {
    if (this.selectedClinicDateSubscription) { this.selectedClinicDateSubscription.unsubscribe(); }
    if (this.nextEventSUbscription) { this.nextEventSUbscription.unsubscribe(); }
    if (this.prevEventSUbscription) { this.prevEventSUbscription.unsubscribe(); }
    if (this.admitPatientEventSUbscription) { this.admitPatientEventSUbscription.unsubscribe(); }
    if (this.searchSubscription) { this.searchSubscription.unsubscribe(); }
    if (this.downloadPaymentSubscription) { this.downloadPaymentSubscription.unsubscribe(); }
    if (this.filterSubscription) { this.filterSubscription.unsubscribe(); }
  }
}