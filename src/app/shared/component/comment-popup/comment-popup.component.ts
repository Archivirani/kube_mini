import { Component, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'comment-popup',
  templateUrl: './comment-popup.component.html',
  styleUrls: ['./comment-popup.component.scss'],
  providers: [BsModalService]
})
export class CommentPopupComponent {

  private modalRef: BsModalRef;
  public isValidate = false;
  public configurationData: any;

  constructor(private modalService: BsModalService) { }

  @ViewChild('comment', { static: true }) comment: TemplateRef<any>;

  @Output() onClose: EventEmitter<any> = new EventEmitter;

  showPopup(data: string) {
    this.isValidate = false;
    this.configurationData = data;
    this.modalRef = this.modalService.show(this.comment, { backdrop: true, ignoreBackdropClick: false, class: 'additional-info-temp' });
  }

  updateComment() {
    if (this.configurationData.comment) {
      this.onClose.emit({ data: this.configurationData })
      this.modalRef.hide();
    } else {
      this.isValidate = true;
    }
  }

  closePopup() {
    this.onClose.emit({ data: this.configurationData })
    this.modalRef.hide();
  }
}
