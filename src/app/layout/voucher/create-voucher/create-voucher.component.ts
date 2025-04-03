import {
  Component,
  EventEmitter,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DataService } from '@services/data.service';
import { StatusFlags } from '@services/model/data.service.model';
import { Modules } from '@urls';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'create-voucher',
  templateUrl: './create-voucher.component.html',
  styleUrls: ['./create-voucher.component.scss'],
})
export class CreateVoucherComponent {
  public dyForm: FormGroup;
  private modalRef: BsModalRef;
  @ViewChild('generateVoucher', { static: true })
  generateVoucher: TemplateRef<any>;
  @Output() onclose: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    private modalService: BsModalService,
    private dataService: DataService
  ) { }

  showPopup(data: number) {
    this.dyForm = this.createForm(data);
    this.modalRef = this.modalService.show(this.generateVoucher, {
      backdrop: true,
      ignoreBackdropClick: true,
      class: 'book-appointment-popup',
    });
  }

  createForm(data: number): FormGroup {
    return new FormGroup({
      patientId: new FormControl(data),
      number: new FormControl('', Validators.required),
      value: new FormControl('', Validators.required),
    });
  }

  submitForm() {
    if (this.dyForm.valid) {
      this.dataService
        .post(Modules.Voucher, this.dyForm.value)
        .then((response) => {
          if (response.status === StatusFlags.Success) {
            this.onClose();
          }
        });
    } else {
      this.dyForm.markAllAsTouched();
      this.dyForm.updateValueAndValidity();
    }
  }

  onClose(): void {
    this.onclose.emit(true);
    this.modalRef.hide();
  }
}
