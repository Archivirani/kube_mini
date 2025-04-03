import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Appointment } from '@services/model/appointment.model';
import { PrintService } from '@services/print.service';
import { FixedRoutes } from '@urls';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-lab-request-form',
  templateUrl: './lab-request-form.component.html',
  styleUrls: ['./lab-request-form.component.scss']
})
export class LabRequestFormComponent implements OnInit {
  private modalRef: BsModalRef;
  public configurationData: any;
  public orderService: any[] = [];
  public laboratory: any[] = [];
  public postedBy: any;

  constructor(private modalService: BsModalService, private printService: PrintService,public router:Router) { 
   
  }
  ngOnInit(): void {
  }

  @ViewChild('requestForm', { static: true }) requestForm: TemplateRef<any>;

  @Output() onClose: EventEmitter<any> = new EventEmitter<any>();

  showrequestFormPopup(data: any, patient: Appointment) {
    const getData = JSON.parse(sessionStorage.getItem('User'))
    this.postedBy = getData.username;
    this.configurationData = patient;
    this.laboratory = data
    this.orderService = [{ "name": "loboratory", "data": this.laboratory }]

    this.modalRef = this.modalService.show(this.requestForm, { backdrop: true, ignoreBackdropClick: false, class: 'invoice-popup request-popup' });
  }

  closePopup() {
    this.onClose.emit({ data: this.configurationData })
    this.modalRef.hide();
    this.router.navigate([FixedRoutes.laboratory])

  }

  printDocument() {
    this.printService.print(document.getElementById("invoice-generate").innerHTML)
  }

  
}
