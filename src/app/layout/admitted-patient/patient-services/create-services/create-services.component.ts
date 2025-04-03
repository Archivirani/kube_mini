import { formatDate } from '@angular/common';
import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ClinicService } from '@services/clinic.service';
import { DataService } from '@services/data.service';
import { Appointment } from '@services/model/appointment.model';
import { OrderService } from '@services/model/clinic.model';
import { StatusFlags } from '@services/model/data.service.model';
import { ResourceService } from '@services/resource.service';
import { FixedRoutes, Modules } from '@urls';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { AdmitpatientRequestFormComponent } from '../admitpatient-request-form/admitpatient-request-form.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-services',
  templateUrl: './create-services.component.html',
  styleUrls: ['./create-services.component.scss']
})
export class CreateServicesComponent implements OnInit {
  private modalRef: BsModalRef;
  public createClinicForm: FormGroup;
  public loboratory: OrderService[] = [];
  public radiology: OrderService[] = [];
  public Medication: OrderService[] = [];
  public Procedures_packages: OrderService[] = [];
  public Consultation: OrderService[] = [];
  public orderSetSubscription: Subscription;
  public medicationData: any[];
  public isSaveAndPrint:boolean=false;
  public routesList:any[]=[];
  public DurationList:any[]=[];
  public cycleList:any[]=[];
  @Input() Appointment: any;
  @Input() clinicservices:any;
  @ViewChild('medicatedPopup', { static: true }) medicatedPopup: TemplateRef<any>;
  @ViewChild('requestForm') requestForm: AdmitpatientRequestFormComponent;
  @Input() set customData(data: OrderService[]) {
    this.createClinicForm = new FormGroup({ orderServices: new FormArray([]), radiology: new FormArray([]), medication: new FormArray([]), Procedurespackages: new FormArray([]), consultation: new FormArray([]) });
    if (data && data.length) {
      this.loboratory = data.filter(d => d.categorization === 'Loboratory');
      this.radiology = data.filter(d => d.categorization === 'Radiology');
      this.Medication = data.filter(d => d.categorization === 'Medication');
      this.Procedures_packages = data.filter(d => d.categorization === 'Procedures and packages');
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
      this.Procedures_packages.forEach((item) => {
        (this.createClinicForm.get('Procedurespackages') as FormArray).push(this.createForm(item));
      });
      this.Consultation.forEach((item) => {
        (this.createClinicForm.get('consultation') as FormArray).push(this.createForm(item));
      });
    }
  };
  constructor(public clinicService: ClinicService, private dataService: DataService, private router: Router, private modalService: BsModalService,) {
    if (this.orderSetSubscription) { this.orderSetSubscription.unsubscribe(); }
    this.orderSetSubscription = this.clinicService.orderSet.subscribe((resp) => {
      if (resp) {
        if (this.createClinicForm.valid) {
          if (this.createClinicForm.get('medication').value && this.createClinicForm.get('medication').value.length) {
            this.medicationData = this.createClinicForm.get('medication').value;
            this.modalRef = this.modalService.show(this.medicatedPopup, {
              backdrop: true, ignoreBackdropClick: true, class: 'book-appointment-popup create-service-popup'
            });
          } else {
            const orderServices = [];
            Object.keys(this.createClinicForm.value).forEach(key => {
              orderServices.push(...this.createClinicForm.value[key]);
            });
            let getData = JSON.parse(sessionStorage.getItem('User'));
            const order = {
              orderServices: orderServices,
              dateTime: new Date().toLocaleString(),
              doctor_code: this.Appointment.specialities?.doctors?.doctor_Code,
              patientId: this.Appointment.patientAdmission.patient.id,
              visitId: this.Appointment.visitId,
              id: 0,
              createBy: getData.id,
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
                this.clinicservices.forEach(element => { element.isSelected = false; });
                this.clinicService.clinicOrderDetails = [];
                let isValid = orderServices.some(d => d.categorization == "Medication" || d.categorization == "Radiology" || d.categorization == "Loboratory")
                if (isValid) {
                  this.requestForm.showrequestFormPopup(orderServices, this.Appointment);
                }
                this.clinicService.clearData();
              }
            }).then((res) => {
              this.modalRef.hide();
              (this.createClinicForm.get('orderServices') as FormArray).clear();
              (this.createClinicForm.get('radiology') as FormArray).clear();
              (this.createClinicForm.get('medication') as FormArray).clear();
              (this.createClinicForm.get('Procedurespackages') as FormArray).clear();
              (this.createClinicForm.get('consultation') as FormArray).clear();
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

 async onSave() {
    if (this.createClinicForm.valid) {
      let printServices = [];
      Object.keys(this.createClinicForm.value).forEach(key => {
        printServices.push(...this.createClinicForm.value[key]);
      });
      let orderServices = [];
      Object.keys(this.createClinicForm.value).forEach(key => {
        orderServices.push(...this.createClinicForm.value[key]);
      });
      if(this.Appointment?.order){
        await   this.dataService.get(`${Modules.getServiceHistory}/${this.Appointment?.order?.patientId}`).then((response:any) => {
          const ordersData = response.data[0].orders;
          const ordersDataService = [];
          ordersData.forEach((order)=>{
              ordersDataService.push(...order.orderServices)
          })
          const combinedData = ordersDataService.concat(orderServices)
          const uniqueDataArray = combinedData.reduce((acc, obj) => {
            if(!obj.isPaid){
              const existingIndex = acc.findIndex(item => item.name === obj.name);
            if (existingIndex === -1) {
              acc.push(obj);
            } else {
              if (obj.id === 0) {
                acc[existingIndex] = obj;
              }
            }
          }
            return acc;
          }, []);
          orderServices = uniqueDataArray;
        });
      }
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
        doctor_code: this.Appointment.specialities?.doctors?.doctor_Code || this.Appointment.patientAdmission.attendDoctor_code,
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
          this.clinicservices.forEach(element => { element.isSelected = false; });
          this.clinicService.clinicOrderDetails = [];
        }
      }).then((res) => {
        this.modalRef.hide();
        this.radiology=[];
        this.Consultation=[];
        this.Procedures_packages=[];
        this.Medication=[];
        (this.createClinicForm.get('orderServices') as FormArray).clear();
        if(!this.isSaveAndPrint){
          this.router.navigate([`${FixedRoutes.Order}`])
          }else{
            this.requestForm.showrequestFormPopup(printServices, this.Appointment);
            this.isSaveAndPrint=false;
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

  

  onDelete(orders, index: number) {
    if (orders == 'orderServices') {
      this.createClinicForm.get('orderServices')['controls'].splice(index, 1);
      this.createClinicForm.get('orderServices')['value'].splice(index, 1)
    } else if (orders == 'radiology') {
      this.createClinicForm.get('radiology')['controls'].splice(index, 1);
      this.createClinicForm.get('radiology')['value'].splice(index, 1);
    } else if (orders == 'Procedurespackages') {
      this.createClinicForm.get('Procedurespackages')['controls'].splice(index, 1);
      this.createClinicForm.get('Procedurespackages')['value'].splice(index, 1);
    } else if (orders == 'consultation') {
      this.createClinicForm.get('consultation')['controls'].splice(index, 1);
      this.createClinicForm.get('consultation')['value'].splice(index, 1);
    } else if (orders == 'medication') {
      this.createClinicForm.get('medication')['controls'].splice(index, 1);
      this.createClinicForm.get('medication')['value'].splice(index, 1);
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
  
 async onSaveAndPrint()
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
      let printServices = [];
      Object.keys(this.createClinicForm.value).forEach(key => {
        printServices.push(...this.createClinicForm.value[key]);
      });
      let orderServices = [];
      Object.keys(this.createClinicForm.value).forEach(key => {
        orderServices.push(...this.createClinicForm.value[key]);
      });
      if(this.Appointment?.order){
        await   this.dataService.get(`${Modules.getServiceHistory}/${this.Appointment?.order?.patientId}`).then((response:any) => {
          const ordersData = response.data[0].orders;
          const ordersDataService = [];
          ordersData.forEach((order)=>{
              ordersDataService.push(...order.orderServices)
          })
          const combinedData = ordersDataService.concat(orderServices)
          const uniqueDataArray = combinedData.reduce((acc, obj) => {
            if(!obj.isPaid){
              const existingIndex = acc.findIndex(item => item.name === obj.name);
            if (existingIndex === -1) {
              acc.push(obj);
            } else {
              if (obj.id === 0) {
                acc[existingIndex] = obj;
              }
            }
          }
            return acc;
          }, []);
          orderServices = uniqueDataArray;
        });
      }
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
        doctor_code: this.Appointment.specialities?.doctors?.doctor_Code || this.Appointment.patientAdmission.attendDoctor_code,
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
          (this.createClinicForm.get('Procedurespackages') as FormArray).clear();
          (this.createClinicForm.get('consultation') as FormArray).clear();
          let isValid = printServices.some(d => d.categorization == "Medication" || d.categorization == "Radiology" || d.categorization == "Loboratory")
          if (isValid) {
            this.requestForm.showrequestFormPopup(printServices, this.Appointment);
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
            });
          }
          this.clinicservices.forEach(element => { element.isSelected = false; });
          this.clinicService.clinicOrderDetails = [];
        }
      });
    }
  }
}

async onUpdateServices(){
  if (this.createClinicForm.valid) {
    const medicationData = this.createClinicForm.get('medication').value
    if (medicationData && medicationData.length) {
      this.medicationData = medicationData;
      this.modalRef = this.modalService.show(this.medicatedPopup, {
        backdrop: true, ignoreBackdropClick: true, class: 'book-appointment-popup medication-popup'
      });
    } else {
     
      let orderServices = [];
      Object.keys(this.createClinicForm.value).forEach(key => {
        orderServices.push(...this.createClinicForm.value[key]);
      });
      if(this.Appointment?.order){
        await   this.dataService.get(`${Modules.getServiceHistory}/${this.Appointment?.order?.patientId}`).then((response:any) => {
          const ordersData = response.data[0].orders;
          const ordersDataService = [];
          ordersData.forEach((order)=>{
              ordersDataService.push(...order.orderServices)
          })
          const combinedData = ordersDataService.concat(orderServices)
          const uniqueDataArray = combinedData.reduce((acc, obj) => {
            if(!obj.isPaid){
              const existingIndex = acc.findIndex(item => item.name === obj.name);
            if (existingIndex === -1) {
              acc.push(obj);
            } else {
              if (obj.id === 0) {
                acc[existingIndex] = obj;
              }
            }
          }
            return acc;
          }, []);
          orderServices = uniqueDataArray;
        });
      }
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
        doctor_code: this.Appointment.specialities?.doctors?.doctor_Code || this.Appointment.patientAdmission.attendDoctor_code,
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
          (this.createClinicForm.get('Procedurespackages') as FormArray).clear();
          (this.createClinicForm.get('consultation') as FormArray).clear();
          this.clinicservices.forEach(element => { element.isSelected = false; });
          this.clinicService.clinicOrderDetails = [];
        }
        this.router.navigate([`${FixedRoutes.Order}`])
      });
    }
  }
}

  ngOnDestroy() {
    if (this.orderSetSubscription) { this.orderSetSubscription.unsubscribe(); }
  }
}
