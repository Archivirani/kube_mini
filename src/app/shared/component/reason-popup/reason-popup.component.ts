import { Component, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { Appointment } from '@services/model/appointment.model';
import { OrderService } from '@services/model/clinic.model';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'reason-popup',
  templateUrl: './reason-popup.component.html',
  styleUrls: ['./reason-popup.component.scss'],
  providers: [BsModalService]
})
export class ReasonPopupComponent {
  private modalRef: BsModalRef;
  public isDefaultComment: string = "";
  public isValidate = false;
  public configureData: Appointment;

  constructor(private modalService: BsModalService) { }

  @ViewChild('reasonPopup', { static: true }) reasonPopup: TemplateRef<any>;

  @Output() onClose: EventEmitter<any> = new EventEmitter;

  showPopup(data?: Appointment) {
    this.configureData = data;
    this.isDefaultComment = ""
    this.modalRef = this.modalService.show(this.reasonPopup, { backdrop: true, ignoreBackdropClick: false });
  }

  updateReason(event: string) {
    const setData=JSON.parse(sessionStorage.getItem('User'))
    if (this.isDefaultComment) {
      this.onClose.emit({ ...this.configureData,CanceledBy:setData.id, comment: event,canceledDate:new Date().toLocaleTimeString() });
      this.modalRef.hide();
    } else {
      this.isValidate = true;
    }
  }

  closePopup() {
    this.modalRef.hide();
  }
}
