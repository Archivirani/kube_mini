import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { ClinicService } from '@services/clinic.service';
import { DataService } from '@services/data.service';
import { Appointment } from '@services/model/appointment.model';
import { Order, OrderService } from '@services/model/clinic.model';
import { PrintService } from '@services/print.service';
import { Modules } from '@urls';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-payment-request-form',
  templateUrl: './payment-request-form.component.html',
  styleUrls: ['./payment-request-form.component.scss']
})
export class PaymentRequestFormComponent implements OnInit {

  private modalRef: BsModalRef;
  public configurationData: any;
  public orderService: any[] = [];
  public laboratory: any[] = [];
  public radiology: any[] = [];
  public Medication: any[] = [];
  public proc: any[] = [];
  public consultation: any[] = [];
  public postedBy: any;
  public subscription: Subscription;
  public isDisplayConsultation: boolean = false;

  constructor(private modalService: BsModalService, private printService: PrintService, public clinicService: ClinicService, private dataService: DataService) { 
    this.subscription = this.clinicService.displayConsultation.subscribe((resp)=>{
      if(resp){
        this.isDisplayConsultation = true;
      }
    });
  }
  ngOnInit(): void {
  }

  @ViewChild('paymentRequestForm') requestForm: TemplateRef<any>;

  @Output() onClose: EventEmitter<any> = new EventEmitter<any>();

  showrequestFormPopup(data: any, patient: Appointment) {
    const getData = JSON.parse(sessionStorage.getItem('User'))
    this.postedBy = getData.username;
    this.configurationData = patient;
    this.laboratory = data.filter(d => d.categorization === 'Loboratory');
    this.radiology = data.filter(d => d.categorization === 'Radiology');
    this.Medication = data.filter(d => d.categorization === 'Medication');
    this.proc = data.filter(d => d.categorization === 'Procedures and packages');
    this.consultation = data.filter(d => d.categorization === "Consultation");
    this.orderService = [{ "name": "loboratory", "data": this.laboratory }, { "name": "radiology", "data": this.radiology }, { "name": "medication", "data": this.Medication }, { "name": "Procedurespackages", "data": this.proc }, { "name": "Consultation", "data": this.consultation }]
    this.modalRef = this.modalService.show(this.requestForm, { backdrop: true, ignoreBackdropClick: false, class: 'invoice-popup request-popup' });
  }

  closePopup() {
    this.onClose.emit({ data: this.configurationData })
    this.modalRef.hide();
  }

  printDocument() {
    this.printService.print(document.getElementById("invoice-generate").innerHTML)
  }

  ngOnDestroy() {
    if(this.subscription){
      this.subscription.unsubscribe();
    }
  }

}
