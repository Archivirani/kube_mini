import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Appointment } from '@services/model/appointment.model';
import { PrintService } from '@services/print.service';
import { FixedRoutes } from '@urls';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-pharmacy-request-form',
  templateUrl: './pharmacy-request-form.component.html',
  styleUrls: ['./pharmacy-request-form.component.scss']
})
export class PharmacyRequestFormComponent implements OnInit {
  private modalRef: BsModalRef;
  public configurationData: any;
  public orderService: any[] = [];
  public laboratory: any[] = [];
  public postedBy: any;

  @ViewChild('requestForm', { static: true }) requestForm: TemplateRef<any>;
  constructor(private modalService: BsModalService, private printService: PrintService,private router:Router) { }

  ngOnInit(): void {
  }
  @Output() onClose: EventEmitter<any> = new EventEmitter<any>();

  showrequestFormPopup(data: any, patient: Appointment) {
    const getData = JSON.parse(sessionStorage.getItem('User'));
    this.postedBy = getData.username;
    this.configurationData = patient;
    this.laboratory = data;
    this.orderService = [{ "name": "pharmacy", "data": this.laboratory }];

    this.modalRef = this.modalService.show(this.requestForm, { backdrop: true, ignoreBackdropClick: false, class: 'invoice-popup request-popup' });
  }

  closePopup() {
    this.onClose.emit({ data: this.configurationData });
    this.modalRef.hide();
    this.router.navigate([FixedRoutes.Pharmacy])
  }

  printDocument() {
    this.printService.print(document.getElementById("invoice-generate").innerHTML);
  }

}
