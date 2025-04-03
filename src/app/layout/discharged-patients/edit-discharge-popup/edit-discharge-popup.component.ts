import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '@services/data.service';
import { FixedRoutes, Modules } from '@urls';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-edit-discharge-popup',
  templateUrl: './edit-discharge-popup.component.html',
  styleUrls: ['./edit-discharge-popup.component.scss']
})
export class EditDischargePopupComponent implements OnInit {
  private modalRef: BsModalRef;
  @ViewChild('editPopup', { static: true }) editPopup: TemplateRef<any>;
  @Output() sendOnload: EventEmitter<any> = new EventEmitter();
  public getDischargeTypeData: any[] = [];
  public dischargeStatusList: any[] = [];
  public getBadlist: any[] = [];
  public getRoomslist: any[] = [];
  public getPhysicianlist: any[] = [];
  public getFloorslist: any[] = [];
  public getSpecialitylist: any[] = [];
  public getDischargePysicianList: any[] = [];
  public admissionTypeslist: any[] = [];
  public caseTypelist: any[] = [];
  public patientData: any;
  public daysDifference: any;
  public dischargePatientEdit: FormGroup;


  constructor(private modalService: BsModalService, private dataService: DataService, private router: Router) {
    this.getSelectgetFloors();
    this.getDischargePhysician();
    this.getSelectCaseTypesTbl();
    this.getSpeciality();
  }

  ngOnInit(): void {
    this.getDischargeStatus();
    this.getSelectgetFloors();
    this.getDischargeType();
  }
  showPopup(data) {
    this.patientData = data;
    const timeDifference = new Date(data.dischargeDate).getTime() - new Date(data.patientAdmission.admDate).getTime();
    this.daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24)) + 1;
    this.getSelectgetRooms(data.patientAdmission.patientRoomsAssigned.floors.id);
    this.getAttendingPhysician(data.specialities.speciality_Code);
    this.dischargePatientEdit = this.dischargePatientEditList(data);
    this.modalRef = this.modalService.show(this.editPopup, { backdrop: true, ignoreBackdropClick: false, class: 'history-popup' });
  }




  dischargePatientEditList(data) {
    return new FormGroup({
      mrn: new FormControl(data.patientAdmission.patient.medicalRecordNumber),
      patientName: new FormControl(data.patientAdmission.patient.firstName +" "+data.patientAdmission.patient.secondName+" "+data.patientAdmission.patient.thirdName+" "+ data.patientAdmission.patient.familyName),
      caseType: new FormControl(data.patientAdmission.caseType, [this.caseTypeValidator()]),
      comment: new FormControl(),
      visitId: new FormControl(data.visitId),
      admittedOn: new FormControl(new Date(data.patientAdmission.admDate)),
      admittedAt: new FormControl(new Date(data.patientAdmission.admTime)),
      floorId: new FormControl(data.patientAdmission.patientRoomsAssigned.floors.id),
      roomId: new FormControl(data.patientAdmission.patientRoomsAssigned.roomId),
      badId: new FormControl(data.patientAdmission.patientRoomsAssigned.badId),
      attendDoctor_code: new FormControl(data?.patientAdmission.attendDoctor.doctor_Code),
      dischargeDate: new FormControl(new Date(data?.dischargeDate)),
      dischargeTime: new FormControl(new Date(data?.dischargeTime)),
      dischargeTypesId: new FormControl(data.dischargeTypesId, Validators.required),
      dischargeStatusId: new FormControl(data.dischargeStatusId, Validators.required),
      dischargeDoctor_code: new FormControl(data.dischargeDoctor_code),
      dischargeReason: new FormControl(data.dischargeReason),
      speciality_Code: new FormControl(data.specialities.speciality_Code),
      admittedDoctor_code: new FormControl(),
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
  getDischargeStatus() {
    this.dataService.getData<[]>(Modules.getDischargeStatus).then((resp) => {
      this.dischargeStatusList = resp;
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
  getDischargeType() {
    this.dataService.getData<[]>(`${Modules.getDischargeTypes}`).then((res) => {
      if (res && res.length) {
        this.getDischargeTypeData = res;
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
  getAttendingPhysician(event) {
    let getData = JSON.parse(sessionStorage.getItem('User'));
    let speciality_Code = this.getSpecialitylist.find(d => d.speciality_Code === event)?.speciality_Code
    this.dataService.getData<[]>(`${Modules.GetGetDoctor}?Hosp_Code=${getData.hosp_Code}&Speciality_Code=${speciality_Code}`).then((res) => {
      if (res) {
        this.getPhysicianlist = res;
      }
    });
  }
  getDischargePhysician() {
    let getData = JSON.parse(sessionStorage.getItem('User'));
    this.dataService.getData<[]>(`${Modules.getAttendingPhysician}?Hosp_Code=${getData.hosp_Code}`).then((res) => {
      if (res) {
        this.getDischargePysicianList = res;
      }
    });
  }


  getSelectgetRooms(event) {
    this.dischargePatientEdit?.get('roomId').patchValue(' ');
    this.dischargePatientEdit?.get('badId').patchValue(' ');
    if (event) {
      const floornumber = this.getFloorslist.find(d => d.id === event).id
      this.dataService.getData<[]>(`${Modules.getRooms}?FloorsId=${floornumber}`).then((res: any) => {
        if (res && res.length) {
          this.getRoomslist = res.filter(d => (d.id === this.dischargePatientEdit.value.roomId && d.isBooked) || !d.isBooked);
          this.getSelectgetBads(this.patientData.patientAdmission.patientRoomsAssigned.roomId);
        }
      });
    }
  }
  getSelectgetBads(event) {
    const badNumber = this.getRoomslist.find(d => d.id === event)?.id
    this.dataService.getData<[]>(`${Modules.getBads}?RoomId=${badNumber}`).then((res: any) => {
      if (res && res.length) {
        this.getBadlist = res.filter(d => (d.id === this.dischargePatientEdit.value.badId && d.isBooked) || !d.isBooked);
      }
    });
  }
  getSelectCaseTypesTbl() {
    this.dataService.getData<[]>(Modules.getSelectCaseTypesTbl).then((res: any) => {
      if (res && res.length) {
        this.caseTypelist = res;
        if (this.dischargePatientEdit && this.dischargePatientEdit.controls['caseType']) {
          this.dischargePatientEdit.controls['caseType'].setValue(res[0]?.caseName);
        }
      }
    });
  }


  onCancel() {
    this.modalRef.hide();
  }

  onEditSave() {
    if (this.dischargePatientEdit.valid) {
      let getData = JSON.parse(sessionStorage.getItem('User'));
      const { mrn, patientName, admittedAt, admittedOn, caseType, admittedDoctor_code, ...res } = this.dischargePatientEdit.value;
      const payload = {
        ...res,
        id: this.patientData.id,
        createdBy: getData.id,
        createdDate: new Date().toISOString(),
        updatedBy: getData.updatedBy,
        updatedDate: new Date().toISOString(),
        attendDoctor: null,
        patientId: this.patientData.patientId,
        patient: null,
        dischargeDoctor: null,
        dischargeStatuses: null,
        dischargeTypes: null,
        patientAdmissionId: this.patientData.patientAdmissionId,
        patientAdmission: null,
        hosp_Code: getData.hosp_Code,
        status: true,
      }
      this.dataService.post<[]>(Modules.saveDischargePatient, payload).then((resp) => {
        if (resp.message === "Data saved successfully") {
          this.sendOnload.emit();
          this.modalRef.hide();
          this.router.navigate([`${FixedRoutes.DischargedPatients}`])
        }
      })
    }
    else {
      this.dischargePatientEdit.markAllAsTouched();
      this.dischargePatientEdit.updateValueAndValidity();
    }
  }
}
