import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Appointment } from '@services/model/appointment.model';
import { PrintService } from '@services/print.service';
import { FixedRoutes } from '@urls';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'radiology-request-form',
  templateUrl: './request-form.component.html',
  styleUrls: ['./request-form.component.scss']
})
export class RequestFormComponent implements OnInit {
  public modalRef: BsModalRef;
  public configurationData: any;
  public radiology: any[] = [];
  @ViewChild('requestForm', { static: true }) requestForm: TemplateRef<any>;

  constructor( public modalService: BsModalService, private printService: PrintService,private router:Router) { }

  ngOnInit(): void {
  }
  showrequestFormPopup(data, patient: Appointment){
    this.configurationData = patient;
    this.radiology = data.filter(d => d.categorization === 'Radiology');
    this.modalRef = this.modalService.show(this.requestForm, { backdrop: true, ignoreBackdropClick: false, class: 'invoice-popup request-popup' });
  }

  printDocument(){
    this.printService.print(document.getElementById("invoice-generate").innerHTML);
  }
  
  cancel(){
    this.modalService.hide();
    this.router.navigate([FixedRoutes.Radiology])
  }

}