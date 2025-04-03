import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '@services/data.service';
import { Patient } from '@services/model/patient.model';
import { FixedRoutes, Modules } from '@urls';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-admittedpatient-editpopup',
  templateUrl: './admittedpatient-editpopup.component.html',
  styleUrls: ['./admittedpatient-editpopup.component.scss']
})
export class AdmittedpatientEditpopupComponent implements OnInit {
  private modalRef: BsModalRef;
  public caseTypelist: any[] = [];
  constructor(private modalService: BsModalService, private dataservice: DataService, private router: Router) { }
  public editlist: any;
  public admissionTypeslist: any[] = [];
  public getSpecialitylist: any[] = [];
  public getPhysicianlist: any[] = [];
  public admissionStatus: any[] = [];
  public getFloorslist: any[] = [];
  public getRoomslist: any[] = [];
  public getBadlist: any[] = [];
  public isStatusPlanned: boolean = false;
  public isActualDisable: boolean = false;
  public editForm: FormGroup
  @ViewChild('editPopup', { static: true }) editPopup: TemplateRef<any>;
  @Output() sendOnload: EventEmitter<any> = new EventEmitter();
  ngOnInit(): void {
    this.getAdmissionStatus();
    this.getSelectgetFloors();
    this.getSpeciality();
  }

  showPopup(data) {
    this.editlist = data;
    this.getSelectgetRooms(data?.floors?.id);
    this.getAttendingPhysician(data?.specialities?.speciality_Code);
    data.patientAdmission?.admissionStatusId === 3 ? this.isActualDisable = true : this.isActualDisable = false;
    this.editForm = this.editlistData(data);
    this.modalRef = this.modalService.show(this.editPopup, { backdrop: true, ignoreBackdropClick: false, class: 'history-popup' });
  }

  editlistData(data) {
    return new FormGroup({
      patientId: new FormControl(data.patientAdmission.patient.medicalRecordNumber),
      patientname: new FormControl(data.patientAdmission.patient.firstName +" "+data.patientAdmission.patient.secondName+" "+data.patientAdmission.patient.thirdName+" "+ data.patientAdmission.patient.familyName),
      caseType: new FormControl(data.patientAdmission.caseTypesTbl.caseName),
      admissionType: new FormControl(data.patientAdmission.admissionType),
      admReason: new FormControl(data.patientAdmission.admReason),
      comment: new FormControl(data.patientAdmission.comment),
      admTime: new FormControl(new Date(data.patientAdmission.admTime)),
      admDate: new FormControl(new Date(data.patientAdmission.admDate)),
      admissionStatusId: new FormControl(),
      status: new FormControl(data.patientAdmission?.admissionStatusId),
      estLeght: new FormControl(data.patientAdmission.estLeght),
      specialities: new FormControl(data?.specialities?.speciality_Code),
      floorId: new FormControl(data.floors.id),
      roomId: new FormControl(data.rooms.id),
      badId: new FormControl(data.bads.id),
      attendingPhysician: new FormControl(data?.patientAdmission?.attendDoctor?.doctor_Code),
      admittedPhysician: new FormControl(data?.patientAdmission?.admittedDoctor?.doctor_Code),
      doctor_code: new FormControl(data.patientAdmission?.attendDoctor_code),
      attendDoctor_code: new FormControl(data.patientAdmission?.attendDoctor_code),
      admittedDoctor_code: new FormControl(data.patientAdmission?.admittedDoctor?.doctor_Code),
      speciality_Code: new FormControl(data?.specialities?.speciality_Code),
      admissionTypeid: new FormControl(data.patientAdmission.admissionTypesTbl.admissionTypeName)
    });
  }
  getSelectCaseTypesTbl() {
    this.dataservice.getData<[]>(Modules.getSelectCaseTypesTbl).then((res: any) => {
      if (res && res.length) {
        this.caseTypelist = res;
        if (this.editForm && this.editForm.controls['caseType']) {
          this.editForm.controls['caseType'].setValue(res[0]?.caseName);
        }
      }
    });
  }
  getSpeciality() {
    let getData = JSON.parse(sessionStorage.getItem('User'));
    this.dataservice.getData<[]>(`${Modules.getSpeciality}?Hosp_code=${getData.hosp_Code}`).then((res) => {
      if (res && res.length) {
        this.getSpecialitylist = res;
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
    this.editForm?.get('roomId').patchValue(' ');
    this.editForm?.get('badId').patchValue(' ');
    if (event) {
      const floornumber = this.getFloorslist.find(d => d.id === event)?.id
      if (floornumber) {
        this.dataservice.getData<[]>(`${Modules.getRooms}?FloorsId=${floornumber}`).then((res: any) => {
          if (res && res.length) {
            this.getRoomslist = res.filter(d => (d.id === this.editForm.value.roomId && d.isBooked) || !d.isBooked);
            this.getSelectgetBads(this.editlist.rooms.id);
          }
        });
      }
    }
  }
  getSelectgetBads(event) {
    if(this.editlist.rooms.id !== event){
      this.editForm?.get('badId').patchValue(' ');
    }
    if (event) {
      const badNumber = this.getRoomslist.find(d => d.id === event)?.id;
      if (badNumber) {
        this.dataservice.getData<[]>(`${Modules.getBads}?RoomId=${badNumber}`).then((res: any) => {
          if (res && res.length) {
            this.getBadlist = res.filter(d => (d.id === this.editForm.value.badId && d.isBooked) || !d.isBooked);
          }
        });
      }
    }
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
  getAttendingPhysician(event) {
    let getData = JSON.parse(sessionStorage.getItem('User'));
    this.getPhysicianlist = [];
    let speciality_Code = this.getSpecialitylist.find(d => d.speciality_Code === event)?.speciality_Code
    this.dataservice.getData<[]>(`${Modules.GetGetDoctor}?Hosp_Code=${getData.hosp_Code}&Speciality_Code=${speciality_Code}`).then((res) => {
      if (res) {
        this.getPhysicianlist = res;
        // this.editForm.get('admittedPhysician').patchValue(' ');
      }
    });
  }

  cancel(): void {
    this.modalRef.hide();
  }

  onSave() {
    let getData = JSON.parse(sessionStorage.getItem('User'));
    const data = this.editForm.value;
    delete this.editForm.value.admissionTypeid;
    let payload = {
      id: this.editlist.patientAdmissionId,
      createdBy: getData.id,
      createdDate: new Date().toLocaleString(),
      updatedBy: getData.updatedBy,
      updatedDate: null,
      caseType: data.caseType === "InPatient" ? 1 : data.caseType,
      caseTypesTbl: null,
      admFacility: "string",
      emergencyCase: false,
      admissionType: data.admissionType,
      admissionTypesTbl: null,
      admReason: data.admReason,
      admDate: data.admDate,
      admTime: data.admTime,
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
      patientId: this.editlist.patientAdmission.patientId,
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
    if (!this.isStatusPlanned) {
      this.dataservice.post<[]>(Modules.saveAdmittedPatient, payload).then((response) => {
        this.modalRef.hide();
        if (response.message === "Data saved successfully") {
          this.sendOnload.emit();
        }
      });
    }
  }

  onChangeStatus(event: any) {
    if (event && event === 2) {
      this.isStatusPlanned = true;
    } else {
      this.isStatusPlanned = false;
    }
    if (event && event === 3) {
      this.isActualDisable = true;
    }
  }
}
