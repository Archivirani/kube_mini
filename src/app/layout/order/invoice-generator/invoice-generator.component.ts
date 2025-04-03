import { Component, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { ClinicService } from '@services/clinic.service';
import { DataService } from '@services/data.service';
import { Order, OrderService } from '@services/model/clinic.model';
import { Patient } from '@services/model/patient.model';
import { PrintService } from '@services/print.service';
import { Modules } from '@urls';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'invoice-generator',
  templateUrl: './invoice-generator.component.html',
  styleUrls: ['./invoice-generator.component.scss'],
  providers: [BsModalService]
})
export class InvoiceGeneratorComponent {
  public getData:any;
  private modalRef: BsModalRef;
  public currency: string = environment.currency;
  public isValidate = false;
  public configurationData: any;
  public orderService: OrderService[] = [];
  public calculation: { amount: number, discount: number, payable: number, balance: number } = { amount: 0, discount: 0, payable: 0, balance: 0 };
  public invoiceConfigurations: { invoiceNumber: number, invoiceDate: Date } = { invoiceNumber: null, invoiceDate: null }
  public invoiceDataList:any[]=[];
  constructor(private modalService: BsModalService, private printService: PrintService, public clinicService: ClinicService ,public dataService:DataService) { }

  @ViewChild('invoiceGenerator', { static: true }) invoiceGenerator: TemplateRef<any>;

  @Output() onClose: EventEmitter<any> = new EventEmitter<any>();


  showPopup(data: any) {
    this.getData=data;
    this.orderService = [];
    this.calculation = { amount: 0, discount: 0, payable: 0, balance: 0 };
    this.calculation.discount = 0;
    this.calculation.amount = 0;
    if (data) {
      this.invoiceConfigurations.invoiceNumber = data.id;
      this.invoiceConfigurations.invoiceDate = new Date(data.createdDate);
      if (data.orderServices && data.orderServices.length) {
        data.orderServices.forEach((item: OrderService) => {
          this.calculation.amount = this.calculation.amount + (item.price * item.quantity);
          if(item.isPaid){
          this.orderService.push(item);
          }
        });
      }
      if (data['orderPayments'] && data['orderPayments'].length) {
        const lastPaymentDetails = data['orderPayments'][data['orderPayments'].length - 1];
        this.calculation.discount = lastPaymentDetails.payment.masterDiscount;
      }
      this.calculation.payable = this.calculation.amount - this.calculation.discount;
    }
    this.configurationData = data;
    this.modalRef = this.modalService.show(this.invoiceGenerator, { backdrop: true, ignoreBackdropClick: false, class: 'invoice-popup' });
     this.getInvoiceData();
  }

  showInvoicePopup(data: Order) {
    this.orderService = [];
    this.calculation = { amount: 0, discount: 0, payable: 0, balance: 0 };
    if (data) {
      this.invoiceConfigurations.invoiceNumber = data.id;
      this.invoiceConfigurations.invoiceDate = new Date(data.createdDate);
      if (data.orderServices && data.orderServices.length) {
        data.orderServices.forEach((item: OrderService) => {
          this.calculation.amount = this.calculation.amount + (item.price * item.quantity);
          this.calculation.discount = this.calculation.discount + this.getPercentageValue((item.price * item.quantity), item.discount);
          this.orderService.push(item);
        });
      }
      this.calculation.payable = this.calculation.amount - this.calculation.discount;
    }
    this.configurationData = data.patient;
    this.modalRef = this.modalService.show(this.invoiceGenerator, { backdrop: true, ignoreBackdropClick: false, class: 'invoice-popup' });
  }

  getInvoiceData(){
    this.dataService.getData<[]>(Modules.getInvoiceData+"/"+this.getData?.orderServices[0].orderId).then((res)=>{
      if(res){
        this.invoiceDataList=res;
      }
    })
  }

  getPercentageValue(total: number, value: number): number {
    return (total * value) / 100;
  }

  closePopup() {
    this.onClose.emit({ data: this.configurationData })
    this.modalRef.hide();
  }

  printDocument() {
    this.printService.print(document.getElementById("invoice-generate").innerHTML)
  }

}
