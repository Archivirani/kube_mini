import { Component, TemplateRef, ViewChild } from '@angular/core';
import { Order } from '@services/model/clinic.model';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { InvoiceGeneratorComponent } from '../invoice-generator/invoice-generator.component';
import { Patient } from '@services/model/patient.model';
import { DataService } from '@services/data.service';

@Component({
  selector: 'invoice-history-popup',
  templateUrl: './invoice-history-popup.component.html',
  styleUrls: ['./invoice-history-popup.component.scss'],
  providers: [BsModalService]
})
export class InvoiceHistoryPopupComponent {
  private modalRef: BsModalRef;
  public invoiceorders: Order[] = [];

  constructor(private modalService: BsModalService, private dataService: DataService) { }

  @ViewChild("generateInvoice") generateInvoice: InvoiceGeneratorComponent;
  @ViewChild('invoiceHistoryPopup', { static: true }) invoiceHistoryPopup: TemplateRef<any>;

  showPopup(data: Order[]) {
    this.invoiceorders = data;
    this.modalRef = this.modalService.show(this.invoiceHistoryPopup, { backdrop: true, ignoreBackdropClick: false, class: 'history-popup' });
  }

  closePopup() {
    this.modalRef.hide();
  }

  openInvoice(data) {
    this.generateInvoice.showPopup(data);
  }
}
