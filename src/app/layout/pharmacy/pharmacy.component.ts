import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ResourceService } from '@services/resource.service';
import { Subscription } from 'rxjs';
import { formatDate } from '@angular/common';
import { DataService } from '@services/data.service';
import { FixedRoutes, Modules } from '@urls';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { SearchPatientPopupComponent } from '@shared/component/search-patient-popup/search-patient-popup.component';
import { ClinicService } from '@services/clinic.service';
import { GlobalSearchFilter } from '@shared/pipes/global-search.pipe';

@Component({
  selector: 'app-pharmacy',
  templateUrl: './pharmacy.component.html',
  styleUrls: ['./pharmacy.component.scss'],
  providers: [GlobalSearchFilter]
})
export class PharmacyComponent implements OnDestroy, OnInit {
  public selectedClinicDateSubscription: Subscription;
  private nextEventSUbscription: Subscription;
  private prevEventSUbscription: Subscription;
  public searchSubscription:Subscription;
  public selectedDate: Date = new Date();
  private modalRef: BsModalRef;
  public medicationData:any;
  public parmacyList:any[]=[];
  public routesList:any[]=[];
  public DurationList:any[]=[];
  public cycleList:any[]=[];
  public MedicationUnitList:any[]=[]
  public searchQuery: string = '';
  public parmacyDataBackUp: any;
  private SearchPatientSUbscription: Subscription;

  public pharmacyForm = new FormGroup({pharmacyArray:new FormArray([])});
  @ViewChild('searchPatient')searchPatient:SearchPatientPopupComponent;
  @ViewChild('pharmacypopup', { static: true }) pharmacypopup: TemplateRef<any>;
  constructor( public resourceService: ResourceService, private globalSearch:GlobalSearchFilter , private dataService: DataService,private modalService: BsModalService,private router: Router, private clinicService:ClinicService) { 
    this.resourceService.dayOnlyAppointmentLabel = `Today`;
    this.resourceService.clinicDate = this.selectedDate;

    if (this.nextEventSUbscription) { this.nextEventSUbscription.unsubscribe(); }
    this.nextEventSUbscription = this.resourceService.nextEvent.subscribe((data: any) => {
      if (data) {
        this.onload(new Date(this.selectedDate.setDate(this.selectedDate.getDate() + 1)));
        this.resourceService.dayOnlyAppointmentLabel = this.getSelectedDate();
        this.resourceService.clinicDate = this.selectedDate;
      }
    });
    if (this.prevEventSUbscription) { this.prevEventSUbscription.unsubscribe(); }
    this.prevEventSUbscription = this.resourceService.prevEvent.subscribe((data: any) => {
      if (data) {
        this.onload(new Date(this.selectedDate.setDate(this.selectedDate.getDate() - 1)));
        this.resourceService.dayOnlyAppointmentLabel = this.getSelectedDate();
        this.resourceService.clinicDate = this.selectedDate;
      }
    });
    if (this.selectedClinicDateSubscription) {this.selectedClinicDateSubscription.unsubscribe();}
    this.selectedClinicDateSubscription = this.resourceService.selectedClinicDate.subscribe((data: Date) => {
      if (data) {
        this.onload(data);
        this.selectedDate = data;
        this.resourceService.dayOnlyAppointmentLabel = this.getSelectedDate();
        this.resourceService.clinicDate = data;
      }
    }); 
    if (this.searchSubscription) { this.searchSubscription.unsubscribe(); }
    this.searchSubscription=this.resourceService.searchQuerySubject.subscribe((res) => {
      const fieldNames = ["patient.medicalRecordNumber","patient.gender","patient.familyName","patient.thirdName","patient.secondName","patient.firstName","doctors.specialities.speciality_desc","doctors.doctor_Name","service.name","service.quantity","service.unit","orderServices.desiredTime"];
      this.parmacyList = this.globalSearch.transform(this.parmacyDataBackUp, res, fieldNames);
    });
    if (this.SearchPatientSUbscription) { this.SearchPatientSUbscription.unsubscribe() };
    this.SearchPatientSUbscription = this.clinicService.submitEvent.subscribe((resp) => { this.searchPatient.showPopup() });
  }


  get formArray() {
    return this.pharmacyForm.get('pharmacyArray') as FormArray;
  }

  showpopup(data){
    this.formArray.controls = [];
    this.medicationData = data;
    data.orderServices.forEach((item) => {this.formArray.push(this.createForm(item))});
    this.modalRef = this.modalService.show(this.pharmacypopup, { backdrop: true, ignoreBackdropClick: true, class: 'book-appointment-popup medication-popup'});
  }

  getSelectedDate() {
    return `${this.convertToFormattedDate(this.selectedDate, "dd MMM, yyyy | EEEE")}` === `${this.convertToFormattedDate(new Date(), "dd MMM, yyyy | EEEE")}` ? 'Today' : `${this.convertToFormattedDate(this.selectedDate, "dd MMM, yyyy | EEEE")}`;
  }
  convertToFormattedDate(date: Date, format: string) {
    return formatDate(date, format, "en-US");
  }

  ngOnInit(): void {
    this.getMedicattionUnitList();
    this.getCycleList();
    this.getRoutes();
    this.getDuration();
  }

  onload(date: Date): void {
    const setData=JSON.parse(sessionStorage.getItem('User'));
      this.dataService.getData<[]>(`${Modules.GetmedicationPatient}?Hosp_Code=${ setData.hosp_Code}&data=${formatDate(date, "MM-dd-YYYY", "en-Us")}`).then((data) => {
        this.parmacyList=data;
        this.parmacyDataBackUp=data;
        this.resourceService.totalRecords.next(this.parmacyList.length);
    });
  }

  onPayment(event,data){
    this.dataService.getData(Modules.getMedicationUnit).then((resp:any)=>{
      this.MedicationUnitList=resp;
    });
    event.stopPropagation();
      const billedServices=data.orderServices.every((d)=>d.isPaid)
      if(billedServices){
      this.router.navigate([`${FixedRoutes.Order}/${FixedRoutes.OrderDetails}`], { state: {...data, allUnitData: this.MedicationUnitList,isPaid:true,allservicesarePaid:true} });
      }else{
      this.router.navigate([`${FixedRoutes.Order}/${FixedRoutes.OrderDetails}`], { state: {...data, allUnitData: this.MedicationUnitList} });
      }
  }
  incrementQuantity(index: number) {
    const quantityControl = (this.formArray.controls[index] as FormGroup).get('quantity');
    let currentValue = quantityControl.value || 0;
    quantityControl.setValue(currentValue + 1);
  }

  decrementQuantity(index: number) {
    const quantityControl = (this.formArray.controls[index] as FormGroup).get('quantity');
    let currentValue = quantityControl.value || 0;
    if (currentValue > 0) {
      quantityControl.setValue(currentValue - 1);
    }
  }

  onclose() {
    this.modalRef.hide();
  }

  getCycleList(){
    this.dataService.getData<[]>(Modules.GetCycles).then((res:any)=>{
      this.cycleList = res;
    })
  }

  getRoutes(){
    this.dataService.getData<[]>(Modules.GetRoutes).then((res)=>{
      this.routesList = res;
    })
  }

  getDuration(){
    this.dataService.getData<[]>(Modules.GetDuration).then((res)=>{
      this.DurationList = res;
    })
  }

  createForm(data: any) {
    let data1 = typeof(data.unit1) == 'string' ? Number(data.unit1) : data.unit1;
    let medicationUnit;
    if(isNaN(data1)) {
      medicationUnit = data.unit1;
    } else {
      medicationUnit = data1;
    }
    return new FormGroup({
      dateTime: new FormControl(new Date().toISOString()),
      DesiredDate: new FormControl(new Date().toLocaleDateString()),
      DesiredTime: new FormControl(new Date().toLocaleTimeString()),
      price: new FormControl(data.price),
      id: new FormControl(data.id),
      name: new FormControl(data.name),
      comment: new FormControl(''),
      quantity: new FormControl(data.quantity),
      discount: new FormControl(0),
      serviceId: new FormControl(data.serviceId),
      consultationId: new FormControl(''),
      localization: new FormControl(''),
      orderId: new FormControl(data.orderId),
      order: new FormControl(''),
      categorization: new FormControl('Medication'),
      unit: new FormControl(data.unit),
      cycleId: new FormControl(data.cycleId),
      cycles: new FormControl(null),
      dose: new FormControl(data.dose),
      duration: new FormControl(data.duration),
      durationUnitId: new FormControl(data.durationUnitId),
      DurationUnit: new FormControl(data.DurationUnit),
      routeid: new FormControl(data.routeid),
      routes: new FormControl(null),
      unit1: new FormControl(data.unit1),
      number:new FormControl(),
      conversionFactor:new FormControl(),
      medicationUnitId:new FormControl(medicationUnit),
      medicationUnitnew:new FormControl(null),
    });
  }
  
  getMedicattionUnitList(){
    this.dataService.getData(Modules.getMedicationUnit).then((resp:any)=>{
      this.MedicationUnitList=resp;
    });
  }

  OnSave(){
    let getData = JSON.parse(sessionStorage.getItem('User'));
    const order = {
      orderServices:this.formArray.value,
      dateTime: new Date().toLocaleString(),
      patientId: this.medicationData.patient.id,
      createBy: getData.id,
      createdDate: new Date().toLocaleString(),
      updatedBy: getData.updatedBy,
      updatedDate:new Date().toLocaleString(),
      comment: this.medicationData.comment,
      appointmentId: this.medicationData.appointmentId,
      id: this.medicationData.id,
      patient: null,
      doctors: null,
      physicianId: 0,
      orderPayments: [],
      medicationUnitId:this.medicationData?.medicationUnitId,
      isPaid: this.medicationData.orderServices[0].isPaid,
      payment: null,
      doctor_Name:this.medicationData.doctors?.doctor_Name,
      doctor_code:this.medicationData.doctor_code
    };

    this.dataService.post<any>(Modules.CreateOrder, order).then((response:any) => {
      this.modalRef.hide();
      this.onload(this.selectedDate);
    });
  }

  ngOnDestroy(): void {
    if(this.selectedClinicDateSubscription){ this.selectedClinicDateSubscription.unsubscribe();}
    if(this.nextEventSUbscription){ this.nextEventSUbscription.unsubscribe();}
    if(this.prevEventSUbscription) {this.prevEventSUbscription.unsubscribe();}
    if(this.SearchPatientSUbscription) {this.SearchPatientSUbscription.unsubscribe();}
  }
}
