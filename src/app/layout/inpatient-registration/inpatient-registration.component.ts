import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '@services/data.service';
import { StatusFlags } from '@services/model/data.service.model';
import { Patient } from '@services/model/patient.model';
import { ResourceService } from '@services/resource.service';
import { FixedRoutes, Modules } from '@urls';

@Component({
  selector: 'app-inpatient-registration',
  templateUrl: './inpatient-registration.component.html',
  styleUrls: ['./inpatient-registration.component.scss']
})
export class InpatientRegistrationComponent implements OnInit {

  constructor(private dataservice: DataService, private resourceservice: ResourceService, private router: Router) { }
  public caseTypelist: any[] = [];
  public admissionTypeslist: any[] = [];
  public getFloorslist: any[] = [];
  public getRoomslist: any[] = [];
  public getBadlist: any[] = [];
  public getStatus: any[] = [];
  public admissionStatus: any[] = [];
  public getSpecialitylist: any[] = [];
  public getPhysicianlist: any[] = [];
  public patientData: any[] = [];
  public Mrn: string;
  public getAdmittedPatientData: any;
  registerPatient: FormGroup;
  public selectedSpeciality: any;

  ngOnInit(): void {
    this.getSelectCaseTypesTbl();
    this.getSelectAdmissionTypesTbl();
    this.getSelectgetFloors();
    this.getAdmissionStatus();
    this.getSpeciality();


    this.registerPatient = new FormGroup({
      mrn: new FormControl(),
      id: new FormControl(),
      admittingPhysician: new FormControl(),
      createdBy: new FormControl(),
      createdDate: new FormControl(),
      updatedBy: new FormControl(),
      updatedDate: new FormControl(),
      caseType: new FormControl('', [Validators.required, this.caseTypeValidator()]),
      caseTypesTbl: new FormControl(),
      admFacility: new FormControl(''),
      emergencyCase: new FormControl(),
      admissionType: new FormControl('', Validators.required),
      admissionTypesTbl: new FormControl(),
      admReason: new FormControl(''),
      admDate: new FormControl(new Date(), [Validators.required, this.dateValidator()]),
      admTime: new FormControl(new Date(), Validators.required),
      status: new FormControl(true),
      admissionStatusId: new FormControl(),
      admissionStatus: new FormControl('', Validators.required),
      treatCategory: new FormControl(''),
      estLeght: new FormControl(),
      refHospital: new FormControl(''),
      comment: new FormControl(),
      doctor_code: new FormControl(),
      doctors: new FormControl(),
      doctor_Name: new FormControl(''),
      patientId: new FormControl(),
      attendDoctor_code: new FormControl('', [Validators.required]),
      attendDoctor: new FormControl(),
      dischargeDoctor_code: new FormControl(),
      dischargeDoctor: new FormControl(),
      patient: new FormControl(),
      patientRoomsAssigned: new FormControl(),
      floorId: new FormControl('' , [Validators.required]),
      roomId: new FormControl('', [Validators.required]),
      badId: new FormControl('', [Validators.required]),
      isAllowTVllowPhone: new FormControl(),
      phoneNumber: new FormControl(),
      isAllowTV: new FormControl(),
      isActive: new FormControl(),
      hosp_Code: new FormControl(),
      speciality_Code: new FormControl('', Validators.required)
    });
    this.getAdmittedPatientData = this.resourceservice.getSelectedPatient;
    this.registerPatient.get('mrn').setValue(this.getAdmittedPatientData?.medicalRecordNumber);
    this.registerPatient.get('patientId').setValue(this.getAdmittedPatientData?.firstName + this.getAdmittedPatientData?.familyName);


  }
  getSelectCaseTypesTbl() {
    this.dataservice.getData<[]>(Modules.getSelectCaseTypesTbl).then((res: any) => {
      if (res && res.length) {
        this.caseTypelist = res;
        if (this.registerPatient && this.registerPatient.controls['caseType']) {
          this.registerPatient.controls['caseType'].setValue(res[0]?.caseName);
        }
      }
    });
  }

  setErPatientValue(event: any) {
    if (event == 3) {
      this.registerPatient.controls['speciality_Code'].setValue("spe_13");
      this.registerPatient.controls['admissionType'].setValue(4);
      this.registerPatient.controls['admissionStatus'].setValue(3);
      this.registerPatient.controls['floorId'].setValue(33);
      if (this.registerPatient.controls['floorId'].value == 33) {
        this.getSelectgetRooms(this.registerPatient.controls['floorId'].value);
      }

    } else {
      this.registerPatient.patchValue({
        speciality_Code: '',
        floorId: '',
        admissionStatus: '',
        admissionType: ''
      });
    }
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
  getSelectAdmissionTypesTbl() {
    this.dataservice.getData<[]>(Modules.getSelectAdmissionTypesTbl).then((res) => {
      if (res && res.length) {
        this.admissionTypeslist = res;
      }
    });
  }
  getAdmissionStatus() {
    this.dataservice.getData<[]>(Modules.getAdmissionStatus).then((res) => {
      if (res && res.length) {
        this.admissionStatus = res;
      }
    });
  }

  getSelectgetFloors() {
    let getData = JSON.parse(sessionStorage.getItem('User'));
    this.dataservice.getData<[]>(`${Modules.getFloors}?Hosp_code=${getData.hosp_Code}`).then((res) => {
      if (res && res.length) {
        this.getFloorslist = res;
      }
    });
  }
  getSelectgetRooms(event) {
    const floornumber = this.getFloorslist.find(d => d.id === event).id
    this.dataservice.getData<[]>(`${Modules.getRooms}?FloorsId=${floornumber}`).then((res: any) => {
      if (res && res.length) {
        this.getRoomslist = res.filter(d => !d.isBooked);
        this.registerPatient?.get('roomId').patchValue(' ');
        this.registerPatient?.get('badId').patchValue(' ');

      }
    });
  }
  getSpeciality() {
    let getData = JSON.parse(sessionStorage.getItem('User'));
    this.dataservice.getData<[]>(`${Modules.getSpeciality}?Hosp_code=${getData.hosp_Code}`).then((res: any) => {
      if (res && res.length) {
        this.getSpecialitylist = res;
        this.getAttendingPhysician(res[4]?.speciality_Code);
      }
    });
  }
  getAttendingPhysician(event) {
    let getData = JSON.parse(sessionStorage.getItem('User'));
    this.getPhysicianlist = [];
    let speciality_Code = this.getSpecialitylist.find(d => d.speciality_Code === event).speciality_Code
    this.dataservice.getData<[]>(`${Modules.GetGetDoctor}?Hosp_Code=${getData.hosp_Code}&Speciality_Code=${speciality_Code}`).then((res) => {
      if (res) {
        this.getPhysicianlist = res;
        this.registerPatient.get('attendDoctor_code').patchValue('');
      }
    });
  }

  getSelectgetBads(event) {
    this.registerPatient?.get('badId').patchValue(' ');
    const badNumber = this.getRoomslist.find(d => d.id === event).id
    this.dataservice.getData<[]>(`${Modules.getBads}?RoomId=${badNumber}`).then((res: any) => {
      if (res && res.length) {
        this.getBadlist = res.filter(d => !d.isBooked);
      }
    });
  }


  getPatient(data: string) {
    if (data.length >= 6) {
      this.dataservice.getData<Patient[]>(Modules.PatientSearch, data).then((resp) => {
        if (resp && resp.length) {
          this.patientData = resp;
          let data = resp[0];
          let getPatientName = data.firstName + '' + data.secondName + '' + data.thirdName + '' + data.familyName;
          this.registerPatient.get('patientId').patchValue(getPatientName);
        }
      });
    } else {
      this.registerPatient.updateValueAndValidity();
    }
  }


  onSave() {
    if (this.registerPatient.valid) {

      let getData = JSON.parse(sessionStorage.getItem('User'));
      let data = this.registerPatient.value;
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
        admissionType: data.admissionType == "Emergency Admission" ? 2 : data.admissionType,
        admissionTypesTbl: null,
        admReason: data.admReason,
        admDate: data.admDate,
        admTime: data.admTime.toLocaleString(),
        status: true,
        admissionStatusId: data.admissionStatus,
        admissionStatus: null,
        treatCategory: "string",
        estLeght: data.estLeght,
        refHospital: "string",
        comment: data.comment,
        doctor_code: data.attendDoctor_code,
        doctors: null,
        doctor_Name: "string",
        patientId: this.getAdmittedPatientData?.id,
        attendDoctor_code: data.attendDoctor_code,
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
        speciality_Code: data.speciality_Code
      }
      this.dataservice.post<[]>(Modules.saveAdmittedPatient, payload).then((response) => {
        if (response.message === "Data saved successfully") {
          this.router.navigate([`${FixedRoutes.Admittedpatient}`])
        }
      });
    } else {
      this.registerPatient.markAllAsTouched();
      this.registerPatient.updateValueAndValidity();
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

  onCancel() {
    this.registerPatient.reset();
    this.router.navigate([`${FixedRoutes.Patient}`]);
  }
}
