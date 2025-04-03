import { formatDate } from '@angular/common';
import { Component, ElementRef, OnInit, QueryList, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { ClinicService } from '@services/clinic.service';
import { DataService } from '@services/data.service';
import { DocumentationService } from '@services/documentation.service';
import { Appointment } from '@services/model/appointment.model';
import { OrderService } from '@services/model/clinic.model';
import { ResourceService } from '@services/resource.service';
import { FixedRoutes, Modules } from '@urls';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { PharmacyRequestFormComponent } from '../pharmacy-request-form/pharmacy-request-form.component';

@Component({
  selector: 'app-pharmacy-service',
  templateUrl: './pharmacy-service.component.html',
  styleUrls: ['./pharmacy-service.component.scss']
})
export class PharmacyServiceComponent implements OnInit {
  private modalRef: BsModalRef;
  public loboratoryServices: OrderService[] = [];
  public pharmacyServices:OrderService[]=[];
  public pharmacyData:any[]=[];
  public createServiceForm:FormGroup;
  public routeSubscription:Subscription;
  public savePharmacySubmitEvent:Subscription;
  public orderSetSubscription: Subscription;
  private cancelEventSubscription: Subscription;
  public laboratory:any;
  public pharmacyDetails:any;
  public medicationData: any[];
  public routesList:any[]=[];
  public DurationList:any[]=[];
  public cycleList:any[]=[];
  public checkboxValue:boolean[]=[];
  public appointmentData: any;
  public MedicationUnitList:any[]=[];
  @ViewChildren('checboxes') checkboxes: QueryList<ElementRef>;
  @ViewChild('pharmacyPrint')pharmacyPrint:PharmacyRequestFormComponent;
  @ViewChild('medicatedPopup', { static: true }) medicatedPopup: TemplateRef<any>;
  responseData: any;
  constructor(private dataService:DataService,public clinicService:ClinicService,private router:Router,private resourceService:ResourceService,private documentationService:DocumentationService,private modalService: BsModalService) { 
    this.appointmentData = this.router.getCurrentNavigation()?.extras?.state
    this.createServiceForm=new FormGroup({
      pharmacy:new FormArray([])
    });
    if(this.cancelEventSubscription){this.cancelEventSubscription.unsubscribe()}
    this.cancelEventSubscription= this.documentationService.cancelEvent.subscribe((res:boolean)=>{
      this.checkboxes.forEach((element:ElementRef)=>{
        if(element.nativeElement.checked){
          element.nativeElement.checked = false;
        }
      });
      this.clinicService.clinicOrderDetails = [];
      this.pharmacyData = [];
      this.createServiceForm.get('pharmacy')['controls'] = [];
    });
    this.onRouting();
    this.saveandPrintPharmacyData();
  }

  ngOnInit(): void {
    this.clinicServiceslist()
    this.getDuration()
    this.getRoutes()
    this.getCycleList();
    this.getMedicattionUnitList();

  }
  getCheckedService(data:any,event:Event){
    const {checked} = event.target as HTMLInputElement
    let serviceGet={
      ...data,
      isSelected:checked
    }
    this.clinicService.onInsertOrder(serviceGet)
    const laboratory = this.clinicService.clinicOrderDetails.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.id === item.id)
    );
    (this.createServiceForm.get('pharmacy') as FormArray).clear();
    this.pharmacyData= this.clinicService.clinicOrderDetails;
    laboratory.forEach((item: OrderService) => {
      (this.createServiceForm.get('pharmacy') as FormArray).push(this.createForm(item));
    });
  }
  clinicServiceslist() {
    
    this.savePharmacyData()

    this.dataService.getData<OrderService[]>(`${Modules.ActiveServices}`).then((response) => {
      if (response && response.length) {
        response.forEach((data: OrderService) => {
          data.isSelected = false;
          data.type = "Services";
          data.serviceId = data.id;
        });
        this.loboratoryServices = response;
        this.pharmacyServices = this.loboratoryServices.filter(d => d.categorization == "Medication" || d.categorization == "Consumables")
      }
    });
  }
  
  getMedicattionUnitList(){
    this.dataService.getData(Modules.getMedicationUnit).then((resp:any)=>{
      this.MedicationUnitList=resp;
    });
  }

  createForm(data:any){
    return new FormGroup({
      dateTime: new FormControl(new Date().toLocaleString()),
      desiredDate: new FormControl(formatDate(new Date(), "YYYY-MM-dd", "en-US")),
      desiredTime: new FormControl(( formatDate(new Date(), "HH:mm:ss", "en-US"))),
      price: new FormControl(data.defaultPrice),
      id: new FormControl(data.id),
      name: new FormControl(data.name),
      comment: new FormControl(''),
      quantity: new FormControl(1),
      discount: new FormControl(0),
      serviceId: new FormControl(data.id),
      consultationId: new FormControl(''),
      localization: new FormControl(''),
      orderId: new FormControl(this.pharmacyDetails?.order?.id ? this.pharmacyDetails?.order?.id : 0),
      order: new FormControl(''),
      unit: new FormControl(data.unit),
      categorization: new FormControl(data.categorization),
      cycleId: new FormControl(),
      cycles: new FormControl(null),
      dose: new FormControl(data.dose),
      duration: new FormControl(),
      durationUnitId: new FormControl(),
      routeid: new FormControl(),
      routes: new FormControl(null),
      unit1: new FormControl(data.unit1),
    });
  }

  onRouting(): void {
    let getData = JSON.parse(sessionStorage.getItem('User'));
    if (this.routeSubscription) { this.routeSubscription.unsubscribe(); }
    this.routeSubscription = this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      if (this.router.url.indexOf(`/${FixedRoutes.Pharmacy}/${FixedRoutes.PharmacyDetails}`) !== -1) {
        this.resourceService.currentPatient = null;
        let appointment = <Appointment>(this.router.getCurrentNavigation().extras.state);
        if (appointment) {
          this.pharmacyDetails = appointment;
          this.resourceService.currentPatient = appointment?.patient;
          this.resourceService.currentPatientData=appointment;
          this.resourceService.currentSpecialities=appointment?.doctors?.specialities;
          // if(!this.resourceService.currentPatient.dateOfBirth){
          //   this.dataService.getData<Appointment[]>(`${Modules.ByDateRangeAndDocCode}?StartDate=${formatDate(new Date(appointment.appointmentDateTime), "MM-dd-YYYY", "en-Us")}&EndDate=${formatDate(new Date(appointment.appointmentDateTime), "MM-dd-YYYY", "en-Us")}&Hosp_Code=${getData.hosp_Code}&Speciality_Code=${appointment.speciality_Code}&Doctor_Code=${appointment.doctor_Code}`).then((res:any) => {
          //   if(res){
          //     this.responseData=res.appointments.filter((d)=>d.patient.medicalRecordNumber === appointment.patient.medicalRecordNumber)
          //     this.resourceService.currentPatient = this.responseData[0]?.patient;
          //     this.resourceService.currentPatientData=this.responseData[0];
          //     this.pharmacyDetails = this.responseData[0];
          //     this.appointmentData=this.responseData[0];
          //   this.resourceService.currentSpecialities=this.responseData[0]?.doctors?.specialities;
          //   }
          // })
          // }
        }
      }
      
      
      this.routeSubscription.unsubscribe();
    });
  }

  savePharmacyData(){
    if(this.savePharmacySubmitEvent){this.savePharmacySubmitEvent.unsubscribe();}
    this.savePharmacySubmitEvent = this.documentationService.submitEvent.subscribe((res:boolean)=>{
      this.medicationData = this.createServiceForm.get('pharmacy').value;
      this.modalRef = this.modalService.show(this.medicatedPopup, {
        backdrop: true, ignoreBackdropClick: true, class: 'book-appointment-popup medication-popup'
      });
    });
}
saveandPrintPharmacyData(){
  const getData=JSON.parse(sessionStorage.getItem('User'))
  this.orderSetSubscription= this.clinicService.orderSet.subscribe((res:boolean)=>{
    const labservice={...this.createServiceForm.value}
    const orderServices = [];
      Object.keys(this.createServiceForm.value).forEach(key => {
        orderServices.push(...this.createServiceForm.value[key]);
    })
      let payload = labservice.pharmacy.map(ele => {
        return {
          ...ele,
          cycleId: ele.cycleId?.id,
          routeid: ele.routeid?.id,
          duration:ele.duration == null?0:ele.duration,
          dose:ele.dose == null?0:ele.dose,
        }});
        const ordersDataService = this.appointmentData?.order?.orderServices.map(service => {
          const { arabicName,barcode,durationUnit,isPaid,medicationUnit,medicationUnitId, ...rest } = service;
          return rest;
        });
  
        if(this.appointmentData?.order?.orderServices){
          const combinedData = ordersDataService.concat(payload)
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
          payload = uniqueDataArray;
        }
      const order = {
        orderServices: payload,
        dateTime: new Date().toISOString(),
        doctor_code: this.pharmacyDetails?.doctor_Code,
        patientId: this.pharmacyDetails?.patientId,
        appointmentId: this.pharmacyDetails?.id,
        id: this.appointmentData?.order?.isPaid?0:this.appointmentData?.order?.id||0,
        createdBy: getData?.id,
        createdDate: new Date().toISOString(),
        updatedBy: getData?.updatedBy,
        updatedDate: new Date().toISOString(),
        comment: this.pharmacyDetails?.comment,
        patient: null,
        doctors: null,
        physicianId: 0,
        orderPayments: [],
        isPaid: false,
        payment: null,
        caseType: 2,
        doctor_Name: this.pharmacyDetails?.doctors?.doctor_Name,
        appointmentDateTime: this.pharmacyDetails?.appointmentDateTime,
      };
    this.dataService.post(Modules.CreateOrder,order, true).then((res:any)=>{
      (this.createServiceForm.get('pharmacy') as FormArray)?.clear();
      this.pharmacyPrint?.showrequestFormPopup(orderServices,this.appointmentData);
      this.clinicService.clinicOrderDetails = [];
      this.checkboxes.forEach((element:ElementRef)=>{
        if(element.nativeElement.checked){
          element.nativeElement.checked = false;
        }
      });
    })
  })
}
onSave(){
  const getData=JSON.parse(sessionStorage.getItem('User'))
    
      const labservice={...this.createServiceForm.value}
      let payload = labservice.pharmacy.map(ele => {
        return {
          ...ele,
          cycleId: ele.cycleId?.id,
          routeid: ele.routeid?.id,
          duration:ele.duration == null?0:ele.duration,
          dose:ele.dose == null?0:ele.dose
        }});
        const ordersDataService = [];
        if(this.appointmentData?.order?.orderServices){
          ordersDataService.push(...this.appointmentData.order.orderServices)
          const combinedData = ordersDataService.concat(payload)
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
          payload = uniqueDataArray;
        }
      const order = {

         orderServices: payload,
         dateTime: new Date().toISOString(),
         doctor_code: this.pharmacyDetails?.doctor_Code,
         patientId: this.pharmacyDetails?.patientId,
         appointmentId: this.pharmacyDetails?.id,
         id:this.appointmentData?.order?.isPaid?0:this.appointmentData?.order?.id||0,
         createdBy: getData?.id,
         createdDate: new Date().toISOString(),
         updatedBy: getData?.updatedBy,
         updatedDate: new Date().toISOString(),
         comment: this.pharmacyDetails?.comment,
         patient: null,
         doctors: null,
         physicianId: 0,
         orderPayments: [],
         isPaid: false,
         payment: null,
         caseType: 2,
         doctor_Name: this.pharmacyDetails?.doctors?.doctor_Name,
        appointmentDateTime: this.pharmacyDetails?.appointmentDateTime,
      };
      this.dataService.postData(Modules.CreateOrder,order).then((res:any)=>{
          this.createServiceForm.get('pharmacy').patchValue([]);
          this.clinicService.clinicOrderDetails = [];
          this.router.navigate([`${FixedRoutes.Pharmacy}`]);
          this.modalRef.hide()
      });
  }
  onclose(){
    this.modalRef.hide()
  }

  incrementQuantity(quantity) {
    let quantities=quantity.quantity++;
   this.createServiceForm.get('pharmacy').patchValue({
    quantity:quantities
   })
  }

  decrementQuantity(quantity) {
  
    if (quantity?.quantity > 1) {
      let quantities=quantity.quantity--;
      this.createServiceForm.get('pharmacy').patchValue({
        quantity:quantities
       })
    }
  }
  get pharmacy() {
    return this.createServiceForm.get('pharmacy') as FormArray;
  }
  incrementQuantityform(index: number) {
    const quantityControl = (this.pharmacy.controls[index] as FormGroup).get('quantity');
    let currentValue = quantityControl.value || 0;
    quantityControl.setValue(currentValue + 1);
  }
  
  decrementQuantityform(index: number) {
    const quantityControl = (this.pharmacy.controls[index] as FormGroup).get('quantity');
    let currentValue = quantityControl.value || 0;
    if (currentValue > 0) {
      quantityControl.setValue(currentValue - 1);
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
  onDelete(index:number){
    const medicineName = this.createServiceForm.get('pharmacy')['value'][index]['name']
    this.createServiceForm.get('pharmacy')['controls'].splice(index, 1);
    this.createServiceForm.get('pharmacy')['value'].splice(index, 1);
    this.clinicService.clinicOrderDetails.splice(index, 1)
    this.checkboxes.forEach((checkbox: ElementRef) => {
      if (medicineName === checkbox.nativeElement.name && checkbox.nativeElement.checked) {
        checkbox.nativeElement.checked = false;
      }
    });
  }

  ngOnDestroy(){
    if (this.routeSubscription) { this.routeSubscription.unsubscribe(); }
    if(this.savePharmacySubmitEvent){this.savePharmacySubmitEvent.unsubscribe();}
    if(this.orderSetSubscription){this.orderSetSubscription.unsubscribe();}
    if(this.cancelEventSubscription){this.cancelEventSubscription.unsubscribe();}
  }


  
}
