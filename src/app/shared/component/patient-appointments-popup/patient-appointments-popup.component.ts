import { formatDate } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { DataService } from '@services/data.service';
import { Patient } from '@services/model/patient.model';
import { Modules } from '@urls';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-patient-appointments-popup',
  templateUrl: './patient-appointments-popup.component.html',
  styleUrls: ['./patient-appointments-popup.component.scss'],
  providers:[BsModalService],
})
export class PatientAppointmentsPopupComponent implements OnInit {
  public modalRef: BsModalRef;
  public BSmodalRef:BsModalRef;
  public MRNnumber:number
  public MedicalRecord :number
  public currentDateAppointment:Date=new Date()
  private typingTimer:any;
  @ViewChild('searchPatient') searchPatient: TemplateRef<any>;
  @ViewChild('PatientList') PatientList: TemplateRef<any>;
  public searchPatientData:any;
  public searchPatientBackUpData:any;
  public PatientForm:FormGroup;
  constructor(private modalService:BsModalService,private dataService:DataService) { 
    this.PatientForm=new FormGroup({
      mrn:new FormControl(),
      patientName:new FormControl(),
      servicesList:new FormArray([])
    });
  }

  get array(){
    return this.PatientForm.get('servicesList') as FormArray;
  }

  ngOnInit(): void {
  }
  showPopup(){
    this.PatientForm.reset();
    (this.PatientForm.get('servicesList') as FormArray).clear();
    this.modalRef = this.modalService.show(this.searchPatient, { backdrop: false, ignoreBackdropClick:false });
  }
    
  getSearchedPatient(event) {
    this.MedicalRecord = event.target.value;
    const getData = JSON.parse(sessionStorage.getItem('User'));
    this.PatientForm.controls['patientName'].patchValue('');
    (this.PatientForm.get('servicesList') as FormArray).clear();
    if (event.target.value >= 6) {
      this.dataService.getData(`${Modules.getSearchedPatient}?MRM=${event.target.value}&Hop_code=${getData.hosp_Code}`)
        .then((res: any[]) => {
          if(res && res.length > 0){
            this.searchPatientData = res;
            this.searchPatientData.sort((a, b) => {
              const dateA = new Date(a.appointmentDateTime);
              const dateB = new Date(b.appointmentDateTime);
              return dateB.getTime() - dateA.getTime();
            });
            (this.array as FormArray).clear();
            for (let i = 0; i < this.searchPatientData.length; i++) {
              this.array.push(this.createForm(this.searchPatientData[i]));
            }
          }else{
            this.PatientForm.controls['patientName'].patchValue('');
            (this.array as FormArray).clear();
            this.searchPatientData = [];
          }
        })
        .catch(error => {
          console.error('Error fetching data:', error);
        });
    }
  }
  onChange(event){
    this.PatientForm.patchValue({ ...this.PatientForm.value, patient: { ...event, idType: event.idType }, patientId: event.id });
    (this.array as FormArray).clear();
   this.searchPatientData= this.searchPatientBackUpData.filter((d)=>d.patientId == event.patientId);
              for (let i = 0; i < this.searchPatientData.length; i++) {
                this.PatientForm.controls['mrn'].patchValue(this.searchPatientData[i].patient.medicalRecordNumber);
                this.array.push(this.createForm(this.searchPatientData[i]));
              }
              this.BSmodalRef.hide()
            
  };
  
    getPatient(event) {
    const doneTypingInterval = 1500; 
    this.PatientForm.controls['mrn'].patchValue('');
    (this.PatientForm.get('servicesList') as FormArray).clear();
    const getData = JSON.parse(sessionStorage.getItem('User'));
    clearTimeout(this.typingTimer);
    if(event){
     const data = event?.target?.value;
      if(data && data.length){
       this.typingTimer = setTimeout(()=>{
        this.dataService.getData(`${Modules.getSearchedPatient}?Hop_code=${getData.hosp_Code}&PatientName=${event.target.value}`).then((res:any) => {
          if(res && res.length > 0){
            this.searchPatientData = res;
            this.searchPatientBackUpData = res;            
            this.searchPatientData.sort((a, b) => {
              const dateA = new Date(a.appointmentDateTime);
              const dateB = new Date(b.appointmentDateTime);
              return dateB.getTime() - dateA.getTime();
            });
            if(this.searchPatientData.length > 0){
              this.searchPatientData = res.filter((value, index, self) =>
                index === self.findIndex((t) => t.patientId === value.patientId));
              this.BSmodalRef = this.modalService.show(this.PatientList, { backdrop: true, ignoreBackdropClick: false, class:'patient-appointment-modal'});
            }  
          }else{
            this.PatientForm.controls['patientName'].patchValue('');
            (this.PatientForm.get('servicesList') as FormArray).clear();
            this.searchPatientData = [];
          }
        });
      },doneTypingInterval); 
    }
  }
}

  createForm(data){
    this.PatientForm.controls['patientName'].patchValue(data.patient.firstName+" "+data.patient.secondName+" "+data.patient.thirdName+" "+data.patient.familyName)
    return new FormGroup({
      appointmentId:new FormControl(data.id),
      attendingPhysician:new FormControl(data.doctors.doctor_Name),
      visitDate:new FormControl(formatDate(new Date(data.appointmentDateTime),"dd-MM-YYYY", "en-US")),
      visitTime:new FormControl(formatDate(new Date(data.appointmentDateTime), "HH:mm:ss", "en-US")),
      speciality:new FormControl(data?.doctors?.specialities?.speciality_desc),
      doctor_code:new FormControl(data.doctors.doctor_Code),
      patientId:new FormControl(data.patientId),
      appointmentStatus:new FormControl(data.appointmentStatus ===  1 ? 'Planned' : data.appointmentStatus ===  2 ? 'NotShow' :  data.appointmentStatus ===  3 ? 'CheckedIn' :data.appointmentStatus ===  4 ? 'Cancelled':data.appointmentStatus ===  5 ?'ClosedEncounter':'')
    });
  }

  onCancel(){
    this.modalRef.hide();
  }
  onHidePopup(){
    this.BSmodalRef.hide();
    this.PatientForm.reset();
    (this.PatientForm.get('servicesList') as FormArray).clear();
  }
}
