import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '@services/data.service';
import { FixedRoutes, Modules } from '@urls';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-discharge-popup',
  templateUrl: './discharge-popup.component.html',
  styleUrls: ['./discharge-popup.component.scss'],
  providers:[DatePipe]
})
export class DischargePopupComponent implements OnInit {
  private eventsSubscription: Subscription;
  public getDischargeTypeData: any[] = [];
  public dischargeStatusList: any[] = [];
  public getBadlist: any[] = [];
  public getRoomslist: any[] = [];
  public getPhysicianlist: any[] = [];
  public getFloorslist: any[] = [];
  public getSpecialitylist: any[] = [];
  public getDischargePysicianList: any[] = [];
  public caseTypelist: any[] = [];
  public patientData: any;
  @ViewChild('dischargepopup', { static: true }) dischargepopup: TemplateRef<any>;
  @Output() sendOnload: EventEmitter<any> = new EventEmitter();
  private modalRef: BsModalRef;
  public dischargePatient: FormGroup;


  constructor(private modalService: BsModalService,private datePipe: DatePipe, private dataService: DataService, private router: Router) {

  }
  dischargePatientList(data) {
    return new FormGroup({
      mrn: new FormControl(data.patientAdmission.patient.medicalRecordNumber),
      patientName: new FormControl(data.patientAdmission.patient.firstName +" "+data.patientAdmission.patient.secondName+" "+data.patientAdmission.patient.thirdName+" "+ data.patientAdmission.patient.familyName),
      visitId: new FormControl(data.visitId),
      admittedOn: new FormControl(new Date(data.patientAdmission.admDate)),
      admittedAt: new FormControl(new Date(data.patientAdmission.admTime)),
      floorId: new FormControl(data.floors.id),
      roomId: new FormControl(data.rooms.id),
      badId: new FormControl(data.bads.id),
      attendDoctor_code: new FormControl(data?.patientAdmission.attendDoctor.doctor_Code),
      dischargeDate: new FormControl(new Date(), [Validators.required, this.dateValidator()]),
      dischargeTime: new FormControl(new Date()),
      dischargeTypesId: new FormControl('', Validators.required),
      dischargeStatusId: new FormControl('', Validators.required),
      dischargeDoctor_code: new FormControl(),
      dischargeReason: new FormControl(''),
      speciality_Code: new FormControl(data.speciality_Code)
    });
  }

  ngOnInit(): void {
    this.getDischargeStatus();
    this.getSpeciality();
    this.getSelectgetFloors();
    this.getDischargePhysician();
    this.getDischargeType();
    // this.eventsSubscription = this.onRefresh.subscribe();
  }
  showpopup(data) {
    this.patientData = data;

    this.getSelectgetRooms(data.floors.id);
    this.getAttendingPhysician(data?.speciality_Code);
    this.dischargePatient = this.dischargePatientList(data)
    this.modalRef = this.modalService.show(this.dischargepopup, { backdrop: true, ignoreBackdropClick: false, class: 'discharge-popup history-popup' });
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
    const floornumber = this.getFloorslist.find(d => d.id === event).id
    this.dataService.getData<[]>(`${Modules.getRooms}?FloorsId=${floornumber}`).then((res: any) => {
      if (res && res.length) {
        this.getRoomslist = res.filter(d => (d.id === this.dischargePatient.value.roomId && d.isBooked) || !d.isBooked);
        this.getSelectgetBads(this.patientData.rooms.id);
      }
    });
  }


  getSelectgetBads(event) {
    const badNumber = this.getRoomslist.find(d => d.id === event).id
    this.dataService.getData<[]>(`${Modules.getBads}?RoomId=${badNumber}`).then((res: any) => {
      if (res && res.length) {
        this.getBadlist = res.filter(d => (d.id === this.dischargePatient.value.badId && d.isBooked) || !d.isBooked);
      }
    });
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

  onSave() {
    if (this.dischargePatient.valid) {
      let getData = JSON.parse(sessionStorage.getItem('User'));
      const { mrn, patientName, admittedAt, admittedOn, ...res } = this.dischargePatient.value;
      const dischargeTimeValue = this.dischargePatient.get('dischargeTime').value;
      const payload = {
        ...res,
        id: 0,
        dischargeTime: this.datePipe.transform(dischargeTimeValue, 'MM-dd-YYYY HH:mm:ss') || '' ,
        createdBy: getData.id,
        createdDate: new Date().toISOString(),
        updatedBy: getData.updatedBy,
        updatedDate: new Date().toISOString(),
        attendDoctor: null,
        patientId: this.patientData.patientAdmission.patientId,
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
          // this.sendOnload.emit(); 
          this.modalRef.hide();
          this.router.navigate([`${FixedRoutes.DischargedPatients}`])
        }
      })
    }
    else {
      this.dischargePatient.markAllAsTouched();
      this.dischargePatient.updateValueAndValidity();
    }
  }

  onCancel() {
    this.modalRef.hide();
  }

}
