import { formatDate } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ClinicService } from '@services/clinic.service';
import { DataService } from '@services/data.service';
import { Order } from '@services/model/clinic.model';
import { Patient } from '@services/model/patient.model';
import { ResourceService } from '@services/resource.service';
import { FixedRoutes, Modules } from '@urls';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { AdmitpatientPopupComponent } from './admitpatient-popup/admitpatient-popup.component';
import { Appointment } from '@services/model/appointment.model';
import { GlobalSearchFilter } from '@shared/pipes/global-search.pipe';
import { PrintService } from '@services/print.service';
import { PrintWristbandService } from '@services/print-wristband.service';

@Component({
  selector: 'emergency-patient',
  templateUrl: './emergency-patient.component.html',
  styleUrls: ['./emergency-patient.component.scss'],
  providers: [GlobalSearchFilter]
})
export class EmergencyPatientComponent implements OnInit {
  public emergencyPatientForm: FormGroup;
  public visibleDataBackup: any[];
  private modalRef: BsModalRef;
  public selectedDate: Date = new Date();
  private prevEventSUbscription: Subscription;
  private nextEventSUbscription: Subscription;
  public selectedClinicDateSubscription: Subscription;
  private admitPatientEventSUbscription: Subscription;
  public searchSubscription:Subscription;
  public filterSubscription:Subscription;
  public visibleBilledData: Order[];
  public visibleNotBilledData: Order[];
  public visibleData: any[];
  public isIPadAir = false;
  public retrivePatientData: any[];
  public caseTypelist: any[] = [];
  public getSpecialitylist: any;
  public getPhysicianlist: any[] = [];
  public admissionStatus: any[] = [];
  public getFloorslist: any[] = [];
  public getRoomslist: any[] = [];
  public getBadlist: any[] = [];
  public getPatientid: any[] = [];
  public admissionTypeslist: any[] = [];
  public visitStatus: any[] = [];
  public patientData: any;
  public patientPrintDetails:any;
  public visitStatusId: number;
  public imageUrl: string = '';
  public checkInPatient: any[] = [];
  public checkOutPatient: any[] = [];
  public checkOutPatientBackup:any[];
  public checkInPatientBackup:any[];
  public UserTypeId: any;
  public barcodeMRN:string;
  public endDate: any;
  public startDate: any;
  public isPrintClicked:boolean = false;
  @ViewChild('rotatedLayout', { static: false }) rotatedLayout: TemplateRef<any>;
  @ViewChild('admitpatientPopup') admitpatientPopup: AdmitpatientPopupComponent;
  @ViewChild('admitPatientEventlist', { static: true }) admitPatientEventlist: TemplateRef<any>;
  @ViewChild('filterPopup', { static: true }) filterPopup: TemplateRef<any>;
  @ViewChild('printPatientDetails', { static: true }) PrintPatientDetails: TemplateRef<any>;
  constructor(private dataService: DataService, public clinicService: ClinicService, private viewContainerRef: ViewContainerRef,
    private cdr: ChangeDetectorRef, private resourceService: ResourceService, private router: Router, private modalService: BsModalService,private globalSearch:GlobalSearchFilter,private printService: PrintService,private wristbandService:PrintWristbandService) {
    this.onload(this.selectedDate); window.innerWidth < 1260 ? this.isIPadAir = true : this.isIPadAir = false;

    this.resourceService.ErPatientDate = this.selectedDate;
    this.resourceService.dayOnlyAppointmentLabel = this.getSelectedDate();

    if (this.nextEventSUbscription) { this.nextEventSUbscription.unsubscribe(); }
    this.nextEventSUbscription = this.resourceService.nextEvent.subscribe((data: any) => {
      if (data) {
        this.onload(new Date(this.selectedDate.setDate(this.selectedDate.getDate() + 1)));
        this.resourceService.dayOnlyAppointmentLabel = this.getSelectedDate();
        this.resourceService.ErPatientDate = this.selectedDate;
      }
    });

    if (this.prevEventSUbscription) { this.prevEventSUbscription.unsubscribe(); }
    this.prevEventSUbscription = this.resourceService.prevEvent.subscribe((data: any) => {
      if (data) {
        this.onload(new Date(this.selectedDate.setDate(this.selectedDate.getDate() - 1)));
        this.resourceService.dayOnlyAppointmentLabel = this.getSelectedDate();
        this.resourceService.ErPatientDate = this.selectedDate;
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
        this.resourceService.ErPatientDate = data;
      }
    });
    if (this.searchSubscription) { this.searchSubscription.unsubscribe(); }
    this.searchSubscription=this.resourceService.searchQuerySubject.subscribe((res) => {
      const fieldNames = ["patientAdmission.patient.medicalRecordNumber","patientAdmission.admTime","patientAdmission.admDate","patientAdmission.patient.dateOfBirth","patientAdmission.patient.gender","patientAdmission.patient.familyName","patientAdmission.patient.thirdName","patientAdmission.patient.secondName","patientAdmission.patient.firstName","patientAdmission.visitStatus.status","patientAdmission.attendDoctor.doctor_Name","patientAdmission?.doctors?.specialities?.speciality_desc","floors.floornumber","bads.badNumber","rooms.roomNumber"];
      this.checkInPatient = this.globalSearch.transform(this.checkInPatientBackup, res, fieldNames);
      this.checkOutPatient = this.globalSearch.transform(this.checkOutPatientBackup, res, fieldNames);
    });

    if (this.admitPatientEventSUbscription) { this.admitPatientEventSUbscription.unsubscribe(); }
    this.admitPatientEventSUbscription = this.clinicService.admitPatientEvent.subscribe((res) => {
      this.modalRef = this.modalService.show(this.admitPatientEventlist, { backdrop: true, ignoreBackdropClick: false });
    });
    if(this.filterSubscription) { this.filterSubscription.unsubscribe(); }
    this.filterSubscription =this.resourceService.submitEvent.subscribe((data) => {
      if (data) {
        this.startDate = '';
        this.endDate = '';
        this.modalRef = this.modalService.show(this.filterPopup, { backdrop: true, ignoreBackdropClick: false , class:'filterPopup'});
      }
    });

    this.getSelectCaseTypesTbl();
    this.getSelectAdmissionTypesTbl();
    this.getSelectgetFloors();
    this.getAdmissionStatus();
    this.getSpeciality();
    this.getVisitStatus()

    this.emergencyPatientForm = new FormGroup({
      patientId: new FormControl(),
      patientName: new FormControl(),
      caseType: new FormControl('', [Validators.required, this.caseTypeValidator()]),
      admissionType: new FormControl('', Validators.required),
      admReason: new FormControl(),
      comment: new FormControl(),
      admTime: new FormControl(new Date()),
      admDate: new FormControl(new Date()),
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
  onload(date: Date): void {
    let setData = JSON.parse(sessionStorage.getItem('User'));
    let Hosp_Code = setData.hosp_Code;
    this.dataService.getData<any[]>(`${Modules.getErPatient}?Hopt_code=${Hosp_Code}&date=${formatDate(date, "MM-dd-YYYY", "en-Us")}`).then((data: any) => {
      this.retrivePatientData = data;
      this.checkInPatient = data['emergencyPatientCheckin'];
      this.checkInPatientBackup= data['emergencyPatientCheckin'];
      this.checkOutPatient = data['emergencyPatientCheckout'];
      this.checkOutPatientBackup= data['emergencyPatientCheckout'];
      this.resourceService.totalRecords.next(this.checkInPatient.length);
    });
  }
  ngOnInit(): void {
    this.UserTypeId = JSON.parse(sessionStorage.getItem('UserTypeId'));
  }
  getSelectedDate() {
    return `${this.convertToFormattedDate(this.selectedDate, "dd MMM, yyyy | EEEE")}` === `${this.convertToFormattedDate(new Date(), "dd MMM, yyyy | EEEE")}` ? 'Today' : `${this.convertToFormattedDate(this.selectedDate, "dd MMM, yyyy | EEEE")}`;
  }
  
  filterData(){
    let setData = JSON.parse(sessionStorage.getItem('User'));
    let Hosp_Code = setData.hosp_Code;
    let startDateParam = this.startDate ? formatDate(this.startDate, "MM-dd-YYYY", "en-Us") : '';
    let endDateParam = this.endDate ? formatDate(this.endDate, "MM-dd-YYYY", "en-Us") : '';
    this.dataService.getData<any[]>(`${Modules.getALLEmergencypatientByDate}?Hopt_code=${Hosp_Code}&Startdate=${startDateParam}&Endtdate=${endDateParam}`).then((data: any) => {
      this.resourceService.dayOnlyAppointmentLabel=`${formatDate(this.startDate, "dd-MM-YYYY", "en-Us")} To ${formatDate(this.endDate, "dd-MM-YYYY", "en-Us")}`
      this.retrivePatientData = data;
      this.checkInPatient = data['emergencyPatientCheckin'];
      this.checkInPatientBackup= data['emergencyPatientCheckin'];
      this.checkOutPatient = data['emergencyPatientCheckout'];
      this.checkOutPatientBackup= data['emergencyPatientCheckout'];
      this.resourceService.totalRecords.next(this.checkInPatient.length);
      this.modalRef.hide();
    });
  }

  onCacel(){
    this.startDate = ' ';
    this.endDate = ' ';
    this.modalRef.hide();
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

  setErPatientValue(event: any) {
    if (event == 3) {
      // this.emergencyPatientForm.controls['speciality_Code'].setValue("spe_191");
      this.emergencyPatientForm.controls['admissionType'].setValue(4);
      this.emergencyPatientForm.controls['status'].setValue(3);
      this.emergencyPatientForm.controls['floorId'].setValue(33);
      if (this.emergencyPatientForm.controls['floorId'].value == 33) {
        this.getSelectgetRooms(this.emergencyPatientForm.controls['floorId'].value);
      }
      this.getSpeciality();
    } else {
      this.emergencyPatientForm.patchValue({
        speciality_Code: '',
        floorId: '',
        admissionStatus: '',
        admissionType: ''
      });
    }
  }


  getSelectCaseTypesTbl() {

    this.dataService.getData<[]>(Modules.getSelectCaseTypesTbl).then((res: any) => {
      if (res && res.length) {
        this.caseTypelist = res;
        if (this.emergencyPatientForm && this.emergencyPatientForm.controls['caseType']) {
          this.emergencyPatientForm.controls['caseType'].setValue(res[2]?.id);
        }

      }
    });
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

  getSpeciality() {
    let getData = JSON.parse(sessionStorage.getItem('User'));
    this.dataService.getData<[]>(`${Modules.getSpeciality}?Hosp_code=${getData.hosp_Code}`).then((res: any) => {
      if (res && res.length) {
        this.getSpecialitylist = res;
        const emergencySpeciality = this.getSpecialitylist.find((item: any) => item.speciality_desc.trim() === 'Emergency');
        if (emergencySpeciality) {
          if (this.emergencyPatientForm && this.emergencyPatientForm.controls['speciality_Code']) {
            this.emergencyPatientForm.controls['speciality_Code'].setValue(emergencySpeciality.speciality_Code);
            this.getAttendingPhysician(emergencySpeciality.speciality_Code);
          }
        }
      }
    });
  }
  getSelectgetFloors() {
    let getData = JSON.parse(sessionStorage.getItem('User'));
    this.dataService.getData<[]>(`${Modules.getFloors}?Hosp_code=${getData.hosp_Code}`).then((res) => {
      if (res && res.length) {
        this.getFloorslist = res;
        this.emergencyPatientForm.controls['floorId'].setValue(33);
        this.getSelectgetRooms(this.emergencyPatientForm.controls['floorId'].value);
      }
    });
  }
  getSelectgetRooms(event) {
    const floornumber = this.getFloorslist.find(d => d.id === event).id
    this.dataService.getData<[]>(`${Modules.getRooms}?FloorsId=${floornumber}`).then((res: any) => {
      // this.getRoomslist = []
      if (res && res.length) {
        this.getRoomslist = res.filter(d => !d.isBooked);
      }
      this.emergencyPatientForm?.get('roomId').patchValue('');
      this.emergencyPatientForm?.get('badId').patchValue('');
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
    this.dataService.getData<[]>(Modules.getSelectAdmissionTypesTbl).then((res: any) => {
      if (res && res.length) {
        this.admissionTypeslist = res;
        if (this.emergencyPatientForm && this.emergencyPatientForm.controls['admissionType']) {
           this.emergencyPatientForm.controls['admissionType'].setValue(res[3]?.id);
        }
      }
    });
  }
  getAdmissionStatus() {
    this.dataService.getData<[]>(Modules.getAdmissionStatus).then((res: any) => {
      if (res && res.length) {
        this.admissionStatus = res;
        if (this.emergencyPatientForm && this.emergencyPatientForm.controls['status']) {
          this.emergencyPatientForm.controls['status'].setValue(res[1]?.id);
        }
      }
    });
  }
  getAttendingPhysician(event) {
    let getData = JSON.parse(sessionStorage.getItem('User'));
    this.getPhysicianlist = [];
    let speciality_Code = this.getSpecialitylist.find(d => d.speciality_Code === event).speciality_Code;
    this.dataService.getData<[]>(`${Modules.GetGetDoctor}?Hosp_Code=${getData.hosp_Code}&Speciality_Code=${speciality_Code}`).then((res: any) => {
      if (res) {
        this.getPhysicianlist = res;
        this.emergencyPatientForm.get('admittedPhysician').patchValue('');
        this.emergencyPatientForm.get('attendingPhysician').patchValue('');
      }
    });
  }

  getPatient(data: any) {
    if (data.length >= 6) {
      this.dataService.getData<Patient[]>(Modules.PatientSearch, data).then((resp) => {
        if (resp && resp.length) {
          this.getPatientid = resp;
          let data = resp[0];
          let getPatientName = data.firstName + ' ' + data.secondName + ' ' + data.thirdName + ' ' + data.familyName;
          this.emergencyPatientForm.get('patientName').patchValue(getPatientName);
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
              this.router.navigate([`${FixedRoutes.ErPatient}`]);
            }
          });
          this.emergencyPatientForm.get('patientName').patchValue('');
          this.emergencyPatientForm.get('patientId').patchValue('');
          this.emergencyPatientForm.get('admReason').patchValue('');
          this.emergencyPatientForm.get('comment').patchValue('');
          this.emergencyPatientForm.get('estLeght').patchValue('');
        }
      });
    } else {
      this.emergencyPatientForm.updateValueAndValidity();
    }
  }

  clearFields() {
    this.emergencyPatientForm.get('roomId').patchValue(' ');
    this.emergencyPatientForm.get('badId').patchValue(' ');
    this.emergencyPatientForm.get('patientId').patchValue(' ');
    this.emergencyPatientForm.get('patientName').patchValue('');
    this.emergencyPatientForm.get('comment').patchValue(' ');
    this.emergencyPatientForm.get('admReason').patchValue(' ');
    this.emergencyPatientForm.get('admittedPhysician').patchValue(' ');
    this.emergencyPatientForm.get('attendingPhysician').patchValue(' ');
    this.emergencyPatientForm.get('estLeght').patchValue(' ');
    this.emergencyPatientForm.get('admDate').patchValue(new Date().toLocaleString());
    this.emergencyPatientForm.get('admTime').patchValue(new Date());
  }
  onCancel() {
    this.modalRef.hide();
    this.clearFields();
  }
  onAdmitPopup(data) {

    this.admitpatientPopup.showpopup(data);
  }
  convertToFormattedDate(date: Date, format: string) {
    return formatDate(date, format, "en-US");
  }

  onSave() {
    let Spe_code=this.getSpecialitylist.find((d)=>d.speciality_desc.trim() === "Emergency")?.speciality_Code;
    if (this.emergencyPatientForm.valid) {
      let getData = JSON.parse(sessionStorage.getItem('User'));
      const data = this.emergencyPatientForm.value;
      const patientid = this.getPatientid.find(p => p.id).id
      let payload = {
        id: 0,
        createdBy: getData.id,
        createdDate: new Date().toLocaleString(),
        updatedBy: getData.updatedBy,
        updatedDate: null,
        caseType: data.caseType === "ERPatient" ? 3 : data.caseType,
        caseTypesTbl: null,
        admFacility: "string",
        emergencyCase: data.caseType == "3" ? true : false,
        admissionType: data.admissionType == "Emergency Admission" ? 2 : data.admissionType,
        admissionTypesTbl: null,
        admReason: data.admReason,
        admDate: new Date().toLocaleString(),
        admTime: new Date().toLocaleTimeString(),
        status: true,
        admissionStatusId: data.status == "Actual" ? 3 : data.status,
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
        admittedDoctor_code: data.admittingPhysician,
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
        speciality_Code: data.speciality_Code == "Emergency" ? Spe_code : data.speciality_Code
      }
      this.dataService.post<[]>(Modules.saveAdmittedPatient, payload).then((response) => {
        if (response.message === "Data saved successfully") {
          this.onload(this.selectedDate);
          this.modalRef.hide()
          this.clearFields();
        }
      });
    } else {
      this.emergencyPatientForm.markAllAsTouched();
      this.emergencyPatientForm.updateValueAndValidity();
    }
  }

  getVisitStatus() {
    this.dataService.getData<[]>(Modules.getVisitStatus).then((res: any) => {
      if (res && res.length) {
        this.visitStatus = res;

      }
    });
  }

  getPatientData(data: any) {
    this.patientData = data
  }
  updateStatus() {
    let updatedBy = JSON.parse(sessionStorage.getItem('User')).id;
    this.dataService.get<[]>(`${Modules.updateStatus}?PatientAdmissionId=${this?.patientData?.patientAdmissionId}&UpdateBy=${updatedBy}&VisitStatusId=${this.visitStatusId}`).then((res) => {
      this.onload(this.selectedDate)

    })
  }

  onDeleteRecord(data) {
    if (data?.order?.isPaid) {
      Swal.fire({
        title: "Patient has an issued invoice, “Cancelling Admission is not possible",
        icon: 'info',
        showCancelButton: false,
        showConfirmButton: true,
        confirmButtonText: "Okay",

        confirmButtonColor: '#3f7473',

        customClass: {
          container: 'notification-popup'
        }
      })
    }
    else {
      Swal.fire({
        title: "Are you sure you want to cancel?. ",
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
          this.dataService.postData<[]>(`${Modules.cancelErPatient}?PatientAdmissionId=${data.patientAdmissionId}&CancelledBy=${setData.id}`).then((res) => {
            this.onload(this.selectedDate);
          })
        } else {
          this.router.navigate([`${FixedRoutes.ErPatient}`])
        }
      })
    }

  }
  patientDetails(data: Appointment) {
    let UserTypeId=JSON.parse(sessionStorage.getItem('User'))
        if(UserTypeId.userTypeId !== 13){
    this.router.navigate([`${FixedRoutes.ErPatient}/${FixedRoutes.Erpatientdetails}`], { state: data });
  }
  }
  
  printPatient(data:any){
    this.patientPrintDetails=data;
    this.barcodeMRN=this.patientPrintDetails.patientAdmission.patient.medicalRecordNumber;
    this.modalRef = this.modalService.show(this.PrintPatientDetails, { backdrop: true, ignoreBackdropClick: false ,class:'history-popup' });
  }
  printErPatientData(){
    this.wristbandService.pdfPateintStickerService('printPatients');
    if (this.modalRef) {
      this.isPrintClicked = true;
      this.modalRef.hide();
    }
  }

  closePopup(){
    this.modalRef.hide()
  }
  ngOnDestroy(): void {
    if (this.admitPatientEventSUbscription) { this.admitPatientEventSUbscription.unsubscribe(); }
    if (this.nextEventSUbscription) { this.nextEventSUbscription.unsubscribe(); }
    if (this.prevEventSUbscription) { this.prevEventSUbscription.unsubscribe(); }
    if (this.selectedClinicDateSubscription) { this.selectedClinicDateSubscription.unsubscribe(); }
    if (this.searchSubscription) { this.searchSubscription.unsubscribe(); }
    if(this.filterSubscription) { this.filterSubscription.unsubscribe(); }
  }
}
