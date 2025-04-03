import { formatDate } from '@angular/common';
import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import {  NavigationEnd, Router } from '@angular/router';
import { ClinicService } from '@services/clinic.service';
import { DataService } from '@services/data.service';
import { DocumentationService } from '@services/documentation.service';
import { Appointment } from '@services/model/appointment.model';
import { OrderService } from '@services/model/clinic.model';
import { ResourceService } from '@services/resource.service';
import { FixedRoutes, Modules } from '@urls';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { LabRequestFormComponent } from '../lab-request-form/lab-request-form.component';

@Component({
  selector: 'app-laboratory-detail',
  templateUrl: './laboratory-detail.component.html',
  styleUrls: ['./laboratory-detail.component.scss']
})
export class LaboratoryDetailComponent implements OnInit {
  public loboratory: OrderService[] = [];
  public loboratoryServices: OrderService[] = [];
  public clinicOrderDetails: OrderService[] = []
  public createServiceForm:FormGroup
  public laboratory:any
  public appointmentData :any;
  public routeSubscription:Subscription;
  private cancelEventSubscription: Subscription;
  private submitEventSubscription:Subscription;
  public orderSetSubscription: Subscription;
  public isReadonly:boolean[] = [];
  private responseData: any;
  public radiologyDetails:Appointment;
  checkboxValue: boolean[] = [];
  @ViewChildren('checboxes') checkboxes: QueryList<ElementRef>;
  @ViewChild('laboratoryPrint')laboratoryPrint:LabRequestFormComponent;
  
  constructor(private dataService:DataService,public clinicService: ClinicService , public router:Router,private documentationService:DocumentationService, private resourceService:ResourceService) {
    this.appointmentData = this.router.getCurrentNavigation()?.extras?.state
    this.onRouting();
    this.saveandPrintLaboratoryData();
    this.createServiceForm=new FormGroup({
      laboratory:new FormArray([])
    });
    if(this.cancelEventSubscription){this.cancelEventSubscription.unsubscribe()}
    this.cancelEventSubscription= this.documentationService.cancelEvent.subscribe((res:boolean)=>{
      this.checkboxes.forEach((element:ElementRef)=>{
        if(element.nativeElement.checked){
          element.nativeElement.checked = false;
        }
      });
      this.clinicService.clinicOrderDetails = [];
      this.laboratory = [];
      this.createServiceForm.get('laboratory')['controls'] = [];
    });
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
    (this.createServiceForm.get('laboratory') as FormArray).clear();
    this.laboratory= this.clinicService.clinicOrderDetails;
    laboratory.forEach((item: OrderService) => {
      (this.createServiceForm.get('laboratory') as FormArray).push(this.createForm(item));
    });
  }
  ngOnInit(): void {
    this.clinicServiceslist();
    this.isReadonly = new Array(this.createServiceForm.get('laboratory')['controls'].length).fill(false);
  }
 
  clinicServiceslist() {
    this.saveLaboratoryData()
    this.dataService.getData<OrderService[]>(`${Modules.ActiveServices}`).then((response) => {
      if (response && response.length) {
        response.forEach((data: OrderService) => {
          data.isSelected = false;
          data.type = "Services";
          data.serviceId = data.id;
        });
        this.loboratoryServices = response;
        this.loboratory = this.loboratoryServices.filter(d => d.categorization === 'Loboratory')
      }
    });
  }

  convertDateFormat(inputDate?: string): string {
    // Check if inputDate matches the expected format dd-MM-yyyy
    const dateParts = inputDate?.split('-');
    if (dateParts?.length !== 3) {
        console.error('Invalid date format:', inputDate);
        return '';
    }

    const [dayStr, monthStr, yearStr] = dateParts;
    const day = parseInt(dayStr, 10);
    const month = parseInt(monthStr, 10);
    const year = parseInt(yearStr, 10);

    // Check if parsed values are valid
    if (isNaN(day) || isNaN(month) || isNaN(year) || month < 1 || month > 12 || day < 1 || day > 31) {
        console.error('Invalid date values:', { day, month, year });
        return '';
    }

    // Create a Date object
    const date = new Date(year, month - 1, day);

    // Validate the created Date object
    if (date?.getFullYear() !== year || date?.getMonth() !== month - 1 || date?.getDate() !== day) {
        console.error('Invalid date created:', date);
        return '';
    }

    // Format the date into yyyy-MM-dd
    const formattedYear = date.getFullYear();
    const formattedMonth = String(date.getMonth() + 1).padStart(2, '0');
    const formattedDay = String(date.getDate()).padStart(2, '0');

    return `${formattedYear}-${formattedMonth}-${formattedDay}`;
  }
  createForm(data:any){
    return new FormGroup({
      dateTime: new FormControl(new Date().toLocaleString()),
      DesiredDate: new FormControl(formatDate(new Date(), "dd-MM-YYYY", "en-US")),
      DesiredTime: new FormControl(( formatDate(new Date(), "HH:mm:ss", "en-US"))),
      price: new FormControl(data.defaultPrice),
      id: new FormControl(0),
      name: new FormControl(data.name),
      comment: new FormControl(''),
      quantity: new FormControl(1),
      discount: new FormControl(0),
      serviceId: new FormControl(data.id),
      consultationId: new FormControl(''),
      localization: new FormControl(''),
      orderId: new FormControl(this.appointmentData?.id),
      order: new FormControl(''),
      unit: new FormControl(data.unit),
      categorization: new FormControl(data.categorization),
      cycleId: new FormControl(),
      cycles: new FormControl(null),
      dose: new FormControl(),
      duration: new FormControl(),
      duration_Unit: new FormControl(),
      isPaid:new FormControl(false),
      routeid: new FormControl(),
      routes: new FormControl(null),
      unit1: new FormControl(data.unit),
    });
  }

saveLaboratoryData(){
  const getData=JSON.parse(sessionStorage.getItem('User'))
  if(this.submitEventSubscription){this.submitEventSubscription.unsubscribe();}
  this.submitEventSubscription= this.documentationService.submitEvent.subscribe((res:boolean)=>{
    const laboratoryArray = this.createServiceForm.get('laboratory') as FormArray;
    const desireDate = laboratoryArray.at(0).get('DesiredDate').value;

    const formattedDesiredDate = this.convertDateFormat(desireDate);
    const labservice={...this.createServiceForm.value,DesiredDate: formattedDesiredDate }
    let payload = labservice.laboratory.map(ele => {
      return {
        ...ele,
        cycleId: ele.cycleId,
        routeid: ele.routeid,
        duration:ele.duration == null?0:ele.duration,
        dose:ele.dose == null?0:ele.dose,
        orderId:this.appointmentData?.order?.isPaid?0:this.appointmentData?.order?.id||0,
        DesiredDate: formattedDesiredDate
      }});
      const ordersDataService = [];
      if(this.appointmentData?.order?.orderServices){
        // const islabPaid=this.appointmentData?.order?.orderServices.every(x=>x.isPaid==false)
          // if(islabPaid){
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
      // }
      }
    const order = {
       orderServices: payload,
       dateTime: new Date().toISOString(),
       doctor_code: this.appointmentData?.doctor_Code,
       patientId: this.appointmentData?.patientId,
      appointmentId: this.appointmentData?.id,
       id:this.appointmentData?.order?.isPaid?0:this.appointmentData?.order?.id||0,
       createdBy: getData?.id,
       createdDate: new Date().toISOString(),
       updatedBy: getData?.updatedBy,
       updatedDate: new Date().toISOString(),
       comment: this.appointmentData?.comment,
       patient: null,
       doctors: null,
       physicianId: 0,
       orderPayments: [],
       isPaid: false,
       payment: null,
       caseType: 2,
       doctor_Name: this.appointmentData?.doctors?.doctor_Name,
      appointmentDateTime: this.appointmentData?.appointmentDateTime,
    };
    this.dataService.postData(Modules.CreateOrder,order).then((res:any)=>{
      (this.createServiceForm.get('laboratory') as FormArray).clear();
      this.clinicService.clinicOrderDetails = [];
      this.router.navigate([`${FixedRoutes.laboratory}`]);
    })
  })
}
saveandPrintLaboratoryData(){
  const getData=JSON.parse(sessionStorage.getItem('User'))
  this.orderSetSubscription= this.clinicService.orderSet.subscribe((res:boolean)=>{
    const laboratoryArray = this.createServiceForm.get('laboratory') as FormArray;
      const desireDate = laboratoryArray.at(0).get('DesiredDate').value;

      const formattedDesiredDate = this.convertDateFormat(desireDate);
      const labservice={...this.createServiceForm.value,DesiredDate: formattedDesiredDate }
    const orderServices = [];
      Object.keys(this.createServiceForm.value).forEach(key => {
        orderServices.push(...this.createServiceForm.value[key]);
    })
    let payload = labservice.laboratory.map(ele => {
      return {
        ...ele,
        cycleId: ele.cycleId,
        routeid: ele.routeid,
        duration:ele.duration == null?0:ele.duration,
        dose:ele.dose == null?0:ele.dose,
        orderId:this.appointmentData?.order?.id?this.appointmentData?.order?.id:0,
        DesiredDate: formattedDesiredDate
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
       doctor_code: this.appointmentData?.doctor_Code,
       patientId: this.appointmentData?.patientId,
       appointmentId: this.appointmentData?.id,
       id: this.appointmentData?.order?.isPaid?0:this.appointmentData?.order?.id||0,
       createdBy: getData?.id,
       createdDate: new Date().toISOString(),
       updatedBy: getData?.updatedBy,
       updatedDate: new Date().toISOString(),
       comment: this.appointmentData?.comment,
       patient: null,
       doctors: null,
       physicianId: 0,
       orderPayments: [],
       isPaid: false,
       payment: null,
       caseType: 2,
       doctor_Name: this.appointmentData?.doctors?.doctor_Name,
      appointmentDateTime: this.appointmentData?.appointmentDateTime,
    };
    this.dataService.post(Modules.CreateOrder,order, true).then((res:any)=>{
      (this.createServiceForm.get('laboratory') as FormArray).clear();
      this.laboratoryPrint.showrequestFormPopup(orderServices,this.appointmentData);
      this.clinicService.clinicOrderDetails = [];
      this.checkboxes.forEach((element:ElementRef)=>{
        if(element.nativeElement.checked){
          element.nativeElement.checked = false;
        }
      });
    })
  })
}
deleteService(index:number){
  const medicineName = this.createServiceForm.get('laboratory')['value'][index]['name']
  this.createServiceForm.get('laboratory')['controls'].splice(index, 1);
  this.createServiceForm.get('laboratory')['value'].splice(index, 1)
  this.clinicService.clinicOrderDetails.splice(index, 1)
  this.checkboxes.forEach((checkbox: ElementRef) => {
    if (medicineName === checkbox.nativeElement.name && checkbox.nativeElement.checked) {
      checkbox.nativeElement.checked = false;
    }
  });
}
onRouting(): void {
  let getData = JSON.parse(sessionStorage.getItem('User'));
  if (this.routeSubscription) { this.routeSubscription.unsubscribe(); }
  this.routeSubscription = this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
    if (this.router.url.indexOf(`/${FixedRoutes.laboratory}/${FixedRoutes.laboratoryDetails}`) !== -1) {
      this.resourceService.currentPatient = null;
      let appointment = <any>(this.router.getCurrentNavigation().extras.state);
      if (appointment ) {
        this.radiologyDetails = appointment;
        this.resourceService.currentPatient = appointment?.patient;
          this.resourceService.currentPatientData=appointment;
          this.resourceService.currentSpecialities=appointment?.doctors?.specialities;
          // if(!this.resourceService.currentPatient.dateOfBirth){
          //   this.dataService.getData(`${Modules.ByDateRangeAndDocCode}?StartDate=${formatDate(new Date(appointment.appointmentDateTime), "MM-dd-YYYY", "en-Us")}&EndDate=${formatDate(new Date(appointment.appointmentDateTime), "MM-dd-YYYY", "en-Us")}&Hosp_Code=${getData.hosp_Code}&Speciality_Code=${appointment.speciality_Code}&Doctor_Code=${appointment.doctor_Code}`).then((res:any) => {
          //   if(res){
          //     this.responseData=res.appointments.filter((d)=>d.patient.medicalRecordNumber === appointment.patient.medicalRecordNumber)
          //     this.resourceService.currentPatient = this.responseData[0]?.patient;
          //     this.resourceService.currentPatientData=this.responseData[0];
          //     this.appointmentData = this.responseData[0];
          //   this.resourceService.currentSpecialities=this.responseData[0]?.doctors?.specialities;
          //   }
          // })
          // }
      }
    }
    this.routeSubscription.unsubscribe();
  });
}
editList(index){
  this.isReadonly[index] = true;
}

ngOnDestroy(): void {
  if(this.cancelEventSubscription){this.cancelEventSubscription.unsubscribe()}
  if(this.submitEventSubscription){this.submitEventSubscription.unsubscribe();}
  if(this.orderSetSubscription){this.orderSetSubscription.unsubscribe();}
}
}

