import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DataService } from '@services/data.service';
import { FixedRoutes, Modules } from '@urls';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'transferpatient-popup',
  templateUrl: './transferpatient-popup.component.html',
  styleUrls: ['./transferpatient-popup.component.scss']
})
export class TransferpatientPopupComponent implements OnInit {
  modalRef:BsModalRef;
  transferForm:FormGroup;
  public transferTypeList:any[]=[];
  public transferStatusList:any[]=[];
  public getSpecialitylist:any[]=[];
  public getFloorslist:any[]=[];
  public getPhysicianlist:any[]=[];
  public getRoomslist:any[]=[];
  public getBadlist:any[]=[];
  public patientData:any;
  @ViewChild('transferpatientPopup', { static: true }) transferpatientPopup: TemplateRef<any>;
  @Output() sendOnload:EventEmitter<any>=new EventEmitter();
  constructor(private modalService: BsModalService,private dataService:DataService ) {

  }
  ngOnInit(): void {
    this.getTransferTypes();
    this.getSpeciality();
    this.getSelectgetFloors();
  }
  showPopup(data){
    this.patientData=data;
    this.getAttendingPhysician(data?.speciality_Code);
    this.getSelectgetRooms(data.floors.id);
    this.transferForm=this.transferPatientList(data);
    this.getTransferStatus();
   
    this.modalRef = this.modalService.show(this.transferpatientPopup, { backdrop: true, ignoreBackdropClick: false, class: 'transfer-patient-popup' });
  }

  transferPatientList(data){
    return new FormGroup({
      mrn:new FormControl(data.patientAdmission.patient.medicalRecordNumber),
      patientName:new FormControl(data.patientAdmission.patient.firstName +" "+data.patientAdmission.patient.secondName+" "+data.patientAdmission.patient.thirdName+" "+ data.patientAdmission.patient.familyName),
      visitId:new FormControl(data.visitId),
      caseType:new FormControl(data.patientAdmission.caseType),
      admDate:new FormControl(new Date(data.patientAdmission.admDate)),
      admTime:new FormControl(new Date(data.patientAdmission.admTime)),
      transferDate:new FormControl(new Date(), [Validators.required, this.dateValidator()]),
      transferTime:new FormControl(new Date()),
      transferTypeId:new FormControl(undefined,[Validators.required]),
      transferStatusId:new FormControl(undefined,[Validators.required]),
      speciality_Code:new FormControl(data.speciality_Code),
      floorId:new FormControl(data.floors.id),
      roomId:new FormControl(data.rooms.id),
      badId:new FormControl(data.bads.id),
      attendDoctor_code:new FormControl(data?.patientAdmission.attendDoctor.doctor_Code),
      comment:new FormControl(),
      caseTypeId:new FormControl(data.patientAdmission.caseTypesTbl.caseName)
    });
  }

  getTransferTypes(){
    this.dataService.getData<[]>(Modules.getTransferTypes).then((res)=>{
      if(res && res.length){
        this.transferTypeList=res;
      }
    })
  }
  getTransferStatus(){
    this.dataService.getData<[]>(Modules.getTransferStatuses).then((res :any)=>{
      if(res && res.length){
        
        this.transferStatusList = res;
        this.transferForm.get('transferStatusId').setValue(res[0].status)
        
      }
    })
  }
  getSelectgetFloors() {
    let getData = JSON.parse(sessionStorage.getItem('User'));
    this.dataService.getData<[]>(`${Modules.getFloors}?Hosp_code=${getData.hosp_Code}`).then((res) => {
      if (res && res.length) {
        this.getFloorslist = res;
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
    this.transferForm?.get('attendDoctor_code').patchValue(' ');
    if(event){
    let getData = JSON.parse(sessionStorage.getItem('User'));
    let speciality_Code=this.getSpecialitylist.find(d => d.speciality_Code === event)?.speciality_Code
    this.dataService.getData<[]>(`${Modules.GetGetDoctor}?Hosp_Code=${getData.hosp_Code}&Speciality_Code=${speciality_Code}`).then((res) => {
      if (res) {
        this.getPhysicianlist = res;
      }
    });
  }
  }
  getSelectgetRooms(event) {
    this.transferForm?.get('roomId').patchValue(' ');
    this.transferForm?.get('badId').patchValue(' ');
    if(event){
    const floornumber = this.getFloorslist.find(d => d.id === event).id
    this.dataService.getData<[]>(`${Modules.getRooms}?FloorsId=${floornumber}`).then((res:any) => {
      if (res && res.length) {
        this.getRoomslist = res.filter(d => (d.id === this.transferForm.value.roomId && d.isBooked) || !d.isBooked);
        this.getSelectgetBads(this.patientData.rooms.id);
      
      }
    });
  }
  }

  getSelectgetBads(event) {
    if(this.patientData.rooms.id !== event){
      this.transferForm?.get('badId').patchValue(' ');
    }
    if(event){
      const badNumber = this.getRoomslist.find(d => d.id === event)?.id
      this.dataService.getData<[]>(`${Modules.getBads}?RoomId=${badNumber}`).then((res:any) => {
        if (res && res.length) {
          this.getBadlist = res.filter(d => (d.id === this.transferForm.value.badId && d.isBooked) || !d.isBooked);
        }
      });
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
  onCancel(){
    this.modalRef.hide()
  }
  onSave(){
    if(this.transferForm.valid){
    const getData=JSON.parse(sessionStorage.getItem('User'));
    const data=this.transferForm.value;
    const {mrn,patientName,caseTypeId,transferStatusId, ...res } = this.transferForm.value;
    const payload={
      ...res,
    id: 0,
    createdBy:getData.id,
    createdDate: new Date().toISOString(),
    updatedBy:getData.updatedBy,
    updatedDate: new Date().toISOString(),
    floors: null,
    rooms: null,
    bads: null,
    transferStatusId:data.transferStatusId === "Actual" ? 1 : data.transferStatusId,
    transferStatus: null,
    transferTypes: null,
    status: true,
    transferDoctor_code:data.attendingPhysician,
    doctors: null,
    attendDoctor: null,
    patientId: this.patientData.patientAdmission.patientId,
    patient:null,
    hosp_Code:getData.hosp_Code,
    patientAdmissionId:this.patientData.patientAdmissionId,
    patientAdmission: null,
    visitId:this.patientData.visitId,
    patientVisit: null,
    specialities: null,
    }
    this.dataService.post<[]>(Modules.saveTransferPatient,payload).then((resp)=>{
      if(resp.message === "Data saved successfully"){
        this.modalRef.hide();
        this.sendOnload.emit();      
      }
    });
  }
  else{
    this.transferForm.markAllAsTouched();
    this.transferForm.updateValueAndValidity();
  }
  }
}
