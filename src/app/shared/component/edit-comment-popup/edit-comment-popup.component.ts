import { Component, EventEmitter, Output, TemplateRef, ViewChild } from '@angular/core';
import { OrderService } from '@services/model/clinic.model';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'edit-comment-popup',
  templateUrl: './edit-comment-popup.component.html',
  styleUrls: ['./edit-comment-popup.component.scss'],
  providers: [BsModalService]
})
export class EditCommentPopupComponent {

  private modalRef: BsModalRef;
  public isDefaultComment: string;
  public isValidate = false;
  public configureData: OrderService;

  constructor(private modalService: BsModalService) { }

  @ViewChild('editComment', { static: true }) editComment: TemplateRef<any>;

  @Output() onClose: EventEmitter<any> = new EventEmitter;

  showPopup(data: OrderService) {
    this.isValidate = false;
    if (data) {
      this.configureData = data
      this.isDefaultComment = data.comment;
      this.modalRef = this.modalService.show(this.editComment, { backdrop: true, ignoreBackdropClick: false, class: 'additional-info-temp' });
    }
  }

  updateComment(event: string) {
    if (this.isDefaultComment) {
      this.onClose.emit({ comment: event, data: this.configureData })
      this.modalRef.hide();
    } else {
      this.isValidate = true;
    }
  }

  closePopup() {
    this.modalRef.hide();
  }
}
