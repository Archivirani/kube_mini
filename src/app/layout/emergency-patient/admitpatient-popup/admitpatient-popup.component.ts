import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { DataService } from '@services/data.service';
import { Patient } from '@services/model/patient.model';
import { Modules } from '@urls';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';

@Component({
  selector: 'admitpatient-popup',
  templateUrl: './admitpatient-popup.component.html',
  styleUrls: ['./admitpatient-popup.component.scss']
})
export class AdmitpatientPopupComponent implements OnInit {
  public emergencyPatientForm: FormGroup;
  private modalRef: BsModalRef;
  public caseTypelist: any[] = [];
  public getSpecialitylist: any[] = [];
  public getPhysicianlist: any[] = [];
  public admissionStatus: any[] = [];
  public getFloorslist: any[] = [];
  public getRoomslist: any[] = [];
  public getBadlist: any[] = [];
  public getPatientid: any[] = [];
  public admissionTypeslist: any[] = [];
  public patientData: any;
  @Output() sendOnload: EventEmitter<any> = new EventEmitter();
  constructor(private modalService: BsModalService, private dataService: DataService,) { }

  @ViewChild('admitpopup', { static: true }) admitpopup: TemplateRef<any>;
  ngOnInit(): void {
    this.getSpeciality();
    this.getSelectgetFloors();
  }

  showpopup(data) {
    this.patientData = data;
    this.getAttendingPhysician(data?.speciality_Code);
   //    this.getSelectgetRooms(data?.floors?.id);
    this.emergencyPatientForm = this.ERPatientList(data);
    this.getSelectAdmissionTypesTbl();
    this.getSelectCaseTypesTbl();
    this.modalRef = this.modalService.show(this.admitpopup, { backdrop: true, ignoreBackdropClick: false, class: 'discharge-popup history-popup' });
    this.getAdmissionStatus();

  }
  ERPatientList(data: any) {

    let getData = JSON.parse(sessionStorage.getItem('User'));
    return new FormGroup({
      mrn: new FormControl(data?.patientAdmission?.patient?.medicalRecordNumber),
      patientName: new FormControl(data?.patientAdmission?.patient?.firstName + " " + data?.patientAdmission?.patient?.familyName),
      caseType: new FormControl('', [Validators.required, this.caseTypeValidator()]),
      admissionType: new FormControl('', Validators.required),
      admReason: new FormControl(),
      comment: new FormControl(),
      admDate: new FormControl(new Date()),
      admTime: new FormControl(new Date()),
      admissionStatusId: new FormControl('', Validators.required),
      estLeght: new FormControl(data?.patientAdmission?.estLeght),
      specialities: new FormControl(data?.patientAdmission?.specialities?.speciality_desc),
      floorId: new FormControl('', Validators.required),
      roomId: new FormControl('', Validators.required),
      badId: new FormControl('', Validators.required),
      attendDoctor_code: new FormControl('', Validators.required),
      admittedPhysician: new FormControl(),
      doctor_code: new FormControl(),
      // attendDoctor_code: new FormControl(data?.patientAdmission.attendDoctor.doctor_Code),
      admittedDoctor_code: new FormControl(),
      speciality_Code: new FormControl('', Validators.required),
      createdBy: new FormControl(getData.id),
      createdDate: new FormControl(new Date().toLocaleString()),
      updatedBy: new FormControl(getData.updatedBy),
      updatedDate: new FormControl(null),
      caseTypesTbl: new FormControl(null),
      admFacility: new FormControl("string"),
      admissionTypesTbl: new FormControl(null),
      status: new FormControl(true),
      admissionStatus: new FormControl(null),
      treatCategory: new FormControl("string"),
      refHospital: new FormControl("string"),
      doctors: new FormControl(null),
      doctor_Name: new FormControl("string"),
      patientId: new FormControl(this.patientData.patientAdmission.patientId),
      attendDoctor: new FormControl(null),
      dischargeDoctor_code: new FormControl("Doc_1"),
      dischargeDoctor: new FormControl(null),
      admittedDoctor: new FormControl(null),
      patient: new FormControl(null),
      patientRoomsAssigned: new FormControl(null),
      isAllowTVllowPhone: new FormControl(true),
      phoneNumber: new FormControl("string"),
      isAllowTV: new FormControl(true),
      isActive: new FormControl(true),
      hosp_Code: new FormControl(getData.hosp_Code),
    });
  }
  getSelectCaseTypesTbl() {
    this.dataService.getData<[]>(Modules.getSelectCaseTypesTbl).then((res: any) => {
      if (res && res.length) {
        this.caseTypelist = res;
          this.emergencyPatientForm.controls['caseType'].setValue(res[0].id);
      }
    });
  }

  getSpeciality() {
    let getData = JSON.parse(sessionStorage.getItem('User'));
    this.dataService.getData<[]>(`${Modules.getSpeciality}?Hosp_code=${getData.hosp_Code}`).then((res) => {
      if (res && res.length) {
        this.getSpecialitylist = res;

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
    this.emergencyPatientForm?.get('roomId').patchValue(' ');
    this.emergencyPatientForm?.get('badId').patchValue(' ');
    if (event) {
      const floornumber = this.getFloorslist.find(d => d.id === event).id
      this.dataService.getData<[]>(`${Modules.getRooms}?FloorsId=${floornumber}`).then((res: any) => {
        if (res && res.length) {
          this.getRoomslist = res.filter(d => (d.id === this.emergencyPatientForm.value.roomId && d.isBooked) || !d.isBooked);

        }
      });
    }


  }
  getSelectgetBads(event) {
    this.emergencyPatientForm?.get('badId').patchValue(' ');
    const badNumber = this.getRoomslist.find(d => d.id === event)?.id
    this.dataService.getData<[]>(`${Modules.getBads}?RoomId=${badNumber}`).then((res: any) => {
      if (res && res.length) {
        this.getBadlist = res.filter(d => (d.id === this.emergencyPatientForm.value.badId && d.isBooked) || !d.isBooked);
      }
    });
  }


  getSelectAdmissionTypesTbl() {
    this.dataService.getData<[]>(Modules.getSelectAdmissionTypesTbl).then((res:any) => {
      if (res && res.length) {
        this.admissionTypeslist = res;
        this.emergencyPatientForm.controls['admissionType'].setValue(res[1].id);
      }
    });
  }
  getAdmissionStatus() {
    this.dataService.getData<[]>(Modules.getAdmissionStatus).then((res:any) => {
      if (res && res.length) {
        this.admissionStatus = res;
        this.emergencyPatientForm.controls['admissionStatusId'].setValue(res[1].id);
      }
    });
  }
  getAttendingPhysician(event) {
    this.emergencyPatientForm?.get('admittedPhysician')?.patchValue(' ');
         this.emergencyPatientForm?.get('attendDoctor_code')?.patchValue(' ');
    if(event){
      let getData = JSON.parse(sessionStorage.getItem('User'));
      this.getPhysicianlist = [];
      let speciality_Code = this.getSpecialitylist.find(d => d.speciality_Code === event)?.speciality_Code;
      this.dataService.getData<[]>(`${Modules.GetGetDoctor}?Hosp_Code=${getData.hosp_Code}&Speciality_Code=${speciality_Code}`).then((res) => {
        if (res) {
          this.getPhysicianlist = res;
          
        }
      });
    }
  
  }

  onCancel() {
    this.modalRef.hide();
  }

  setErPatientValue(event: any) {
    if (event == 1) {
     // this.emergencyPatientForm.controls['speciality_Code'].setValue("Emergency");
      this.emergencyPatientForm.controls['admissionType'].setValue(2);
      this.emergencyPatientForm.controls['status'].setValue(3);
    //  this.emergencyPatientForm.controls['floorId'].setValue(33);
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
    // this.emergencyPatientForm.controls['admittedPhysician'].setValue('');
    // this.emergencyPatientForm.controls['attendingPhysician'].setValue('');

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
  onSave() {
    if(this.emergencyPatientForm.get('attendDoctor_code').value === ' ' ? false : true && this.emergencyPatientForm.get('admittedPhysician').value === ' ' ? false : true ){
    if (this.emergencyPatientForm.valid) {
      const data = this.emergencyPatientForm.value;
      let { mrn, patientName,admittedPhysician, ...res } = this.emergencyPatientForm.value;
      let payload = {
        ...res,
        admDate: new Date().toLocaleString(),
        id: this.patientData.patientAdmissionId,
        caseType:data.caseType,
        emergencyCase: data.caseType == "ERPatient" ? true : false,
        admissionType: data.admissionType,
        visitstatusid:2,
        admissionStatusId: data.admissionStatusId == "Actual" ? 3 : data.admissionStatusId,
        speciality_Code: data.speciality_Code == "Emergency" ? 88 : data.speciality_Code,
        doctor_code: data.attendDoctor_code,
        admittedDoctor_code: data.admittingPhysician,
      }
      this.dataService.post<[]>(Modules.saveAdmittedPatient, payload).then((response) => {
        if (response.message === "Data saved successfully") {
          this.sendOnload.emit();
          this.modalRef.hide()
          // this.clearFields();
        }
      });
    } else {
      this.emergencyPatientForm.markAllAsTouched();
      this.emergencyPatientForm.updateValueAndValidity();
    }
  }else{
    Swal.fire({
      icon: "error",
      text: "You need to specify an Attending Physician!",
    });
  }
  }
}
