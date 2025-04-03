import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ClinicService } from '@services/clinic.service';
import { DataService } from '@services/data.service';
import { OrderService } from '@services/model/clinic.model';
import { EditCommentPopupComponent } from '@shared/component/edit-comment-popup/edit-comment-popup.component';
import { FixedRoutes, Modules } from '@urls';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { ResourceService } from '@services/resource.service';
import Swal from 'sweetalert2';
import { PaymentRequestFormComponent } from '../payment-request-form/payment-request-form.component';

@Component({
  selector: 'app-payment-service',
  templateUrl: './payment-service.component.html',
  styleUrls: ['./payment-service.component.scss']
})
export class PaymentServiceComponent implements OnInit {

  showPatients = false;
  private modalRef: BsModalRef;
  public loboratory: OrderService[] = [];
  public radiology: OrderService[] = [];
  public Medication: OrderService[] = [];
  public Procedures_packages: OrderService[] = [];
  public Consultation: OrderService[] = [];
  public createClinicForm: FormGroup;
  public orderSetSubscription: Subscription;
  public medicationData: any[];
  public isDisplay:boolean=false;
  public orderServices: OrderService[] = []
  public oldOrderServices: OrderService[] = [];
  public orderData:any;
  public orderServicesdata:OrderService[] = [];
  public routesList:any[]=[];
  public DurationList:any[]=[];
  public cycleList:any[]=[];
  isSaveAndPrint:boolean = false;

  @ViewChild('editCommentPopup') editCommentPopup: EditCommentPopupComponent;
  @ViewChild('paymentRequestForm') requestForm: PaymentRequestFormComponent;

  @ViewChild('medicatedPopup', { static: true }) medicatedPopup: TemplateRef<any>;
  @Input() Appointment: any;
  @Input() clinicservice: any;
  @Input() set customData(data: OrderService[]) {
    this.setOrderDetails(data);
  };
  constructor(public clinicService: ClinicService, private dataService: DataService, private router: Router, private modalService: BsModalService, private resourceService: ResourceService) {
    if (this.orderSetSubscription) { this.orderSetSubscription.unsubscribe(); }
    this.createOrderdetails();
  }
  ngOnInit(): void {
    this.getCycleList();
    this.getRoutes();
    this.getDuration();
  }
  setOrderDetails(data){
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
  }
async  onSave() {
    let getData = JSON.parse(sessionStorage.getItem('User'));
    let orderServices = [];
      
    Object.keys(this.createClinicForm.value).forEach(key => {
      orderServices.push(...this.createClinicForm.value[key]);
    });
    let printList = [];
    orderServices.map((data) => {
      const { ...row } = data;
      return { ...row 
      }
    });
    printList = orderServices;
    await this.dataService.get(`${Modules.getServiceHistory}/${this.Appointment.patientId}`).then((response:any) => {
      const ordersData = response.data[0].orders;
      const ordersDataService = [];
      ordersData.forEach((order)=>{
          ordersDataService.push(...order.orderServices)
      })
      const combinedData = ordersDataService.concat(orderServices)
      const uniqueDataArray = combinedData.reduce((acc, obj) => {
        const existingIndex = acc.findIndex(item => item.name === obj.name);
        if (existingIndex === -1) {
          acc.push(obj);
        } else {
          if (obj.id === 0) {
            acc[existingIndex] = obj;
          }
        }
        return acc;
      }, []);
      orderServices = uniqueDataArray;
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
        orderServices:payload,
        dateTime: new Date().toISOString(),
        doctor_code: this.Appointment?.doctor_Code,
        patientId: this.Appointment.patientId,
        appointmentId: this.Appointment.id,
        id: 0,
        createdBy: getData.id,
        createdDate: new Date().toISOString(),
        updatedBy: this.Appointment.updatedBy,
        updatedDate: this.Appointment.updatedDate,
        comment: this.Appointment.comment,
        patient: null,
        doctors: null,
        physicianId: 0,
        orderPayments: [],
        isPaid: true,
        payment: null,
        appointmentDateTime: this.Appointment?.appointmentDateTime,
      };
      this.dataService.post<any>(Modules.CreateOrder, order,true).then((response) => {
        if (response) {
          this.clinicService.clearData();
        }
      }).then((res) => {
        this.modalRef.hide();
        this.radiology=[];
        this.Consultation=[];
        this.Procedures_packages=[];
        this.Medication=[];
        this.clinicService.clinicOrderDetails = [];
        (this.createClinicForm.get('orderServices') as FormArray).clear();
        if(!this.isSaveAndPrint){
          this.clinicService.changeTab.next("Patient-Profile"); 
           this.clinicService.clearData();
          }else{
          this.requestForm.showrequestFormPopup(printList, this.Appointment);
          this.isSaveAndPrint=false;
           this.clinicService.clearData();
          }
        });
    }
  
  createOrderdetails(){
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
              dateTime: new Date().toISOString(),
              doctor_code: this.Appointment?.doctor_Code,
              patientId: this.Appointment.patientId,
              appointmentId: this.Appointment.id,
              id: 0,
              createdBy: getData.id,
              createdDate: new Date().toISOString(),
              updatedBy: this.Appointment.updatedBy,
              updatedDate: this.Appointment.updatedDate,
              comment: this.Appointment.comment,
              patient: null,
              doctors: null,
              physicianId: 0,
              orderPayments: [],
              isPaid: true,
              payment: null,
              caseType: this.Appointment?.patientAdmission?.caseType,
              admDate: this.Appointment?.patientAdmission?.admDate,
              disDate: this.Appointment?.dischargeDoctor?.end_Date,
              doctor_Name: this.Appointment?.patientAdmission?.attendDoctor?.doctor_Name,
              appointmentDateTime: this.Appointment?.appointmentDateTime,
            };
            this.dataService.post<any>(Modules.CreateOrder, order).then((response:any) => {
              if (response) {
                // this.router.navigate([`${FixedRoutes.Order}`])
                this.clinicService.clearData();
                this.clinicService.clinicOrderDetails = [];
              }
            }).then((res) => {
              this.modalRef.hide();
              (this.createClinicForm.get('orderServices') as FormArray).clear();
              // (this.createClinicForm.get('radiology') as FormArray).clear();
              // (this.createClinicForm.get('medication') as FormArray).clear();
              // (this.createClinicForm.get('Procedurespackages') as FormArray).clear();
              // (this.createClinicForm.get('consultation') as FormArray).clear();
            });
          }
        }
      }
    })
  }
  onclose() {
    this.modalRef.hide()
  }
  createForm(data: any) {
    return new FormGroup({
      dateTime: new FormControl(new Date()),
      DesiredDate: new FormControl(new Date().toLocaleDateString()),
      DesiredTime: new FormControl(new Date().toLocaleTimeString()),
      price: new FormControl(data.defaultPrice),
      id: new FormControl(0),
      name: new FormControl(data.name),
      comment: new FormControl(),
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
      DurationUnit: new FormControl(),
      routeid: new FormControl(),
      routes: new FormControl(null),
      unit1: new FormControl(data.unit),
    });
  }

  incrementQuantity(quantity) {
    quantity.quantity++;
  }

  decrementQuantity(quantity) {
    if (quantity.quantity > 1) {
      quantity.quantity--;
    }
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

  async onUpdateServices(){ 
    const hasValuesInAnyFormArray = [
    'orderServices',
    'radiology',
    'medication',
    'Procedurespackages',
    'consultation'
  ].some(formArrayName => (this.createClinicForm.get(formArrayName) as FormArray).length > 0);
  if (this.createClinicForm.valid && hasValuesInAnyFormArray) {
        const medicationData = this.createClinicForm.get('medication').value
            if (medicationData && medicationData.length) {
              this.medicationData = medicationData;
              this.getCycleList();
              this.getRoutes();
              this.getDuration();
              this.modalRef = this.modalService.show(this.medicatedPopup, {
                backdrop: true, ignoreBackdropClick: true, class: 'book-appointment-popup medication-popup'
              });
        } else {
          let orderServices = [];
          
          Object.keys(this.createClinicForm.value).forEach(key => {
            orderServices.push(...this.createClinicForm.value[key]);
          });
          orderServices.map((data) => {
            const { ...row } = data;
            return { ...row }
          });
          await this.dataService.get(`${Modules.getServiceHistory}/${this.Appointment.patientId}`).then((response:any) => {
            const ordersData = response.data[0].orders;
            const ordersDataService = [];
            ordersData.forEach((order)=>{
                ordersDataService.push(...order.orderServices)
            })
            const combinedData = ordersDataService.concat(orderServices)
            const uniqueDataArray = combinedData.reduce((acc, obj) => {
              const existingIndex = acc.findIndex(item => item.name === obj.name);
              if (existingIndex === -1) {
                acc.push(obj);
              } else {
                if (obj.id === 0) {
                  acc[existingIndex] = obj;
                }
              }
              return acc;
            }, []);
            orderServices = uniqueDataArray;
          });
          let payload =orderServices.map(ele => {
            return {
              ...ele,
              cycleId: ele.cycleId?.id,
              routeid: ele.routeid?.id,
              duration:ele.duration == null?0:ele.duration,
              dose:ele.dose == null?0:ele.dose
            }})
          let getData = JSON.parse(sessionStorage.getItem('User'));
          const order = {
            orderServices: payload,
            dateTime: new Date().toISOString(),
            doctor_code: this.Appointment.doctor_Code,
            patientId: this.Appointment.patientId,
            appointmentId: this.Appointment.id,
            id: 0,
            createdBy: getData.id,
            createdDate: new Date().toISOString(),
            updatedBy: this.Appointment.updatedBy,
            updatedDate: this.Appointment.updatedDate,
            comment: this.Appointment.comment,
            patient: null,
            doctors: null,
            physicianId: 0,
            orderPayments: [],
            isPaid: true,
            payment: null,
            caseType: 2,
            admDate: this.Appointment?.patientAdmission?.admDate,
            disDate: this.Appointment?.dischargeDoctor?.end_Date,
            doctor_Name: this.Appointment?.patientAdmission?.attendDoctor?.doctor_Name,
            appointmentDateTime: this.Appointment?.appointmentDateTime,
          };
          this.dataService.post<any>(Modules.CreateOrder, order).then((response:any) => {
            if (response) {
              const payload = [];
                (this.createClinicForm.get('orderServices') as FormArray).clear();
                this.dataService.get(`${Modules.getServiceHistory}/${this.Appointment.patientId}`).then((response:any) => {
                  this.orderData = response;
                  response.data[0].orders[0].orderServices.forEach(element => {
                    let data=this.createClinicForm.value;
                    let id=element.id;
                      payload.push({id,comment: element.comment,desiredTime: element.desiredTime, desiredDate: element.desiredDate})
                  });
                  this.dataService.post(Modules.updateOrderServices , payload,true).then((res) => {  
                  });
                  this.setOrderDetails(this.orderData?.data[0].orders[0].orderServices);
                  this.clinicService.changeTab.next("Patient-Profile")  
                });
                this.clinicService.clearData();
                this.clinicService.clinicOrderDetails = [];
            }
          });
        }
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


async onSaveAndPrint(){
const hasValuesInAnyFormArray = [
  'orderServices',
  'radiology',
  'medication',
  'Procedurespackages',
  'consultation'
].some(formArrayName => (this.createClinicForm.get(formArrayName) as FormArray).length > 0);
if (this.createClinicForm.valid && hasValuesInAnyFormArray) {
    const medicationData = this.createClinicForm.get('medication').value;
    if (medicationData && medicationData.length) {
      this.isSaveAndPrint = true;
      this.medicationData = medicationData;
      this.modalRef = this.modalService.show(this.medicatedPopup, {
        backdrop: true, ignoreBackdropClick: true, class: 'book-appointment-popup medication-popup'
      });
    } else {
      let orderServices = [];
       let printServices=[];   
          Object.keys(this.createClinicForm.value).forEach(key => {
            orderServices.push(...this.createClinicForm.value[key]);
            printServices.push(...this.createClinicForm.value[key]);
          });
          orderServices.map((data) => {
            const { ...row } = data;
            return { ...row }
          });
          await this.dataService.get(`${Modules.getServiceHistory}/${this.Appointment.patientId}`).then((response:any) => {
            const ordersData = response.data[0].orders;
            const ordersDataService = [];
            ordersData.forEach((order)=>{
                ordersDataService.push(...order.orderServices)
            })
            const combinedData = ordersDataService.concat(orderServices)
            const uniqueDataArray = combinedData.reduce((acc, obj) => {
              const existingIndex = acc.findIndex(item => item.name === obj.name);
              if (existingIndex === -1) {
                acc.push(obj);
              } else {
                if (obj.id === 0) {
                  acc[existingIndex] = obj;
                }
              }
              return acc;
            }, []);
            orderServices = uniqueDataArray;
          });
          let payload =orderServices.map(ele => {
            return {
              ...ele,
              cycleId: ele.cycleId?.id,
              routeid: ele.routeid?.id,
              duration:ele.duration == null?0:ele.duration,
              dose:ele.dose == null?0:ele.dose
            }})
      
          
      let getData = JSON.parse(sessionStorage.getItem('User'));
      const order = {
        orderServices: payload,
        dateTime: new Date().toISOString(),
        doctor_code: this.Appointment.doctor_Code,
        patientId: this.Appointment.patientId,
        appointmentId: this.Appointment.id,
        id: 0,
        createdBy: getData.id,
        createdDate: new Date().toISOString(),
        updatedBy: this.Appointment.updatedBy,
        updatedDate: this.Appointment.updatedDate,
        comment: this.Appointment.comment,
        patient: null,
        doctors: null,
        physicianId: 0,
        orderPayments: [],
        isPaid: true,
        payment: null,
        caseType: 2,
        admDate: this.Appointment?.patientAdmission?.admDate,
        disDate: this.Appointment?.dischargeDoctor?.end_Date,
        doctor_Name: this.Appointment?.patientAdmission?.attendDoctor?.doctor_Name,
        appointmentDateTime: this.Appointment?.appointmentDateTime,
      };
      this.dataService.post<any>(Modules.CreateOrder, order, true).then((response:any) => {
        if (response) {
          const payload = []
          this.clinicservice.forEach(element => { element.isSelected = false; });
            (this.createClinicForm.get('orderServices') as FormArray).clear();
            this.dataService.get(`${Modules.getServiceHistory}/${this.Appointment.patientId}`).then((response:any) => {
              this.orderData = response;
              response.data[0].orders[0].orderServices.forEach(element => {
                let id=element.id;
                  payload.push({id,comment: element.comment,desiredTime: element.desiredTime, desiredDate: element.desiredDate})
              });
              this.dataService.post(Modules.updateOrderServices , orderServices,true).then((res) => {
                (this.createClinicForm.get('orderServices') as FormArray).clear();
                this.radiology=[];
                this.Consultation=[];
                this.Procedures_packages=[];
                this.Medication=[];
            //  this.clinicservice?.clear()
                this.clinicService.clinicOrderDetails = [];
              });
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
                })
              }
              this.dataService.post(Modules.updateOrderServices , orderServices,true).then((res) => {
                (this.createClinicForm.get('orderServices') as FormArray).clear();
                this.radiology=[];
                this.Consultation=[];
                this.Procedures_packages=[];
                this.Medication=[];
                this.clinicService.clearData();
                this.clinicService.clinicOrderDetails = [];
              });
              this.setOrderDetails(this.orderData?.data[0].orders[0].orderServices);
            })}
      });
    }
  }
}

  ngOnDestroy(): void {
    this.clinicService.clearData();
    if (this.orderSetSubscription) { this.orderSetSubscription.unsubscribe(); }
  }

}
