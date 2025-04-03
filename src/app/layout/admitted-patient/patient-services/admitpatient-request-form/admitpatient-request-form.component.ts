import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { ClinicService } from '@services/clinic.service';
import { DataService } from '@services/data.service';
import { PrintService } from '@services/print.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-admitpatient-request-form',
  templateUrl: './admitpatient-request-form.component.html',
  styleUrls: ['./admitpatient-request-form.component.scss']
})
export class AdmitpatientRequestFormComponent implements OnInit {
  private modalRef: BsModalRef;
  public configurationData: any;
  public orderService: any[] = [];
  public laboratory: any[] = [];
  public radiology: any[] = [];
  public Medication: any[] = [];
  public postedBy: any;
  constructor(private modalService: BsModalService, private printService: PrintService, public clinicService: ClinicService, private dataService: DataService) { }
  ngOnInit(): void {
  }

  @ViewChild('requestForm', { static: true }) requestForm: TemplateRef<any>;

  @Output() onClose: EventEmitter<any> = new EventEmitter<any>();

  showrequestFormPopup(data: any, patient: any) {
    const getData = JSON.parse(sessionStorage.getItem('User'))
    this.postedBy = getData.username;
    this.configurationData = patient;
    this.laboratory = data.filter(d => d.categorization === 'Loboratory');
    this.radiology = data.filter(d => d.categorization === 'Radiology');
    this.Medication = data.filter(d => d.categorization === 'Medication');
    this.orderService = [{ "name": "loboratory", "data": this.laboratory }, { "name": "radiology", "data": this.radiology }, { "name": "medication", "data": this.Medication }]
    this.modalRef = this.modalService.show(this.requestForm, { backdrop: true, ignoreBackdropClick: false, class: 'invoice-popup request-popup' });
  }

  closePopup() {
    this.onClose.emit({ data: this.configurationData })
    this.modalRef.hide();
  }

  printDocument() {
    this.printService.print(document.getElementById("invoice-generate").innerHTML)
  }

}
