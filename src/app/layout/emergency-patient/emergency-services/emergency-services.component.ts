import { Component, ElementRef, Input, OnInit, QueryList, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ClinicService } from '@services/clinic.service';
import { DataService } from '@services/data.service';
import { OrderService } from '@services/model/clinic.model';
import { FixedRoutes, Modules } from '@urls';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { createServicesComponent } from '../create-services/create-services.component';
import { RequestFormComponent } from '../../my-clinic/request-form/request-form.component';
import Swal from 'sweetalert2';
import { DocumentationService } from '@services/documentation.service';

@Component({
  selector: 'app-emergency-services',
  templateUrl: './emergency-services.component.html',
  styleUrls: ['./emergency-services.component.scss']
})
export class EmergencyServicesComponent implements OnInit {

  public loboratory: OrderService[] = [];
  public radiology: OrderService[] = [];
  public clinicServices: OrderService[] = [];
  showPatients = false;
  private modalRef: BsModalRef;
  public createClinicForm: FormGroup;
  public Medication: OrderService[] = [];
  public orderServices: OrderService[] = []
  public erPackages: OrderService[] = [];
  public Consultation: OrderService[] = [];
  public appointmentDetails: any;
  public orderSetSubscription: Subscription;
  public cancelEventSubscription: Subscription;
  public medicationData: any[]
  public routesList:any[]=[];
  public DurationList:any[]=[];
  public cycleList:any[]=[];
  public checkboxValue:boolean[]=[];
  @ViewChildren('checkboxes') checkboxes: QueryList<ElementRef>;
  @ViewChild('medicatedPopup', { static: true }) medicatedPopup: TemplateRef<any>;
  @ViewChild(createServicesComponent) createServicesComponent: createServicesComponent;
  @ViewChild('requestForm') requestForm: RequestFormComponent;
  @Input() set customData(data: OrderService[]) {
    this.orderServices = data
  };
  @Input() set Appointment(data) {
    this.appointmentDetails = data;
  };
  constructor(public clinicService: ClinicService,private documentationService:DocumentationService, private dataService: DataService, private router: Router, private modalService: BsModalService) {
   this.SaveAndPrint();
   if(this.cancelEventSubscription){this.cancelEventSubscription.unsubscribe();}
    this.cancelEventSubscription= this.documentationService.cancelEvent.subscribe((res:boolean)=>{
      this.checkboxes.forEach((element:ElementRef)=>{
        if(element.nativeElement.checked){
          element.nativeElement.checked = false;
        }
      });
      this.clinicService.clinicOrderDetails = [];
    });
  }

 async SaveAndPrint(){
    if (this.orderSetSubscription) { this.orderSetSubscription.unsubscribe(); }
    this.orderSetSubscription = this.clinicService.orderSet.subscribe(async (resp) => {
      if (!this.showPatients) {
        this.createClinicForm = new FormGroup({ orderServices: new FormArray([]) });
        if (this.orderServices && this.orderServices.length) {
          this.orderServices.forEach((item) => {
            (this.createClinicForm.get('orderServices') as FormArray).push(this.createForm(item));
          });
          if (this.createClinicForm.valid) {
            const medicationData = this.createClinicForm.get('orderServices').value.filter(d => d.categorization === "Medication")
            if (medicationData && medicationData.length) {
              this.getCycleList();
              this.getRoutes();
              this.getDuration();
              this.medicationData = medicationData;
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
              if(this.appointmentDetails?.order)
                {
                await   this.dataService.get(`${Modules.getServiceHistory}/${this.appointmentDetails?.order?.patientId}`).then((response:any) => {
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
                }})
              let getData = JSON.parse(sessionStorage.getItem('User'));
              const order = {
                orderServices: payload,
                dateTime: new Date().toLocaleString(),
                doctor_code: this.appointmentDetails?.specialities?.doctors?.doctor_Code || this.appointmentDetails?.patientAdmission?.attendDoctor_code,
                patientId: this.appointmentDetails?.patientAdmission?.patient?.id,
                visitId: this.appointmentDetails?.visitId,
                id: 0,
                createBy: getData.id,
                createdDate: new Date().toISOString(),
                updatedBy: this.appointmentDetails.updatedBy,
                updatedDate: this.appointmentDetails.updatedDate,
                comment: this.appointmentDetails?.comment,
                patient: null,
                doctors: null,
                physicianId: 0,
                appointmentId: 0,
                orderPayments: [],
                isPaid: true,
                payment: null,
                caseType: this.appointmentDetails.patientAdmission.caseType,
                admDate: this.appointmentDetails.patientAdmission.admDate,
                disDate: this.appointmentDetails.patientAdmission.dischargeDoctor.end_Date,
                doctor_Name: this.appointmentDetails.patientAdmission.attendDoctor.doctor_Name,
              };
              this.dataService.post<any>(Modules.CreateOrder, order,true).then((response) => {
                if (response) {
                  // this.router.navigate([`${FixedRoutes.Order}`])
                  this.clinicService.clinicOrderDetails = [];
                  this.clinicServices.forEach(element => { element.isSelected = false; });
                  let isValid = this.createClinicForm.value.orderServices.some(d => d.categorization == "Medication" || d.categorization == "Radiology" || d.categorization == "Loboratory")
                  if (isValid) {
                    this.clinicServices.forEach(element => { element.isSelected = false; });
                    this.requestForm.showrequestFormPopup(this.createClinicForm.value.orderServices, this.appointmentDetails);
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
                  
                }
              });
            }
          }
        }
      }
    });
  }

  ngOnInit(): void {
    this.clinicServiceslist();
  }
  showhidePatients() {
    this.showPatients = !this.showPatients;
  }

  clinicServiceslist() {
    this.dataService.getData<OrderService[]>(`${Modules.ActiveServices}`).then((response) => {
      if (response && response.length) {
        response.forEach((data: OrderService) => {
          data.isSelected = false;
          data.type = "Services";
          data.serviceId = data.id;
        });
        this.clinicServices = response;
        this.loboratory = this.clinicServices.filter(d => d.categorization === 'Loboratory');
        this.radiology = this.clinicServices.filter(d => d.categorization === 'Radiology');
        this.Medication = this.clinicServices.filter(d => d.categorization === 'Medication');
        this.erPackages = this.clinicServices.filter(d => d.categorization === 'ERPackages');
        this.Consultation = this.clinicServices.filter(d => d.categorization === 'Consultation');
      }
    });
  }
  createForm(data: any) {
    return new FormGroup({
      dateTime: new FormControl(new Date().toLocaleString()),
      DesiredDate: new FormControl(new Date().toLocaleDateString()),
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
      categorization: new FormControl(data.categorization),
      unit: new FormControl(data.unit),
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

  onclose() {
    this.modalRef.hide()
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

async  onSave() {
    if (this.createClinicForm.valid) {
      let orderServices = [];
          
      Object.keys(this.createClinicForm.value).forEach(key => {
        orderServices.push(...this.createClinicForm.value[key]);
      });
      orderServices.map((data) => {
        const { ...row } = data;
        return { ...row }
      });
 await    this.dataService.get(`${Modules.getServiceHistory}/${this.appointmentDetails?.order?.patientId}`).then((response:any) => {
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
        orderServices:payload,
        doctor_Name: this.appointmentDetails?.patientAdmission?.attendDoctor?.doctor_Name,
        dateTime: new Date().toLocaleString(),
        doctor_code: this.appointmentDetails?.specialities?.doctors?.doctor_Code || this.appointmentDetails?.patientAdmission?.attendDoctor_code,
        patientId: this.appointmentDetails.patientAdmission.patientId,
        visitId: this.appointmentDetails.visitId,
        id: 0,
        createBy: getData.id,
        createdDate: new Date().toLocaleString(),
        updatedBy: this.appointmentDetails.updatedBy,
        updatedDate: this.appointmentDetails.updatedDate,
        comment: this.appointmentDetails.patientAdmission.comment,
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
          // this.router.navigate([`${FixedRoutes.Order}`])
          this.requestForm.showrequestFormPopup(this.createClinicForm.value.orderServices, this.appointmentDetails);
          this.clinicService.clearData();
          this.clinicService.clinicOrderDetails = [];
        }
      }).then((res) => {
        this.modalRef.hide();
      });
    }
  }


  ngOnDestroy(): void {
    if (this.orderSetSubscription) { this.orderSetSubscription.unsubscribe(); }
    if(this.cancelEventSubscription){this.cancelEventSubscription.unsubscribe()}
  }

}
