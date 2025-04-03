import { formatDate } from '@angular/common';
import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ClinicService } from '@services/clinic.service';
import { DataService } from '@services/data.service';
import { OrderService } from '@services/model/clinic.model';
import { FixedRoutes, Modules } from '@urls';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { RequestFormComponent } from '../../my-clinic/request-form/request-form.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-services',
  templateUrl: './create-services.component.html',
  styleUrls: ['./create-services.component.scss']
})
export class createServicesComponent implements OnInit {

  private modalRef: BsModalRef;
  public createClinicForm: FormGroup;
  public loboratory: OrderService[] = [];
  public radiology: OrderService[] = [];
  public Medication: OrderService[] = [];
  public erPackages: OrderService[] = [];
  public Consultation: OrderService[] = [];
  public orderSetSubscription: Subscription;
  public medicationData: any[];
  public routesList:any[]=[];
  public DurationList:any[]=[];
  public cycleList:any[]=[];
  isSaveAndPrint:boolean=false;
  @Input() Appointment: any;
  @Input() clinicservice : any;
  @ViewChild('medicatedPopup', { static: true }) medicatedPopup: TemplateRef<any>;
  @ViewChild('requestForm') requestForm: RequestFormComponent;
  @Input() set customData(data: OrderService[]) {
    this.createClinicForm = new FormGroup({ orderServices: new FormArray([]), radiology: new FormArray([]), medication: new FormArray([]), erPackage: new FormArray([]), consultation: new FormArray([]) });
    if (data && data.length) {
      this.loboratory = data.filter(d => d.categorization === 'Loboratory');
      this.radiology = data.filter(d => d.categorization === 'Radiology');
      this.Medication = data.filter(d => d.categorization === 'Medication');
      this.erPackages = data.filter(d => d.categorization === 'ERPackages');
      this.Consultation = data.filter(d => d.categorization === 'Consultation');
      this.loboratory.forEach((item) => {
        (this.createClinicForm.get('orderServices') as FormArray).push(this.createForm(item));
      });
      this.radiology.forEach((item) => {
        (this.createClinicForm.get('radiology') as FormArray).push(this.createForm(item));
      });
      this.Medication.forEach((item) => {
        (this.createClinicForm.get('medication') as FormArray).push(this.createForm(item));
      });
      this.erPackages.forEach((item) => {
        (this.createClinicForm.get('erPackage') as FormArray).push(this.createForm(item));
      });
      this.Consultation.forEach((item) => {
        (this.createClinicForm.get('consultation') as FormArray).push(this.createForm(item));
      });
    }
  };
  constructor(public clinicService: ClinicService, private dataService: DataService, private router: Router, private modalService: BsModalService) {
    if (this.orderSetSubscription) { this.orderSetSubscription.unsubscribe(); }
    this.orderSetSubscription = this.clinicService.orderSet.subscribe((resp) => {
      if (resp) {
        if (this.createClinicForm.valid) {
          if (this.createClinicForm.get('medication').value && this.createClinicForm.get('medication').value.length) {
            this.medicationData = this.createClinicForm.get('medication').value;
            this.modalRef = this.modalService.show(this.medicatedPopup, {
              backdrop: true, ignoreBackdropClick: true, class: 'book-appointment-popup medication-popup'
            });
          } else {
            const orderServices = [];
            Object.keys(this.createClinicForm.value).forEach(key => {
              orderServices.push(...this.createClinicForm.value[key]);
            });
            const order = {
              orderServices: orderServices,
              dateTime: new Date().toLocaleString(),
              doctor_code: this.Appointment.specialities?.doctors?.doctor_Code || this.Appointment.patientAdmission.attendDoctor_code|| this.Appointment.specialities?.doctors?.doctor_code || this.Appointment.patientAdmission.attendDoctor_Code,
              patientId: this.Appointment.patientAdmission.patient.id,
              visitId: this.Appointment.visitId,
              id: 0,
              createBy: this.Appointment.id,
              createdDate: new Date().toISOString(),
              updatedBy: this.Appointment.updatedBy,
              updatedDate: this.Appointment.updatedDate,
              comment: this.Appointment.patientAdmission.comment,
              patient: null,
              doctors: null,
              physicianId: 0,
              appointmentId: 0,
              orderPayments: [],
              isPaid: true,
              payment: null,
            };
            this.dataService.post<any>(Modules.CreateOrder, order).then((response) => {
              if (response) {
                this.router.navigate([`${FixedRoutes.Order}`])
                this.clinicService.clearData();
                this.clinicService.clinicOrderDetails = [];
              }
            }).then((res) => {
              this.modalRef.hide();
              (this.createClinicForm.get('orderServices') as FormArray).clear();
              (this.createClinicForm.get('radiology') as FormArray).clear();
              (this.createClinicForm.get('medication') as FormArray).clear();
              (this.createClinicForm.get('erPackage') as FormArray).clear();
              (this.createClinicForm.get('consultation') as FormArray).clear();
              this.clinicservice.forEach(element => { element.isSelected = false; });
            });
          }
        }
      }
    });
  }
  ngOnInit(): void {
    this.getCycleList();
    this.getRoutes();
    this.getDuration();
  }

  onSave() {
    if (this.createClinicForm.valid) {
      const orderServices = [];
      Object.keys(this.createClinicForm.value).forEach(key => {
        orderServices.push(...this.createClinicForm.value[key]);
      });
      let payload =orderServices.map(ele => {
        return {
          ...ele,
          cycleId: ele.cycleId?.id,
          routeid: ele.routeid?.id,
          duration:ele.duration == null?0:ele.duration,
          dose:ele.dose == null?0:ele.dose
        };
      });
      const order = {
        orderServices: payload,
        dateTime: new Date().toLocaleString(),
        doctor_code: this.Appointment.specialities?.doctors?.doctor_Code ||  this.Appointment.patientAdmission.attendDoctor_code|| this.Appointment.specialities?.doctors?.doctor_code ||  this.Appointment.patientAdmission.attendDoctor_Code,
        patientId: this.Appointment.patientAdmission.patientId,
        visitId: this.Appointment.visitId,
        id: 0,
        createBy: this.Appointment.id,
        createdDate: new Date().toLocaleString(),
        updatedBy: this.Appointment.updatedBy,
        updatedDate: this.Appointment.updatedDate,
        comment: this.Appointment.patientAdmission.comment,
        patient: null,
        doctors: null,
        physicianId: 0,
        appointmentId: 0,
        orderPayments: [],
        isPaid: true,
        payment: null,
      };
      this.dataService.post<any>(Modules.CreateOrder, order).then((response) => {
        if (response) {
          this.clinicService.clearData();
          this.clinicService.clinicOrderDetails = [];
        }
      }).then((res) => {
        this.modalRef.hide();
        this.radiology=[];
        this.Consultation=[];
        this.erPackages=[];
        this.Medication=[];
        (this.createClinicForm.get('orderServices') as FormArray).clear();
        if(!this.isSaveAndPrint){
          this.router.navigate([`${FixedRoutes.Order}`])
          }else{
            this.requestForm.showrequestFormPopup(payload, this.Appointment);
            this.isSaveAndPrint=false;
            this.clinicservice.forEach(element => { element.isSelected = false; });
          }
        });
    }
  }
  onclose() {
    this.modalRef.hide()
  }

  createForm(data: any) {
    return new FormGroup({
      dateTime: new FormControl(new Date().toLocaleString()),
      DesiredDate: new FormControl(new Date()),
      DesiredTime: new FormControl(new Date().toLocaleTimeString()),
      price: new FormControl(data.defaultPrice),
      id: new FormControl(0),
      name: new FormControl(data.name),
      comment: new FormControl(''),
      quantity: new FormControl(1),
      discount: new FormControl(0),
      serviceId: new FormControl(data.id),
      consultationId: new FormControl(''),
      localization: new FormControl(''),
      orderId: new FormControl(0),
      order: new FormControl(''),
      unit: new FormControl(data.unit),
      categorization: new FormControl(data.categorization),
      cycleId: new FormControl(),
      cycles: new FormControl(null),
      dose: new FormControl(),
      duration: new FormControl(),
      duration_Unit: new FormControl(),
      routeid: new FormControl(),
      routes: new FormControl(null),
      unit1: new FormControl(data.unit),

    });
  }
  onSaveAndPrint()
  {
    if (this.createClinicForm.valid) {
    const medicationData = this.createClinicForm.get('medication').value
    if (medicationData && medicationData.length) {
      this.isSaveAndPrint=true;
      this.medicationData = medicationData;
      this.modalRef = this.modalService.show(this.medicatedPopup, {
        backdrop: true, ignoreBackdropClick: true, class: 'book-appointment-popup medication-popup  '
      });
    } else {
      
      const orderServices = [];
      Object.keys(this.createClinicForm.value).forEach(key => {
        orderServices.push(...this.createClinicForm.value[key]);
      });
      let Orderservice =orderServices.map(ele => {
        return {
          ...ele,
          cycleId: ele.cycleId?.id,
          routeid: ele.routeid?.id,
          duration:ele.duration == null?0:ele.duration,
          dose:ele.dose == null?0:ele.dose
        };
      });
      let getData = JSON.parse(sessionStorage.getItem('User'));
      const order = {
        orderServices: Orderservice,
        dateTime: new Date().toISOString(),
        doctor_code: this.Appointment.patientAdmission.doctor_Code || this.Appointment.patientAdmission.attendDoctor_code|| this.Appointment.patientAdmission.doctor_code || this.Appointment.patientAdmission.attendDoctor_Code,
        patientId: this.Appointment.patientAdmission.patientId,
        id: 0,
        createdBy: getData.id,
        createdDate: new Date().toISOString(),
        updatedBy: getData.id,
        updatedDate: new Date().toISOString(),
        comment: this.Appointment.comment,
        patient: null,
        doctors: null,
        physicianId: 0,
        orderPayments: [],
        isPaid: true,
        payment: null,
        caseType: 3,
        visitId:this.Appointment.visitId,
        admDate: this.Appointment?.patientAdmission?.admDate,
        disDate: this.Appointment?.dischargeDoctor?.end_Date,
        doctor_Name: this.Appointment?.patientAdmission?.attendDoctor?.doctor_Name,
        appointmentDateTime: this.Appointment?.appointmentDateTime,
      };
      this.dataService.post<any>(Modules.CreateOrder, order,true).then((response:any) => {
        if (response) {
          (this.createClinicForm.get('orderServices') as FormArray).clear();
          (this.createClinicForm.get('radiology') as FormArray).clear();
          (this.createClinicForm.get('medication') as FormArray).clear();
          (this.createClinicForm.get('erPackage') as FormArray).clear();
          (this.createClinicForm.get('consultation') as FormArray).clear();
            this.clinicservice.forEach(element => { element.isSelected = false; });
            let isValid = Orderservice.some(d => d.categorization == "Medication" || d.categorization == "Radiology" || d.categorization == "Loboratory")
                  if (isValid) {
                    this.requestForm.showrequestFormPopup(Orderservice, this.Appointment);
                  }else{
                    Swal.fire({
                      title: 'Order Placed Successfully',
                      icon: 'success',
                      showCancelButton: false,
                      showConfirmButton: true,
                      confirmButtonText: "Ok",
                      confirmButtonColor: '#3f7473',
                      customClass: {
                        container: 'notification-popup'
                      }
                    })
                  }
            this.clinicService.clinicOrderDetails = [];
        }
      });
    }
  }
}

onUpdateServices(){
    if (this.createClinicForm.valid) {
      const medicationData = this.createClinicForm.get('medication').value
      if (medicationData && medicationData.length) {
        this.medicationData = medicationData;
        this.modalRef = this.modalService.show(this.medicatedPopup, {
          backdrop: true, ignoreBackdropClick: true, class: 'book-appointment-popup medication-popup'
        });
      } else {
        
        const orderServices = [];
        Object.keys(this.createClinicForm.value).forEach(key => {
          orderServices.push(...this.createClinicForm.value[key]);
        });
        let Orderlist =orderServices.map(ele => {
          return {
            ...ele,
            cycleId: ele.cycleId?.id,
            routeid: ele.routeid?.id,
            duration:ele.duration == null?0:ele.duration,
            dose:ele.dose == null?0:ele.dose
          };
        });

        let getData = JSON.parse(sessionStorage.getItem('User'));
        
        const order = {
          orderServices: Orderlist,
          dateTime: new Date().toISOString(),
          doctor_code: this.Appointment?.patientAdmission?.doctor_Code || this.Appointment.patientAdmission.attendDoctor_code,
          patientId: this.Appointment.patientAdmission.patientId,
          id: 0,
          createdBy: getData.id,
          createdDate: new Date().toISOString(),
          updatedBy: getData.id,
          updatedDate: new Date().toISOString(),
          comment: this.Appointment.comment,
          patient: null,
          doctors: null,
          physicianId: 0,
          orderPayments: [],
          isPaid: true,
          payment: null,
          caseType: 3,
          visitId:this.Appointment.visitId,
          admDate: this.Appointment?.patientAdmission?.admDate,
          disDate: this.Appointment?.dischargeDoctor?.end_Date,
          doctor_Name: this.Appointment?.patientAdmission?.attendDoctor?.doctor_Name,
          appointmentDateTime: this.Appointment?.appointmentDateTime,
        };
        this.dataService.post<any>(Modules.CreateOrder, order,true).then((response:any) => {
          if (response) {
            (this.createClinicForm.get('orderServices') as FormArray).clear();
            (this.createClinicForm.get('radiology') as FormArray).clear();
            (this.createClinicForm.get('medication') as FormArray).clear();
            (this.createClinicForm.get('erPackage') as FormArray).clear();
            (this.createClinicForm.get('consultation') as FormArray).clear();
              this.clinicservice.forEach(element => { element.isSelected = false; });
              this.clinicService.clinicOrderDetails = [];
          }
          this.router.navigate([`${FixedRoutes.Order}`])
        });
      }
    }
}
  incrementQuantity(quantity) {
    quantity.quantity++;
  }

  decrementQuantity(quantity) {
    if (quantity.quantity > 1) {
      quantity.quantity--;
    }
  }
  getCycleList(){
    this.dataService.getData<[]>(Modules.GetCycles).then((res:any)=>{
      this.cycleList=res;
    })
  }
  
  getRoutes(){
    this.dataService.getData<[]>(Modules.GetRoutes).then((res)=>{
      this.routesList=res;
    })
  }
  
  getDuration(){
    this.dataService.getData<[]>(Modules.GetDuration).then((res)=>{
      this.DurationList=res;
    })
  }
  
  searchRoutes(term: string, item: any) {
    term = term.toLowerCase();
    return (item.routes_Description.toLowerCase().includes(term) || item.routes_Codes.toLowerCase().includes(term))
  }
  
  searchCycle(term: string, item: any) {
    term = term.toLowerCase();
    return (item.cycles_Description.toLowerCase().includes(term) || item.cycles_Codes.toLowerCase().includes(term))
  }
  

  onDelete(orders, index: number) {
    if (orders == 'orderServices') {
      this.createClinicForm.get('orderServices')['controls'].splice(index, 1);
      this.createClinicForm.get('orderServices')['value'].splice(index, 1)
    } else if (orders == 'radiology') {
      this.createClinicForm.get('radiology')['controls'].splice(index, 1);
      this.createClinicForm.get('radiology')['value'].splice(index, 1);
    } else if (orders == 'erPackage') {
      this.createClinicForm.get('erPackage')['controls'].splice(index, 1);
      this.createClinicForm.get('erPackage')['value'].splice(index, 1);
    } else if (orders == 'consultation') {
      this.createClinicForm.get('consultation')['controls'].splice(index, 1);
      this.createClinicForm.get('consultation')['value'].splice(index, 1);
    } else if (orders == 'medication') {
      this.createClinicForm.get('medication')['controls'].splice(index, 1);
      this.createClinicForm.get('medication')['value'].splice(index, 1);
    }
  }  
  ngOnDestroy() {
    if (this.orderSetSubscription) { this.orderSetSubscription.unsubscribe(); }
  }
}
