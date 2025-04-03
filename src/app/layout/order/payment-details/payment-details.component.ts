import { Component, ElementRef, Input, OnInit, QueryList, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ClinicService } from '@services/clinic.service';
import { DataService } from '@services/data.service';
import { OrderService } from '@services/model/clinic.model';
import { FixedRoutes, Modules } from '@urls';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { async, Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { DocumentationService } from '@services/documentation.service';
import { PaymentRequestFormComponent } from '../payment-request-form/payment-request-form.component';

@Component({
  selector: 'app-payment-details',
  templateUrl: './payment-details.component.html',
  styleUrls: ['./payment-details.component.scss']
})
export class PaymentDetailsComponent implements OnInit {
  showPatients = false;
  public loboratory: OrderService[] = [];
  public radiology: OrderService[] = [];
  public clinicServices: any;
  private modalRef: BsModalRef;
  public createClinicForm: FormGroup;
  public Medication: OrderService[] = [];
  public orderServices: OrderService[] = []
  public Procedures_packages: OrderService[] = [];
  public Consultation: OrderService[] = [];
  public orderSetSubscription: Subscription;
  public cancelEventSubscription:Subscription;
  public medicationData: any[]
  public appointmentDetails: any;
  public routesList:any[]=[];
  public DurationList:any[]=[];
  public showServices: boolean = false;
  public cycleList:any[]=[];
  public MedicationUnitList:any[]=[];
  public checkboxValue:boolean[]=[];
  @ViewChildren('checkboxes') checkboxes: QueryList<ElementRef>;
  @ViewChild('paymentRequestForm') requestForm: PaymentRequestFormComponent;

  @ViewChild('medicatedPopup', { static: true }) medicatedPopup: TemplateRef<any>;
  @Input() set Appointment(data) {
    this.appointmentDetails = data;
  };
  @Input() set customData(data: OrderService[]) {
    this.orderServices = data
};
  ngOnInit(): void {
    this.clinicServiceslist();
    this.getMedicattionUnitList();
  }
  showhidePatients() {
    this.showPatients = !this.showPatients;
    this.showServices = false
  }
  showServicesPDF() {
    this.showPatients = false
    this.showServices = !this.showServices

  }
  constructor(public clinicService: ClinicService,private documentationService:DocumentationService, private dataService: DataService, private router: Router, private modalService: BsModalService) {
    this.SaveandPrint();
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

 async SaveandPrint(){
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
          await this.dataService.get(`${Modules.getServiceHistory}/${this.appointmentDetails.patientId}`).then((response:any) => {
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
                doctor_code: this.appointmentDetails.doctor_Code,
                patientId: this.appointmentDetails.patientId,
                appointmentId: this.appointmentDetails.id,
                id: 0,
                createdBy: getData.id,
                createdDate: new Date().toISOString(),
                updatedBy: this.appointmentDetails.updatedBy,
                updatedDate: this.appointmentDetails.updatedDate,
                comment: this.appointmentDetails.comment,
                patient: null,
                doctors: null,
                physicianId: 0,
                orderPayments: [],
                isPaid: false,
                payment: null,
                caseType: 2,
                admDate: this.appointmentDetails?.patientAdmission?.admDate,
                disDate: this.appointmentDetails?.dischargeDoctor?.end_Date,
                doctor_Name: this.appointmentDetails?.patientAdmission?.attendDoctor?.doctor_Name,
                appointmentDateTime: this.appointmentDetails?.appointmentDateTime,
              };
              this.dataService.post<any>(Modules.CreateOrder, order, true).then((response) => {
                if (response) {
                  // this.router.navigate([`${FixedRoutes.Order}`])
                  this.clinicService.clinicOrderDetails = [];
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
                    })
                  }
                }
              });
            }
          }
        }
      }
    });
  
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
        this.Procedures_packages = this.clinicServices.filter(d => d.categorization === 'Procedures and packages');
        this.Consultation = this.clinicServices.filter(d => d.categorization === 'Consultation');
      }
    });
  }
  getMedicattionUnitList(){
    this.dataService.getData(Modules.getMedicationUnit).then((resp:any)=>{
      this.MedicationUnitList=resp;
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

  createForm(data: any) {
    return new FormGroup({
      dateTime: new FormControl(new Date().toISOString()),
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

 async onSave() {
    let getData = JSON.parse(sessionStorage.getItem('User'));
    if (this.createClinicForm.valid) {
      let orderServices = [];
          
      Object.keys(this.createClinicForm.value).forEach(key => {
        orderServices.push(...this.createClinicForm.value[key]);
      });
      orderServices.map((data) => {
        const { ...row } = data;
        return { ...row }
      });
        await this.dataService.get(`${Modules.getServiceHistory}/${this.appointmentDetails.patientId}`).then((response:any) => {
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
      const order = {
        orderServices: payload,
        dateTime: new Date().toISOString(),
        doctor_code: this.appointmentDetails?.doctor_Code,
        caseType:2,
        patientId: this.appointmentDetails.patientId,
        appointmentId: this.appointmentDetails.id,
        id: 0,
        createdBy: getData.id,
        createdDate: new Date().toISOString(),
        updatedBy: this.appointmentDetails.updatedBy,
        updatedDate: this.appointmentDetails.updatedDate,
        comment: this.appointmentDetails.comment,
        patient: null,
        doctors: null,
        physicianId: 0,
        orderPayments: [],
        isPaid: false,
        payment: null,
        admDate: this.appointmentDetails?.patientAdmission?.admDate,
        disDate: this.appointmentDetails?.dischargeDoctor?.end_Date,
        doctor_Name: this.appointmentDetails?.patientAdmission?.attendDoctor?.doctor_Name,
        appointmentDateTime: this.appointmentDetails?.appointmentDateTime,
      };
      this.dataService.post<any>(Modules.CreateOrder, order, true).then((response) => {
        if (response) {
          // this.router.navigate([`${FixedRoutes.Order}`])
          this.clinicService.clearData();
    this.clinicService.clinicOrderDetails = [];

          this.requestForm.showrequestFormPopup(this.createClinicForm.value.orderServices, this.appointmentDetails);
          this.clinicServices.forEach(element => { element.isSelected = false; });
        }
      }).then((res) => {
        this.modalRef.hide();
      });
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

  onclose() {
    this.modalRef.hide()
  }
  ngOnDestroy(): void {
    if (this.orderSetSubscription) { this.orderSetSubscription.unsubscribe(); }
    if(this.cancelEventSubscription){this.cancelEventSubscription.unsubscribe();}
  }
}
