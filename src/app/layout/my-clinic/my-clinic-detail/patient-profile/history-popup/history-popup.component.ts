import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { OrderService, PatientDocument } from '@services/model/clinic.model';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { PrintVisitnoteComponent } from '../print-visitnote/print-visitnote.component';
import { GeneralPopupComponent } from '../general-popup/general-popup.component';
import { VisitNotePopupComponent } from '../visit-note-popup/visit-note-popup.component';

@Component({
  selector: 'app-history-popup',
  templateUrl: './history-popup.component.html',
  styleUrls: ['./history-popup.component.scss'],
  providers: [BsModalService]
})
export class HistoryPopupComponent {

  private modalRef: BsModalRef;
  private modalPreviewRef: BsModalRef;
  public isDefaultComment: string;
  public isValidate = false;
  public documents: any[] = [];
  public orderServices: OrderService[] = [];
  public documentPreview: PatientDocument;
  groupedServices: { [orderId: number]: OrderService[] } = [];
  groupedServicesList: { dateTime: string, names: string }[] = [];
  private closeSubscription: Subscription;
  @ViewChild('printVisitnote')printVisitnote:PrintVisitnoteComponent;
  @ViewChild('generalePopup')generalePopup:GeneralPopupComponent;
  @ViewChild('visitNotePopup') visitNotePopup:VisitNotePopupComponent;
  @Output() onCloseevent: EventEmitter<any> = new EventEmitter<any>();
  @Input() Appointmentlist:any;
  constructor(private modalService: BsModalService) { }
  
  @ViewChild('historyPopup', { static: true }) historyPopup: TemplateRef<any>;
  @ViewChild('faceReading') faceReading: TemplateRef<any>;

  showDocumentPopup(data) {
    this.orderServices = [];
    this.documents = data;
    this.modalRef = this.modalService.show(this.historyPopup, { backdrop: true, ignoreBackdropClick: false, class: 'history-popup' });
  }

  onPrintVisitnote(data) {
    this.printVisitnote.showVisitnotePopup(data , this.Appointmentlist);
  }

  // showServicePopup(data: OrderService[]) {
  //   this.documents = [];
  //   this.orderServices = data;
  //   this.modalRef = this.modalService.show(this.historyPopup, { backdrop: true, ignoreBackdropClick: false, class: 'history-popup' });
  // }

  showServicePopup(data: OrderService[]) {
    this.documents = [];
    this.orderServices = data;
    this.groupedServices = this.groupServicesByDate(data);
    this.groupedServicesList = this.formatGroupedServices(this.groupedServices);
    this.modalRef = this.modalService.show(this.historyPopup, { backdrop: true, ignoreBackdropClick: false, class: 'history-popup' });
  }

  groupServicesByDate(services: OrderService[]): { [date: string]: OrderService[] } {
    return services.reduce((acc, service) => {
      const date = service.dateTime.split('T')[0];

      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(service);
      return acc;
    }, {} as { [date: string]: OrderService[] });
  }

  formatGroupedServices(groupedServices: { [date: string]: OrderService[] }): { dateTime: string, names: string }[] {
    return Object.entries(groupedServices).map(([date, services]) => ({
      dateTime: date,
      names: services.map(service => service.name).join(', ')
    }));
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

  onPrintGeneralDocument(data) {
    this.printVisitnote.showVisitnotePopup(data , this.Appointmentlist);
  }

  visitNoteList(data , item?){
    if(data?.type === 'General Document'){
      this.generalePopup?.showPopup(data)
    }else{
      this.visitNotePopup?.showPopup(data,item)

    }
  }
}
