import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FixedRoutes } from '@urls';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { DataService } from '@services/data.service';
import { Modules } from '@urls';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BookAppointmentPopupComponent } from '../book-appointment-popup/book-appointment-popup.component';
import { formatDate } from '@angular/common';
import { state } from '@angular/animations';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-search-patient-popup',
  templateUrl: './search-patient-popup.component.html',
  styleUrls: ['./search-patient-popup.component.scss']
})
export class SearchPatientPopupComponent implements OnInit {
  public modalRef: BsModalRef;
  public MRNnumber:number
  public MedicalRecord :number;
  public patientName:string;
  public currentDateAppointment:Date=new Date()
  @ViewChild('searchPatient') searchPatient: TemplateRef<any>;
  @ViewChild('bookAppointment') bookAppointment: BookAppointmentPopupComponent;
  public searchPatientData:any;
  public PatientForm:FormGroup;
  public BSmodalRef:BsModalRef;
  private typingTimer:any;
  @ViewChild('PatientList') PatientList: TemplateRef<any>;
  constructor(private modalService:BsModalService,private dataService:DataService,private router:Router) { 
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
    this.modalRef = this.modalService.show(this.searchPatient, { backdrop: false, ignoreBackdropClick:false ,class:'search-patient-popup'});
  }
  onCancel(){
    this.modalRef.hide();
  }
  addLaboratoryService(value){
  
   const data = this.router.url
   if(data=='/laboratory'){
    if(this.searchPatientData[value]?.isProvisional){
      this.onStatusChangeToClinic();
    }else{
      this.router.navigate([`${FixedRoutes.laboratory}/${FixedRoutes.laboratoryDetails}`],{state: this.searchPatientData[value]})
      this.onCancel()
    }
   }else if(data=='/radiology'){
    if(this.searchPatientData[value]?.isProvisional){
      this.onStatusChangeToClinic();
    }else{
      this.router.navigate([`${FixedRoutes.Radiology}/${FixedRoutes.RadiologyDetails}`],{state: this.searchPatientData[value]});
      this.onCancel();
    }
   }else if(data=='/pharmacy'){
    if(this.searchPatientData[value]?.isProvisional){
      this.onStatusChangeToClinic();
    }else{
      this.router.navigate([`${FixedRoutes.Pharmacy}/${FixedRoutes.PharmacyDetails}`],{state: this.searchPatientData[value]});
      this.onCancel();
    }
   }else if(data=='/order'){
      if(this.searchPatientData[value]?.isProvisional){
        this.onStatusChangeToClinic();
      }else{
        const allpaid=this.searchPatientData[value]?.order?.orderServices?.every(os => os.isPaid);
        if(!this.searchPatientData[value].order || allpaid){
          const data={...this.searchPatientData[value].order,patient:this.searchPatientData[value].patient,...this.searchPatientData[value],allservicesarePaid:true,appointmentId:this.searchPatientData[value].id}
          this.router.navigate([`${FixedRoutes.Order}/${FixedRoutes.OrderDetails}`],{state:data});
          this.onCancel();
        }else{
          const data={...this.searchPatientData[value].order,patient:this.searchPatientData[value].patient,...this.searchPatientData[value],appointmentId:this.searchPatientData[value].id}
          this.router.navigate([`${FixedRoutes.Order}/${FixedRoutes.OrderDetails}`],{state:data});
          this.onCancel();
        }
       
      }
   }
  }
  createWalk(data , item){
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 30 * 60000); 
    this.bookAppointment.showPopup({...data,appointmentDateTime: startTime, startTime: formatDate(startTime, "HH:mm", "en-US"), endTime: formatDate(endTime, "HH:mm", "en-US"),MedicalRecord:this.MedicalRecord, patientName:this.patientName},item)
    this.onCancel()
  }
  
  getSerachedPatient(event) {
    this.MedicalRecord = event.target.value;
    const getData = JSON.parse(sessionStorage.getItem('User'));
    
    if (event.target.value >= 6) {
      this.dataService.getData(`${Modules.getSearchedPatient}?MRM=${event.target.value}&Hop_code=${getData.hosp_Code}`)
        .then((res: any[]) => {
          this.searchPatientData = res;
          this.searchPatientData.sort((a, b) => {
            return new Date(a.appointmentDateTime) < new Date(b.appointmentDateTime) ? 1 : -1;
          });
          const latestAppointmentDate = new Date(this.searchPatientData[0]?.appointmentDateTime);
          const todayDate = latestAppointmentDate.getDate(); 
          const todayMonth= latestAppointmentDate.getMonth();
          const todayYear = latestAppointmentDate.getFullYear();
          this.searchPatientData = this.searchPatientData.filter(item => {
            const appointmentDay = new Date(item.appointmentDateTime).getDate();
            const appointmentMonth = new Date(item.appointmentDateTime).getMonth();
            const appointmentYear = new Date(item.appointmentDateTime).getFullYear();
            const isSameDate = (appointmentDay === todayDate &&
              appointmentMonth === todayMonth &&
              appointmentYear === todayYear);
              return isSameDate;
            });
            const formArray = this.array;
            formArray.clear(); 
            for (let i = 0; i < this.searchPatientData.length; i++) {

            this.array.push(this.createForm(this.searchPatientData[i]));
            }
          })
          .catch(error => {
            console.error('Error fetching data:', error);
          });
        }
  }
  onChange(event){
    this.PatientForm.patchValue({ ...this.PatientForm.value });
    (this.array as FormArray).clear();
    this.searchPatientData= this.searchPatientData.filter((d)=>d.patientId == event.patientId);
    this.searchPatientData.sort((a, b) => {
      return new Date(a.appointmentDateTime) < new Date(b.appointmentDateTime) ? 1 : -1;
    });
    const latestAppointmentDate = new Date(this.searchPatientData[0]?.appointmentDateTime);
    const todayDate = latestAppointmentDate.getDate(); 
    this.searchPatientData = this.searchPatientData.filter(item => {
      const appointmentDate = new Date(item.appointmentDateTime).getDate();
      return appointmentDate === todayDate;
    });
    for (let i = 0; i < this.searchPatientData.length; i++) {
      this.PatientForm.controls['mrn'].patchValue(this.searchPatientData[i].patient.medicalRecordNumber);
      this.array.push(this.createForm(this.searchPatientData[i]));
    }
  
    this.BSmodalRef.hide()
  };

  onPatientSelect(patient) {
    this.PatientForm.controls['mrn'].patchValue(patient.patient.medicalRecordNumber);
    this.PatientForm.controls['patientName'].patchValue(
      `${patient.patient.firstName} ${patient.patient.secondName} ${patient.patient.thirdName} ${patient.patient.familyName}`
    );
    const servicesList = this.PatientForm.get('servicesList') as FormArray;
    servicesList.clear();
  
    servicesList.push(this.createForm(patient));
    if (this.BSmodalRef) {
      this.BSmodalRef.hide();
    }
  }
  
    getPatient(event) {
      this.patientName = event.target.value;
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
            this.searchPatientData.sort((a, b) => {
              const dateA = new Date(a.appointmentDateTime);
              const dateB = new Date(b.appointmentDateTime);
              return dateB.getTime() - dateA.getTime();
            });
            if(this.searchPatientData.length>1){
              this.BSmodalRef = this.modalService.show(this.PatientList, { backdrop: true, ignoreBackdropClick: false, class:'patient-appointment-modal' });
            }else{
              this.searchPatientData.sort((a, b) => {
                return new Date(a.appointmentDateTime) < new Date(b.appointmentDateTime) ? 1 : -1;
              });
              const latestAppointmentDate = new Date(this.searchPatientData[0]?.appointmentDateTime);
              const todayDate = latestAppointmentDate.getDate(); 
              this.searchPatientData = this.searchPatientData.filter(item => {
                const appointmentDate = new Date(item.appointmentDateTime).getDate();
                return appointmentDate === todayDate;
              });
              let formArray = this.array;
              formArray.clear();
              for (let i = 0; i < this.searchPatientData.length; i++) {
                this.PatientForm.controls['mrn'].patchValue(this.searchPatientData[i].patient.medicalRecordNumber);
                this.array.push(this.createForm(this.searchPatientData[i]));
              }
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
  
  onStatusChangeToClinic() {
    Swal.fire({
      title: 'Adding services not allowed for provisional patients , please complete patient registration',
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
  createForm(data){
    this.PatientForm.controls['patientName'].patchValue(data.patient.firstName+" "+data.patient.secondName+" "+data.patient.thirdName+" "+data.patient.familyName)
    return new FormGroup({
      appointmentId:new FormControl(data.id),
      attendingPhysician:new FormControl(data.doctors?.doctor_Name),
      visitDate:new FormControl(formatDate(new Date(data.appointmentDateTime),"dd-MM-YYYY", "en-US")),
      speciality:new FormControl(data?.doctors?.specialities?.speciality_desc),
      doctor_code:new FormControl(data?.doctors?.doctor_Code),
      patientId:new FormControl(data.patientId),
      comment:new FormControl(data.comment),
      order:new FormControl(data.order)
    });
  }
  onHidePopup(){
    this.BSmodalRef.hide();
    this.PatientForm.reset();
    (this.PatientForm.get('servicesList') as FormArray).clear();
  }
}
