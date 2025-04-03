import { Component, TemplateRef, ViewChild } from '@angular/core';
import { OrderService, PatientDocument } from '@services/model/clinic.model';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'history-popup',
  templateUrl: './history-popup.component.html',
  styleUrls: ['./history-popup.component.scss'],
  providers: [BsModalService]
})
export class HistoryPopupComponent {

  private modalRef: BsModalRef;
  private modalPreviewRef: BsModalRef;
  public isDefaultComment: string;
  public isValidate = false;
  public documents: PatientDocument[] = [];
  public orderServices: OrderService[] = [];
  public documentPreview: PatientDocument;
  private closeSubscription: Subscription;

  constructor(private modalService: BsModalService) { }

  @ViewChild('historyPopup', { static: true }) historyPopup: TemplateRef<any>;
  @ViewChild('faceReading') faceReading: TemplateRef<any>;

  showDocumentPopup(data: PatientDocument[]) {
    this.orderServices = [];
    this.documents = data;
    this.modalRef = this.modalService.show(this.historyPopup, { backdrop: true, ignoreBackdropClick: false, class: 'history-popup' });
  }

  showServicePopup(data: OrderService[]) {
    this.documents = [];
    this.orderServices = data;
    this.modalRef = this.modalService.show(this.historyPopup, { backdrop: true, ignoreBackdropClick: false, class: 'history-popup' });
  }

  closePopup() {
    this.modalRef.hide();
  }

  openPreviewDocument(data: PatientDocument): void {
    this.documentPreview = data;
    this.modalPreviewRef = this.modalService.show(this.faceReading, { backdrop: true, ignoreBackdropClick: false, class: 'preview-popup' });
  }

  closePreviewDocument(): void {
    this.modalPreviewRef.hide();
  }
}
