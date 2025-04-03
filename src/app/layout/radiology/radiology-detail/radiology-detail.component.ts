import { formatDate } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormGroup, FormArray, FormControl } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { ClinicService } from '@services/clinic.service';
import { DataService } from '@services/data.service';
import { DocumentationService } from '@services/documentation.service';
import { Appointment } from '@services/model/appointment.model';
import { OrderService } from '@services/model/clinic.model';
import { ResourceService } from '@services/resource.service';
import { FixedRoutes, Modules } from '@urls';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { RequestFormComponent } from '../request-form/request-form.component';

@Component({
  selector: 'app-radiology-detail',
  templateUrl: './radiology-detail.component.html',
  styleUrls: ['./radiology-detail.component.scss']
})
export class RadiologyDetailComponent implements OnInit,OnDestroy {
  public loboratory: OrderService[] = [];
  public loboratoryServices: OrderService[] = [];
  public clinicOrderDetails: OrderService[] = [];
  public createServiceForm:FormGroup
  public laboratory:any
  public appointmentData :any;
  public routeSubscription:Subscription;
  public radiologyDetails:Appointment;
  public isReadonly:boolean[] = [];
  public clinicServices: any;
  public orderSetSubscription: Subscription;
  private submitEventSubscription:Subscription;
  private responseData: any;
  @ViewChild('RequestForm') RequestForm: RequestFormComponent;
  @ViewChildren('checboxes') checkboxes: QueryList<ElementRef>;
  private cancelEventSubscription: Subscription;
  

  constructor(private dataService:DataService,public clinicService: ClinicService, public router:Router,private documentationService:DocumentationService,public resourceService:ResourceService) { 
    this.appointmentData = this.router.getCurrentNavigation()?.extras?.state
    this.onRouting();
    this.createServiceForm = new FormGroup({
      Radiology:new FormArray([])
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
      this.createServiceForm.get('Radiology')['controls'] = [];
    });
    this.showPrintPopup();
  }

  ngOnInit(): void {
    this.clinicServiceslist();
    this.isReadonly = new Array(this.createServiceForm.get('Radiology')['controls'].length).fill(false);
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

  

  showPrintPopup(){
    const getData = JSON.parse(sessionStorage.getItem('User'));
    this.orderSetSubscription = this.clinicService.orderSet.subscribe((res) => {
      const radiologyArray = this.createServiceForm.get('Radiology') as FormArray;
      const desireDate = radiologyArray.at(0).get('DesiredDate').value;

      const formattedDesiredDate = this.convertDateFormat(desireDate);
      const labservice={...this.createServiceForm.value,DesiredDate: formattedDesiredDate }
      const orderServices = [];
              Object.keys(this.createServiceForm.value).forEach(key => {
                orderServices.push(...this.createServiceForm.value[key]);
              });
      let payload = labservice.Radiology?.map(ele => { 
        return {
          ...ele,
          cycleId: ele.cycleId,
          routeid: ele.routeid,
          duration:ele.duration == null?0:ele.duration,
          dose:ele.dose == null?0:ele.dose,
          DesiredDate: formattedDesiredDate                                        
        }});
        const ordersDataService = [];
        if(this.appointmentData?.order?.orderServices){
          const isRadPaid=this.appointmentData?.order?.orderServices.every(x=>x.isPaid==false)
          if(isRadPaid){
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
      this.dataService.post(Modules.CreateOrder,order , true).then((res:any)=>{
          (this.createServiceForm.get('Radiology') as FormArray).clear();
          this.clinicService.clinicOrderDetails = [];
          this.RequestForm.showrequestFormPopup(orderServices, this.appointmentData);
          this.checkboxes.forEach((element:ElementRef)=>{
            if(element.nativeElement.checked){
              element.nativeElement.checked = false;
            }
          });
      });
    });
  };

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
    (this.createServiceForm.get('Radiology') as FormArray).clear();
    this.laboratory= this.clinicService.clinicOrderDetails;
    laboratory.forEach((item: OrderService) => {
      (this.createServiceForm.get('Radiology') as FormArray).push(this.createForm(item));
    });
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
        this.loboratory = this.loboratoryServices.filter(d => d.categorization === 'Radiology')
      }
    });
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
      isPaid:new FormControl(false),
      routes: new FormControl(null),
      unit1: new FormControl(data.unit),
      reportStatus :new FormControl(data.ReportStatus)
    });
  }

saveLaboratoryData(){
  const getData=JSON.parse(sessionStorage.getItem('User'))
  if(this.submitEventSubscription){this.submitEventSubscription.unsubscribe();}
  this.submitEventSubscription= this.documentationService.submitEvent.subscribe((res) => {
    const radiologyArray = this.createServiceForm.get('Radiology') as FormArray;
    const desireDate = radiologyArray.at(0).get('DesiredDate').value;

    const formattedDesiredDate = this.convertDateFormat(desireDate);
    const labservice={...this.createServiceForm.value,DesiredDate: formattedDesiredDate }
    let payload = labservice.Radiology?.map(ele => { 
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
        const isRadPaid=this.appointmentData?.order?.orderServices.every(x=>x.isPaid==false)
        if(isRadPaid){
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
    this.dataService.post(Modules.CreateOrder,order).then((res:any)=>{
      this.createServiceForm.get('Radiology').patchValue([]);
      this.clinicService.clinicOrderDetails = [];
      this.router.navigate([`${FixedRoutes.Radiology}`]);
    });
  });
}

onRouting(): void {
  let getData = JSON.parse(sessionStorage.getItem('User'));
  if (this.routeSubscription) { this.routeSubscription.unsubscribe(); }
  this.routeSubscription = this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
    if (this.router.url.indexOf(`/${FixedRoutes.Radiology}/${FixedRoutes.RadiologyDetails}`) !== -1) {
      this.resourceService.currentPatient = null;
      let appointment = <Appointment>(this.router.getCurrentNavigation().extras.state);
      if (appointment) {
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
deleteService(index:number){
  const medicineName = this.createServiceForm.get('Radiology')['value'][index]['name']
  this.createServiceForm.get('Radiology')['controls'].splice(index, 1);
  this.createServiceForm.get('Radiology')['value'].splice(index, 1)
  this.clinicService.clinicOrderDetails.splice(index, 1)
  this.checkboxes.forEach((checkbox: ElementRef) => {
    if (medicineName === checkbox.nativeElement.name && checkbox.nativeElement.checked) {
      checkbox.nativeElement.checked = false;
    }
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
