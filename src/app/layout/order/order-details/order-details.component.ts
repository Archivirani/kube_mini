import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { ClinicService } from '@services/clinic.service';
import { DataService } from '@services/data.service';
import { Appointment } from '@services/model/appointment.model';
import { Order, OrderService, PaymentDetails } from '@services/model/clinic.model';
import { StatusFlags, eMessageIcon, eMessageType } from '@services/model/data.service.model';
import { OrderPayment, VoucherDetails } from '@services/model/order.model';
import { NotificationService } from '@services/notification.service';
import { ResourceService } from '@services/resource.service';
import { EditCommentPopupComponent } from '@shared/component/edit-comment-popup/edit-comment-popup.component';
import { FixedRoutes, Modules } from '@urls';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss']
})
export class OrderDetailsComponent {
  public currency: string = environment.currency;
  public dyForm: FormGroup;
  public appointmentDetails: any;
  public UserTypeId: any;
  public isBilled: boolean = true;
  public orderService: OrderService[] = [];
  public calculation: { amount: number, discount: number, payable: number, balance: number } = { amount: 0, discount: 0, payable: 0, balance: 0 };
  private valueSubscription: Subscription;
  private routeSubscription: Subscription;
  private orderIdList: number[] = [];
  private serviceIdList: any[] = []
  public disabledOptions: boolean = false;
  public isIPadAir = false;
  public clinicServices: OrderService[] = [];
  private confirmationSubscription: Subscription;
  public MedicationUnitList: any[] = []
  orderServicelist: Order;
  public serviceList: any;
  private orderServiceIdList: number[] = [];
  public category: any;
  public serviceData: any;
  public allServicesByCategoryList: any[] = [];
  public getCategoryList: any;
  allOrderedServices: any;
  servicesList: any[] = [];
  public billedData: boolean = false;
  public isFirstClick: boolean = true;
  public isclick : boolean = false
  @HostListener('window:load', ['$event'])
  @HostListener('window:resize', ['$event'])
  onResizeEvent() {
    window.innerWidth < 1260 ? this.isIPadAir = true : this.isIPadAir = false;
  }
  @ViewChild('editCommentPopup') editCommentPopup: EditCommentPopupComponent;

  constructor(private router: Router, private resourceService: ResourceService, private dataService: DataService, public clinicService: ClinicService, private notificationService: NotificationService) {
    this.dyForm = this.createDyForm();
    window.innerWidth < 1260 ? this.isIPadAir = true : this.isIPadAir = false;
    this.valueSubscription = this.dyForm.valueChanges.subscribe((data) => {
      if (data.isCash || data.isCreditCard || data.isVoucher) {
        this.calculation.balance = this.calculation.payable - (data.cashAmount + data.creditCardAmount + data.voucherAmount);
        this.calculation.balance = Math.round((this.calculation.balance + Number.EPSILON) * 100) / 100;
      }
    });
    this.clinicService.getServiceData()
    this.onRouting();
  }
  ngOnInit(): void {
    this.UserTypeId = JSON.parse(sessionStorage.getItem('UserTypeId'));
    this.getCaterogy();
  }

  get formArray() {
    return this.dyForm.get('orderServicelist') as FormArray;
  }

  createDyForm() {
    return new FormGroup({
      isCash: new FormControl(),
      cashAmount: new FormControl(0),
      isCreditCard: new FormControl(),
      creditCardAmount: new FormControl(0),
      creditCardApprovalNumber: new FormControl(),
      isVoucher: new FormControl(),
      voucherAmount: new FormControl(0),
      voucherNumber: new FormControl(),
      orderServicelist: new FormArray([]),
      discount: new FormControl('')
    });
  }

  onRequired(fieldName: string, event: any) {
    this.setResetValidation(fieldName, event.target.checked ? [Validators.required, Validators.min(1)] : null);
  }

  onSetValue(fieldName: string, event: any) {
    this.dyForm.get(fieldName).setValue(event.target.checked)
  }

  setResetValidation(fieldName: string, validators: ValidatorFn[]) {
    if (validators && validators.length) {
      this.dyForm.controls[fieldName].setValidators([Validators.required, Validators.min(1)]);
    } else {
      this.dyForm.controls[fieldName].clearValidators();
    }
    this.dyForm.controls[fieldName].updateValueAndValidity();
  }

  onRouting(): void {
    if (this.routeSubscription) { this.routeSubscription.unsubscribe(); }
    this.routeSubscription = this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      if (this.router.url.indexOf(`/${FixedRoutes.Order}/${FixedRoutes.OrderDetails}`) !== -1) {
        let order = <any>(this.router.getCurrentNavigation().extras.state);
        this.orderServicelist = order;
        
        let getData = JSON.parse(sessionStorage.getItem('User'));
        if (getData.userTypeId === 6 && order?.orderServices && order?.orderServices.length) {
          const isPaidServices = order?.orderServices?.filter((d: any) => !d.isPaid);
          order.orderServices = isPaidServices;
        }
        if (order && order.id) {
          this.resourceService.currentPatient = order.patient;
          this.resourceService.currentPatientData = order;
          if (order) {
            this.orderService = [];
            this.isBilled = order.isPaid;
            this.disabledOptions = false;
            if (order.payment && order.payment.paymentDetails && order.payment.paymentDetails.length) {
              this.disabledOptions = true;
              order.payment.paymentDetails.forEach((payment: PaymentDetails) => {
                switch (payment.paymentType) {
                  case "Cash":
                    this.dyForm.patchValue({ isCash: true, cashAmount: payment.amount });
                    break;
                  case "CreditCard":
                    this.dyForm.patchValue({ isCreditCard: true, creditCardAmount: payment.amount, creditCardApprovalNumber: payment.comment });
                    break;
                  case "Voucher":
                    this.dyForm.patchValue({ isVoucher: true, voucherAmount: payment.amount, voucherNumber: payment.comment });
                    break;
                  case "CreditCard" && "Cash":
                    this.dyForm.patchValue({ isCreditCard: true, creditCardAmount: payment.amount, creditCardApprovalNumber: payment.comment, isCash: true, cashAmount: payment.amount });
                    break;
                }
              });
            }
            this.calculation = { amount: 0, discount: 0, payable: 0, balance: 0 };
            this.calculation.discount = 0;
            if (order.orderServices && order.orderServices.length) {
              order.orderServices.forEach((service: OrderService, index) => {
                this.orderServiceIdList.push(service.id);
                service.price = service.price * service.quantity;
                if ((service.categorization === "Medication") || (service.categorization === "Consumables")) {
                  const medicationData = order.service.find((ele) => { return ele.name == service.name })
                  if (medicationData) {
                    if (medicationData.number && medicationData.conversionFactor) {
                      const number = medicationData.number / medicationData.conversionFactor;
                      service.price = service.price * service.quantity * number;
                    }else {
                      service.price = service.price * service.quantity;
                    }
                  }
                  let stateData = <any>(this.router.getCurrentNavigation().extras.state);
                  let allUnitData = stateData?.allUnitData;
                  const unitData = allUnitData?.find((d) => d.id == medicationData.medicationUnitId)
                  if (unitData) {
                    service.unit = unitData.units;
                  }
                } 
                this.calculation.amount = this.calculation.amount + service.price;
                this.calculation.discount = this.calculation.discount + service.discount;
                service.formatDateTime = new Date(service.dateTime);
                this.orderService.push(service);
                this.formArray.push(this.populateFormControl());
              });
            }
            let appointment = <Appointment>(this.router.getCurrentNavigation().extras.state);
            if (appointment && appointment.id) {
              this.appointmentDetails = appointment;
            }
            this.patchValuedata(this.orderService);
            this.calculation.payable = this.calculation.amount - this.calculation.discount;
            this.calculation.balance = this.calculation.payable
          }
        } else {
          this.router.navigate([FixedRoutes.Order]);
        }
      }
      this.routeSubscription.unsubscribe();
    });
  }

  getPercentageValue(total: number, value: number): number {
    return (total * value) / 100;
  }

  onSubmit() {
    this.saveEditedData(true);
  }

  onSubmitPay() {
    let paymentDetails = [{
      amount: this.dyForm.value.isCash && this.dyForm.value.isCreditCard ? this.dyForm.value.cashAmount + this.dyForm.value.creditCardAmount : this.dyForm.value.isCash ? this.dyForm.value.cashAmount : this.dyForm.value.creditCardAmount,
      comment: this.appointmentDetails?.patient?.comment,
      createdBy: this.appointmentDetails?.createdBy,
      createdDate: new Date().toISOString(),
      id: 0,
      payment: null,
      paymentId: this.appointmentDetails.patientId,
      paymentType: this.dyForm.value.isCash && this.dyForm.value.isCreditCard ? "Cash && Credit Card" : this.dyForm.value.isCash ? "Cash" : this.dyForm.value.isCreditCard ? "Credit Card" : this.dyForm.value.isVoucher ? "Voucher" : "",
      updatedBy: this.appointmentDetails.updatedBy,
      updatedDate: this.appointmentDetails.updatedDate,
      doctor_code: this.appointmentDetails.doctor_code || this.appointmentDetails.doctor_Code,
    }]

    if (this.dyForm.valid) {
      let getData = JSON.parse(sessionStorage.getItem('User'));
      const payload: object = {
        ...{},
        dateTime: new Date().toISOString(),
        orderIdList: this.orderIdList,
        serviceIdList: this.serviceIdList,
        orderServiceIdList: this.orderServiceIdList,
        payment: {
          masterDiscount: this.calculation.discount,
          hosp_Code: getData.hosp_Code,
          createdBy: getData.id,
          createdDate: new Date().toISOString(),
          id: 0,
          updatedBy: this.appointmentDetails.updatedBy,
          updatedDate: this.appointmentDetails.updatedDate,
          paymentDetails: paymentDetails
        }
      };
      this.dataService.post<OrderPayment>(Modules.PaymentOrder, payload).then((resp) => {
        if (resp.status === StatusFlags.Success) { this.router.navigate([FixedRoutes.Order]); }
      });
    } else {
      this.dyForm.markAllAsTouched();
    }
  }

  onCheckValidVoucherNumber() {
    if (this.dyForm.value.voucherNumber && (`${this.dyForm.value.voucherNumber}`).length >= 4) {
      this.dataService.getData<VoucherDetails[]>(`${Modules.VoucherNumber}/${this.dyForm.value.voucherNumber}`).then((response) => {
        this.dyForm.get("voucherAmount").setValue(0);
        if (response && response.length) {
          const responseToCheck = response[0];
          if (responseToCheck.patientId !== this.resourceService.currentPatient.id) {
            this.dataService.notify.next({ key: eMessageType.Error, value: "Voucher number is not valid for this patient", icon: eMessageIcon.Error });
          }
          else {
            this.dyForm.get("voucherAmount").setValue(+responseToCheck.value);
          }
        }
      });
    }
  }

  serachInput(term: any, item: any) {
    term = term ? term.toLowerCase() : '';
    if (item || item.name || item.barcode) {
      return (
        item.name.toLowerCase().includes(term) ||
        item?.barcode?.includes(term)
      );
    };
  }

  populateFormControl(): FormGroup {
    return new FormGroup({
      quantity: new FormControl(1),
      consultationId: new FormControl(0),
      id: new FormControl(0),
      discount: new FormControl(0),
      dateTime: new FormControl(new Date(new Date().toLocaleString())),
      DesiredDate: new FormControl(new Date().toLocaleDateString()),
      DesiredTime: new FormControl(new Date().toLocaleTimeString()),
      name: new FormControl(),
      categorization: new FormControl(),
      order: new FormControl(''),
      price: new FormControl(),
      comment: new FormControl(),
      serviceId: new FormControl(0),
      localization: new FormControl(''),
      orderId: new FormControl(0),
      isNotEdit: new FormControl(false),
      unit: new FormControl(),
    });
  }

  patchValuedata(data: any) {
    if (data && data.length) {
      for (let i = 0; i < this.formArray.length; i++) {
        const defaultPrice = this.clinicService.clinicServices.concat(this.clinicService.clinicConsultation).find(d => d.name === data[i].name); 
        const datavalue = defaultPrice ? defaultPrice.defaultPrice : data[i].price
        this.formArray.controls[i].patchValue({
          discount: data[i].discount !== 0 ? data[i].discount / data[i].price * 100 : 0,
          quantity: data[i].quantity ? data[i].quantity : 1,
          consultationId: data[i].consultationId,
          dateTime: data[i].formatDateTime,
          name: data[i].name,
          categorization: data[i].categorization,
          price: datavalue * data[i].quantity,
          comment: data[i].comment,
          serviceId: data[i].serviceId,
          unit: data[i].unit,
          orderId: data[i].orderId,
          id: data[i].id
        });
       this.getAllServices(data[i].categorization, i);
      }
    }
  }
  onChangeValue(event: any, index: number) {
    const quantity = parseInt(event.target.value);
    const getCurrentDropdownvalue = this.formArray.controls[index].value;
    let result = this.orderService.filter((ele) => {
      return ele.name === getCurrentDropdownvalue.name;
    });
    if (!isNaN(quantity)) {
      var defaultPrice = result[0] ? result[0].price : 0;
      this.formArray.controls[index].patchValue({
        price: quantity * defaultPrice
      });
    } else {
      this.formArray.controls[index].patchValue({
        price: defaultPrice
      });
    }
  }
  deleteService(data: any, index: number) {
    const getData = JSON.parse(sessionStorage.getItem('User'))
    this.dataService.notify.next({ key: eMessageType.Warning, value: "Are you sure you want to delete the Service?", icon: eMessageIcon.Warning });
    if (this.confirmationSubscription) { this.confirmationSubscription.unsubscribe(); };
    this.confirmationSubscription = this.notificationService.confirmationProcess.subscribe((resp) => {
      if (resp) {
        if (data.value.id !== 0) {
          this.dataService.getData(`${Modules.DeleteOrderServiceById}?Id=${data.value.id}&DeletBy=${getData.id}`).then((res) => {
            this.formArray.removeAt(index);
            this.onCalculationAmount();
            this.calculation.balance = this.calculation.payable;
          });
        }
        else {
          this.formArray.removeAt(index);
          this.onCalculationAmount();
        }
      }
    })
  }
  editService(index: number) {
    this.formArray.controls[index].patchValue({
      isNotEdit: true
    });
  }
  add(data: any, index: number) {
    this.dyForm.get('orderServicelist')['controls'][index].patchValue({
      quantity: data.quantity + 1,
      price: this.orderService[index].price * (data.quantity + 1)
    });
    this.calculation.amount = 0;
    this.calculation.discount = 0;
    this.dyForm.get('orderServicelist').value.forEach((element) => {
      this.calculation.amount = this.calculation.amount + element.price;
      this.calculation.discount = this.calculation.discount + (element.discount ? (element.price * element.discount) / 100 : element.discount);
    });
    this.calculation.payable = this.calculation.amount - this.calculation.discount;
    this.balanceCalculation();
  }

  subtract(data: any, index: number) {
    this.dyForm.get('orderServicelist')['controls'][index].patchValue({
      quantity: data.quantity - 1,
      price: this.orderService[index].price * (data.quantity - 1)
    });
    this.calculation.amount = 0;
    this.calculation.discount = 0;
    this.dyForm.get('orderServicelist').value.forEach((element) => {
      this.calculation.amount = this.calculation.amount + element.price;
      this.calculation.discount = this.calculation.discount + (element.discount ? (element.price * element.discount) / 100 : data.discount);
    });
    this.calculation.payable = this.calculation.amount - this.calculation.discount;
    this.balanceCalculation();
  }

  onChangeGlobalDiscount(event: any) {
    const value = event.currentTarget.value;  
    const discount = 0;
    if (value) {
      this.calculation.discount = discount + +(value);
      this.calculation.payable = this.calculation.amount - this.calculation.discount;
      if (this.calculation.discount) {
        for (let i = 0; i < this.formArray.length; i++) {
          this.formArray.controls[i].patchValue({
            discount: 0
          });
        }
      }
    } else {
      this.calculation.discount = 0;
      this.calculation.payable = this.calculation.amount - this.calculation.discount;
    }
    this.balanceCalculation();
  }
  onChangeDiscount() {
    let discount = 0;
    this.calculation.discount = 0;
    const services = this.clinicService.clinicServices.concat(this.clinicService.clinicConsultation);
    this.dyForm.get('orderServicelist').value.forEach((element) => {
      const findService = services.find(d => d.name === element.name);
      discount = discount + this.getPercentageValue((findService.defaultPrice * element.quantity), element.discount);
    });
    this.calculation.payable = this.calculation.amount - discount;
    this.calculation.discount = this.calculation.amount - this.calculation.payable;
    this.balanceCalculation();
  }

  balanceCalculation() {
    this.calculation.balance = 0;
    this.calculation.balance = this.calculation.payable - (this.dyForm.value.cashAmount + this.dyForm.value.creditCardAmount + this.dyForm.value.voucherAmount);
    this.calculation.balance = Math.round((this.calculation.balance + Number.EPSILON) * 100) / 100;
  }

  onCalculationAmount() {
    let discount = 0;
    this.calculation.discount = 0;
    this.calculation.amount = 0;
    this.dyForm.get('orderServicelist').value.forEach((element) => {
      this.calculation.amount = this.calculation.amount + (element.price * element.quantity);
      discount = discount + this.getPercentageValue((element.price * element.quantity), element.discount);
    });
    this.calculation.payable = this.calculation.amount - discount;
    this.calculation.discount = this.calculation.amount - this.calculation.payable;
  }

  editdetails() {
    if (this.formArray.length > 0) {
      if (this.orderServicelist.allservicesarePaid) {
        this.isFirstClick=true
        if(this.isFirstClick && !this.isclick){
          this.formArray.clear();
          this.calculation.amount = 0;
          this.calculation.payable = 0;
          this.calculation.balance = this.calculation.payable
          this.isclick=true;
          // this.orderService.push(this.formArray.controls[this.formArray.length - 1]?.value);
        }
        this.orderService.push(this.formArray.controls[this.formArray.length - 1]?.value);
        // this.calculation.payable = this.calculation.amount - this.calculation.discount;
        // this.calculation.balance = this.calculation.payable;
        this.isFirstClick=false
      }
      this.billedData = true;
      this.formArray.push(this.populateFormControl());
      this.orderService.push(this.formArray.controls[this.formArray.length - 1].value);
    } else {
      this.formArray.push(this.populateFormControl());
    }
  }

  changevalue(event: any, index): void {
    const data = this.clinicService.clinicServices.concat(this.clinicService.clinicConsultation);
    const defaultPrice = data.find(d => d.name === event.name);
    this.formArray.controls[index].patchValue({
      price: defaultPrice?.defaultPrice,
      quantity: 1,
      unit: defaultPrice?.unit,
      serviceId: defaultPrice.serviceId
    });
    this.calculation.amount = 0;
    this.dyForm.get('orderServicelist').value.forEach((element) => {
      this.calculation.amount = this.calculation.amount + element.price;
    });
    this.calculation.payable = this.calculation.amount - this.calculation.discount;
    this.calculation.balance = this.calculation.payable
    if(this.orderService && this.orderService.length){
      this.orderService[index].price = defaultPrice.defaultPrice;
    }
  }

  getCaterogy() {
    this.dataService.getData(`${Modules.getCategorization}`).then((res) => {
      this.getCategoryList = res;
    });
  }

  getAllServices(event?: any, index?) {
    this.dataService.getData(`${Modules.selectAllServicesByCategory}?Category=${event}`).then((res: any) => {
      this.allServicesByCategoryList[index] = res;
      this.serviceList = res;
    });
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) { this.routeSubscription.unsubscribe(); }
    if (this.valueSubscription) { this.valueSubscription.unsubscribe(); }
    if (this.confirmationSubscription) { this.confirmationSubscription.unsubscribe(); };
  }

  async saveEditedData(isPay: boolean) {
    if (this.formArray.valid) {
      if (this.orderServicelist.allservicesarePaid) {
        this.formArray.value.forEach(item => {
        item.orderId = 0;
          this.servicesList.push(item);
        });
        this.allOrderedServices = this.formArray.value;
        this.orderIdList = [];
        // this.appointmentDetails.id = null;
        this.appointmentDetails?.orderServices?.forEach(item => {
          item.orderId = 0;
            this.servicesList.push(item);
          });
      }
      else {
        let orderId=this.appointmentDetails?.orderServices[0]?.orderId ? this.appointmentDetails?.orderServices[0]?.orderId :0 ;
        await this.dataService.getData(`${Modules.OrderServiceOrderById}/${orderId}`).then((res: any) => {
          this.allOrderedServices = res[0].orderServices;
        });
        let orderserviceMap = new Map();
        this.allOrderedServices.forEach(item => {
          orderserviceMap.set(item.id.toString() + item.name.toString(), item);
        });
        this.formArray.value.forEach(item => {
          this.servicesList.push(item);
          if (item.id === 0) {
            orderserviceMap.set(item.id.toString() + (item.name.name.toString()), item);
          } else {
            orderserviceMap.set(item.id.toString() + (item.name.toString()), item);

          }
        });
        this.allOrderedServices = Array.from(orderserviceMap.values());
        this.serviceIdList = []
      }
      const orderServices = this.allOrderedServices.map((data) => {
        this.serviceIdList.push(data.serviceId)
        const { isNotEdit, ...row } = data;
        return { ...row, name: data.name?.name || data.name, price: data.price / data.quantity, discount: data.discount, serviceId: data?.serviceId || data.name?.serviceId }
        // ? (data.price * data.discount) / 100 : data.discount
      });
      let getData = JSON.parse(sessionStorage.getItem('User'));
      const order = {
        orderServices: orderServices,
        dateTime: new Date().toLocaleString(),
        doctor_code: this.appointmentDetails?.doctor_code|| this.appointmentDetails?.doctor_Code,
        patientId: this.appointmentDetails?.patientId ,
        visitId: this.appointmentDetails?.visitId? this.appointmentDetails?.visitId:null,
        id: this.appointmentDetails && 
        this.appointmentDetails.orderServices && 
        this.appointmentDetails.orderServices.length > 0 ? 
        this.appointmentDetails.orderServices[0].orderId : 
        0,
        createdBy: getData.id,
        createdDate: new Date().toLocaleString(),
        updatedBy: this.appointmentDetails?.updatedBy,
        updatedDate: this.appointmentDetails?.updatedDate,
        comment: this.appointmentDetails?.patient?.comment,
        patient: null,
        doctors: null,
        physicianId: 0,
        appointmentId: this.appointmentDetails.appointmentId||0,
        orderPayments: [],
        isPaid: false,
        payment: null,
      };
    
      this.dataService.post<any>(Modules.CreateOrder, order, true).then((response) => {
        if (response) {
          this.orderServicelist = response.data;
          this.appointmentDetails=response.data;
          if (!isPay) {
            Swal.fire({
              title: "Service Saved Successfully",
              icon: 'success',
              showCancelButton: false,
              showConfirmButton: true,
              confirmButtonText: "Ok",
              confirmButtonColor: '#3f7473',
              customClass: {
                container: 'notification-popup'
              }
            }).then((result) => {
              if (result.value) {
                // this.modalRef.hide();
              }
            });
          }
          this.clinicService.clearData();
          let orderId=this.orderServicelist?.orderServices[0]?.orderId
          this.dataService.getData<[]>(Modules.getByOrderId + "/" + orderId).then((data: any) => {
            this.formArray.clear();
            this.calculation.payable = 0;
            this.calculation.amount = 0;
            this.orderServiceIdList=[]
            this.orderService=[];
            data[0].orderServices.forEach((service: OrderService) => {
              const servicesExist =this.servicesList.find((d)=>
                (d.serviceId === service.serviceId));
              if(servicesExist){
                this.orderIdList.push(this.orderServicelist?.orderServices[0]?.orderId);
                service.price = service.price * service.quantity;
                  this.calculation.amount = this.calculation.amount + service.price;
                  service.formatDateTime = new Date(service.dateTime);
                  this.orderServiceIdList.push(service.id)
                  this.orderService.push(service);
                  this.formArray.push(this.populateFormControl());
                  this.patchValuedata(this.orderService);
              }
            });
            this.calculation.payable = this.calculation.amount - this.calculation.discount;
            
            this.calculation.balance = this.calculation.payable;
            if (isPay) {
              this.onSubmitPay();
            }
          })
        }
      });
    }
  } 
}
